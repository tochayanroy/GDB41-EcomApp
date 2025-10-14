import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="EditProfileScreen" 
        options={{ title: 'Edit Profile' }} 
      />
      <Stack.Screen 
        name="AddressManagementScreen" 
        options={{ title: 'My Addresses' }} 
      />
      <Stack.Screen 
        name="OrderHistoryScreen" 
        options={{ title: 'Order History' }} 
      />
      <Stack.Screen 
        name="OrderDetailsScreen" 
        options={{ title: 'Order Details' }} 
      />
    </Stack>
  );
}