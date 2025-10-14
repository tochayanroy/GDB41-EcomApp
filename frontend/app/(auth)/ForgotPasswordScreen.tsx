import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email input, 2: Code verification, 3: New password
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendResetCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API call to send reset code
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      startCountdown();
      
      Alert.alert(
        'Code Sent',
        `A verification code has been sent to ${email}`,
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);

    // Simulate API call to verify code
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo, accept any 6-digit code
      if (verificationCode.length === 6) {
        setStep(3);
        Alert.alert('Success', 'Code verified successfully');
      } else {
        Alert.alert('Error', 'Invalid verification code');
      }
    }, 1500);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    // Simulate API call to reset password
    setTimeout(() => {
      setIsLoading(false);
      
      Alert.alert(
        'Success!',
        'Your password has been reset successfully.',
        [
          {
            text: 'Sign In',
            onPress: () => {
              // Navigate back to Login screen
              // navigation.navigate('Login');
            }
          }
        ]
      );
    }, 2000);
  };

  const startCountdown = () => {
    setCountdown(60); // 60 seconds countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    
    startCountdown();
    Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '', color: '#e9ecef' };
    if (password.length < 6) return { strength: 1, text: 'Weak', color: '#FF6B6B' };
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strength = 1;
    if (password.length >= 8) strength++;
    if (hasUpperCase && hasLowerCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChar) strength++;
    
    const strengthMap = {
      1: { text: 'Weak', color: '#FF6B6B' },
      2: { text: 'Fair', color: '#FFA726' },
      3: { text: 'Good', color: '#42A5F5' },
      4: { text: 'Strong', color: '#4CAF50' },
      5: { text: 'Very Strong', color: '#2E7D32' }
    };
    
    return strengthMap[strength] || strengthMap[1];
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.steps}>
        <View style={[styles.step, step >= 1 && styles.activeStep]}>
          <Text style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}>1</Text>
        </View>
        <View style={[styles.stepLine, step >= 2 && styles.activeStepLine]} />
        <View style={[styles.step, step >= 2 && styles.activeStep]}>
          <Text style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}>2</Text>
        </View>
        <View style={[styles.stepLine, step >= 3 && styles.activeStepLine]} />
        <View style={[styles.step, step >= 3 && styles.activeStep]}>
          <Text style={[styles.stepNumber, step >= 3 && styles.activeStepNumber]}>3</Text>
        </View>
      </View>
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, step >= 1 && styles.activeStepLabel]}>Enter Email</Text>
        <Text style={[styles.stepLabel, step >= 2 && styles.activeStepLabel]}>Verify Code</Text>
        <Text style={[styles.stepLabel, step >= 3 && styles.activeStepLabel]}>New Password</Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>Enter Your Email</Text>
            <Text style={styles.stepDescription}>
              We'll send a verification code to your email address to reset your password.
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.primaryButton,
                (!email || !validateEmail(email)) && styles.buttonDisabled
              ]}
              onPress={handleSendResetCode}
              disabled={!email || !validateEmail(email) || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.stepTitle}>Check Your Email</Text>
            <Text style={styles.stepDescription}>
              We've sent a 6-digit verification code to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="000000"
                placeholderTextColor="#999"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
                autoFocus
              />
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
              </Text>
              <TouchableOpacity onPress={handleResendCode} disabled={countdown > 0}>
                <Text style={[styles.resendLink, countdown > 0 && styles.resendLinkDisabled]}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[
                styles.primaryButton,
                (!verificationCode || verificationCode.length !== 6) && styles.buttonDisabled
              ]}
              onPress={handleVerifyCode}
              disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify Code</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>Create New Password</Text>
            <Text style={styles.stepDescription}>
              Your new password must be different from previous used passwords.
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="New Password"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthBarContainer}>
                  <View 
                    style={[
                      styles.strengthBar,
                      { 
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm New Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Password Match Indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchIndicator}>
                <Ionicons 
                  name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={newPassword === confirmPassword ? "#4CAF50" : "#FF6B6B"} 
                />
                <Text style={[
                  styles.matchText,
                  { color: newPassword === confirmPassword ? "#4CAF50" : "#FF6B6B" }
                ]}>
                  {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.primaryButton,
                (!newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6) && styles.buttonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        );

      default:
        return null;
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
            onPress={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigation?.goBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150' }}
            style={styles.logo}
          />
          <Text style={styles.screenTitle}>Reset Password</Text>
          <Text style={styles.screenSubtitle}>Follow the steps to secure your account</Text>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <View style={styles.contentContainer}>
          {renderStepContent()}
        </View>

        {/* Back to Login */}
        <TouchableOpacity 
          style={styles.backToLoginButton}
          onPress={() => navigation?.navigate('Login')}
        >
          <Ionicons name="arrow-back" size={16} color="#FF6B6B" />
          <Text style={styles.backToLoginText}>Back to Sign In</Text>
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
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
    zIndex: 1,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginBottom: 15,
    marginTop: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  stepIndicatorContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeStep: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeStepNumber: {
    color: '#fff',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 5,
  },
  activeStepLine: {
    backgroundColor: '#FF6B6B',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
  },
  stepLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  activeStepLabel: {
    color: '#FF6B6B',
  },
  contentContainer: {
    width: '100%',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  emailText: {
    fontWeight: '600',
    color: '#FF6B6B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 56,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  eyeIcon: {
    padding: 5,
  },
  codeInputContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    width: 200,
    height: 60,
    textAlign: 'center',
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
  primaryButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  strengthBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginRight: 10,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 50,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  backToLoginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default ForgotPasswordScreen;