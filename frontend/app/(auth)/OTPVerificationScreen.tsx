import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.102:5000';

const OTPVerificationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const email = params?.email || '';
  const purpose = params?.purpose || 'account verification';
  const phone = params?.phone;

  useEffect(() => {
    startCountdown();
    // Auto-focus first input
    if (inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0].focus(), 100);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit when all fields are filled
    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerifyOtp();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // API Call to Verify OTP using Axios
  const verifyOtpAPI = async (otpCode) => {
    console.log(otpCode);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/user/verifyEmail`, {
        email: email,
        otp: otpCode
      });

      return { 
        success: true, 
        data: response.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data.message || 'OTP verification failed' 
        };
      } else if (error.request) {
        return { 
          success: false, 
          message: 'Network error. Please check your connection and try again.' 
        };
      } else {
        return { 
          success: false, 
          message: 'An unexpected error occurred. Please try again.' 
        };
      }
    }
  };

  // API Call to Resend OTP using Axios
  const resendOtpAPI = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        email: email
      });

      return { 
        success: true, 
        message: response.data.message || 'OTP sent successfully' 
      };
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      if (error.response) {
        return { 
          success: false, 
          message: error.response.data.message || 'Failed to resend OTP' 
        };
      } else if (error.request) {
        return { 
          success: false, 
          message: 'Network error. Please check your connection and try again.' 
        };
      } else {
        return { 
          success: false, 
          message: 'An unexpected error occurred. Please try again.' 
        };
      }
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    
    if (fullOtp.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (!/^\d{6}$/.test(fullOtp)) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);

    const result = await verifyOtpAPI(fullOtp);

    setIsLoading(false);

    if (result.success) {
      const { auth_token, role } = result.data;
      
      // Store the token (you might want to use AsyncStorage or secure storage)
      // await AsyncStorage.setItem('auth_token', auth_token);
      // await AsyncStorage.setItem('user_role', role);

      const successMessages = {
        'account verification': 'Your account has been verified successfully!',
        'password reset': 'Your identity has been verified. You can now reset your password.',
        'phone verification': 'Your phone number has been verified successfully!',
        'transaction': 'Transaction verified successfully!',
        'default': 'Verification successful!'
      };

      const message = successMessages[purpose] || successMessages.default;
      
      Alert.alert(
        'Success!',
        message,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate based on purpose
              switch (purpose) {
                case 'password reset':
                  router.push({ pathname: './ResetPassword', params: { email } });
                  break;
                case 'account verification':
                  // Navigate to Home screen after successful verification
                  router.replace('../HomeScreen');
                  break;
                default:
                  router.replace('../HomeScreen');
              }
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', result.message);
      // Clear OTP on failure
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);

    const result = await resendOtpAPI();

    setIsLoading(false);

    if (result.success) {
      startCountdown();
      setOtp(['', '', '', '', '', '']);
      
      // Focus first input after resend
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }

      Alert.alert(
        'Code Sent',
        `A new verification code has been sent to ${email}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const getPurposeTitle = () => {
    const titles = {
      'account verification': 'Verify Your Account',
      'password reset': 'Verify Your Identity',
      'phone verification': 'Verify Phone Number',
      'transaction': 'Verify Transaction',
      'default': 'Enter Verification Code'
    };
    return titles[purpose] || titles.default;
  };

  const getPurposeDescription = () => {
    const descriptions = {
      'account verification': `We've sent a 6-digit verification code to your email address. Please enter it below to verify your account.`,
      'password reset': `To reset your password, please enter the 6-digit verification code sent to your email address.`,
      'phone verification': `We've sent a 6-digit verification code to your phone number. Please enter it below to verify your phone.`,
      'transaction': `For security purposes, please enter the 6-digit verification code sent to your registered contact method.`,
      'default': `We've sent a 6-digit verification code to your registered contact method. Please enter it below.`
    };
    return descriptions[purpose] || descriptions.default;
  };

  const formatContactInfo = () => {
    if (phone) {
      return `+${phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}`;
    }
    return email;
  };

  const clearAllInputs = () => {
    setOtp(['', '', '', '', '', '']);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={60} color="#FF6B6B" />
          </View>
          <Text style={styles.screenTitle}>{getPurposeTitle()}</Text>
          <Text style={styles.screenSubtitle}>{getPurposeDescription()}</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfoContainer}>
          <Ionicons 
            name={phone ? "call-outline" : "mail-outline"} 
            size={20} 
            color="#666" 
          />
          <Text style={styles.contactInfoText}>{formatContactInfo()}</Text>
        </View>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Enter 6-digit code</Text>
          
          <View style={styles.otpInputsContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  index === otp.findIndex(d => d === '') && styles.otpInputActive
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </View>

          {/* Clear All Button */}
          {otp.some(digit => digit !== '') && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearAllInputs}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          style={[
            styles.verifyButton,
            otp.join('').length !== 6 && styles.buttonDisabled
          ]}
          onPress={handleVerifyOtp}
          disabled={otp.join('').length !== 6 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.verifyButtonText}>Verify Code</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {/* Resend Code Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
          </Text>
          <TouchableOpacity 
            onPress={handleResendOtp} 
            disabled={!canResend || isLoading}
          >
            <Text style={[
              styles.resendLink,
              (!canResend || isLoading) && styles.resendLinkDisabled
            ]}>
              {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpContainer}>
          <View style={styles.helpItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.helpText}>Code expires in 10 minutes</Text>
          </View>
          <View style={styles.helpItem}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.helpText}>Check spam folder if not received</Text>
          </View>
          <View style={styles.helpItem}>
            <Ionicons name="refresh-outline" size={16} color="#666" />
            <Text style={styles.helpText}>Request new code if expired</Text>
          </View>
        </View>

        {/* Support */}
        <TouchableOpacity style={styles.supportContainer}>
          <Text style={styles.supportText}>Need help? </Text>
          <Text style={styles.supportLink}>Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
    zIndex: 1,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  contactInfoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  otpLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontWeight: '500',
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  otpInputActive: {
    borderColor: '#FF6B6B',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  resendLinkDisabled: {
    color: '#999',
  },
  helpContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  supportContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportText: {
    fontSize: 12,
    color: '#666',
  },
  supportLink: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

export default OTPVerificationScreen;