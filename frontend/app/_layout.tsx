import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Store from '../redux/Store';
import { Provider } from 'react-redux';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const segments = useSegments();
  const router = useRouter();

  // Check user session on app start
  useEffect(() => {
    checkUserSession();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      handleRouteProtection();
    }
  }, [segments, isLoading, user]);

  const checkUserSession = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteProtection = () => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/LoginScreen');
    } else if (user) {
      const isAdmin = user.role === 'admin';

      if (isAdmin && !inAdminGroup) {
        // Admin user should be in admin section
        router.replace('/(admin)/AdminDashboard');
      } else if (!isAdmin && inAdminGroup) {
        // Regular user trying to access admin routes
        router.replace('/(tabs)/HomeScreen');
      } else if (user && inAuthGroup) {
        // Authenticated user trying to access auth routes
        if (isAdmin) {
          router.replace('/(admin)/AdminDashboard');
        } else {
          router.replace('/(tabs)/HomeScreen');
        }
      }
    }
  };

  if (isLoading) {
    return null; // Or your loading component
  }

  return (
    <Provider store={Store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="products" options={{ headerShown: false }} />
        <Stack.Screen name="user" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}