import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="LoginScreen" 
        options={{ 
          title: 'Login',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="RegisterScreen" 
        options={{ 
          title: 'Create Account',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="ForgotPasswordScreen" 
        options={{ 
          title: 'Forgot Password',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="OTPVerificationScreen" 
        options={{ 
          title: 'Verify OTP',
          headerShown: false
        }} 
      />
    </Stack>
  );
}