import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserSession();
  }, []);

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

  if (isLoading) {
    return null; // Or your loading component
  }

  if (user) {
    // Redirect based on user role
    if (user.role === 'admin') {
      return <Redirect href="/(admin)/AdminDashboard" />;
    } else {
      return <Redirect href="/(tabs)/HomeScreen" />;
    }
  } else {
    // No user found, redirect to login
    return <Redirect href="/(auth)/LoginScreen" />;
  }
}