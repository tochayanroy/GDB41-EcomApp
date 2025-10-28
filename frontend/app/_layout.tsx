import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Store from '../redux/Store';
import { Provider } from 'react-redux';

const API_BASE_URL = 'http://192.168.0.101:5000';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const segments = useSegments();
  const router = useRouter();

  // API call to verify token and get user data
  const verifyTokenAndGetUser = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response.data);

      // Fix: Check the actual response structure from your API
      if (response.data && response.data.existUser) {
        return {
          ...response.data.existUser,
          auth_token: token
        };
      }
      return null;
    } catch (error) {
      console.error('Token verification failed:', error);
      // If token is invalid, remove it from storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
      return null;
    }
  };

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
      // Check for auth token first
      const authToken = await AsyncStorage.getItem('auth_token');
      console.log('Auth Token:', authToken);
      
      if (authToken) {
        // Verify token with API and get user data
        const userData = await verifyTokenAndGetUser(authToken);
        
        if (userData) {
          setUser(userData);
          // Also store user data in AsyncStorage for quick access
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Token is invalid, clear storage
          await AsyncStorage.multiRemove(['auth_token', 'user']);
          setUser(null);
        }
      } else {
        // No token found, check if user data exists (legacy)
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          // If user data exists but no token, clear it
          await AsyncStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking user session:', error);
      // Clear any corrupted data
      await AsyncStorage.multiRemove(['auth_token', 'user']);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteProtection = () => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inProductsGroup = segments[0] === 'products';
    const inUserGroup = segments[0] === 'user';
    const inCheckoutGroup = segments[0] === 'checkout';

    console.log('Current segments:', segments);
    console.log('User:', user);

    if (!user) {
      // User not authenticated
      if (!inAuthGroup) {
        console.log('Redirecting to login - no user');
        router.replace('/(auth)/LoginScreen');
      }
    } else {
      // User is authenticated
      const isAdmin = user.role === 'admin';
      console.log('User role:', user.role, 'Is admin:', isAdmin);

      if (isAdmin) {
        // Admin user
        
        if (inAuthGroup) {
          router.replace('./AdminDashboardScreen');
        } else if (!inAdminGroup && !inAuthGroup) {
          router.replace('./AdminDashboardScreen');
        }
      } else {
        // Regular user
        if (inAuthGroup) {
          console.log('Regular user in auth group - redirecting to home');
          router.replace('./HomeScreen');
        } else if (inAdminGroup) {
          console.log('Regular user in admin group - redirecting to home');
          router.replace('./HomeScreen');
        } else if (!inTabsGroup && !inProductsGroup && !inUserGroup && !inCheckoutGroup) {
          console.log('Regular user in unknown group - redirecting to home');
          router.replace('./HomeScreen');
        }
      }
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <Provider store={Store}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </Provider>
    );
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
        
        {/* Add individual screens that might be accessed directly */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}