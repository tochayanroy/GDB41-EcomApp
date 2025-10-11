import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="products" />
        <Stack.Screen name="checkout" />
      </Stack>
    </AuthProvider>
  );
}