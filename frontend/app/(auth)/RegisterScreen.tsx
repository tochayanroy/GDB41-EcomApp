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

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the Terms and Conditions');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      Alert.alert(
        'Success!',
        'Your account has been created successfully.',
        [
          {
            text: 'Continue Shopping',
            onPress: () => {
              // Navigate to Home screen
              // navigation.navigate('Home');
            }
          }
        ]
      );
    }, 2000);
  };

  const handleSocialRegister = (provider) => {
    Alert.alert(
      `${provider} Sign Up`,
      `${provider} registration would be implemented here`,
      [{ text: 'OK' }]
    );
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = () => {
    // navigation.navigate('Login');
    Alert.alert('Login', 'Navigate to Login screen');
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

  const passwordStrength = getPasswordStrength(formData.password);

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
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150' }}
            style={styles.logo}
          />
          <Text style={styles.appName}>ShopEasy</Text>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start shopping today</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Phone Input (Optional) */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Phone Number (Optional)"
              placeholderTextColor="#999"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* Password Strength Indicator */}
          {formData.password.length > 0 && (
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
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
          {formData.confirmPassword.length > 0 && (
            <View style={styles.matchIndicator}>
              <Ionicons 
                name={formData.password === formData.confirmPassword ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={formData.password === formData.confirmPassword ? "#4CAF50" : "#FF6B6B"} 
              />
              <Text style={[
                styles.matchText,
                { color: formData.password === formData.confirmPassword ? "#4CAF50" : "#FF6B6B" }
              ]}>
                {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          )}

          {/* Terms and Conditions */}
          <TouchableOpacity 
            style={styles.termsContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            <View style={[
              styles.checkbox,
              acceptTerms && styles.checkboxChecked
            ]}>
              {acceptTerms && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity 
            style={[
              styles.registerButton,
              (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !acceptTerms) && styles.registerButtonDisabled
            ]}
            onPress={handleRegister}
            disabled={!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !acceptTerms || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.registerButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Register Buttons */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => handleSocialRegister('Google')}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                style={styles.socialIcon}
              />
              <Text style={[styles.socialButtonText, styles.googleButtonText]}>
                Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => handleSocialRegister('Facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              <Text style={[styles.socialButtonText, styles.facebookButtonText]}>
                Facebook
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  logo: {
    width: 70,
    height: 70,
    borderRadius: 18,
    marginBottom: 12,
    marginTop: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  registerButton: {
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
  registerButtonDisabled: {
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  facebookButton: {
    backgroundColor: '#fff',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  googleButtonText: {
    color: '#333',
  },
  facebookButtonText: {
    color: '#333',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

export default RegisterScreen;