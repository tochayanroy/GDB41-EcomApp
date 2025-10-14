import { Stack } from 'expo-router';

export default function CheckoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="CheckoutScreen" 
        options={{ title: 'Checkout' }} 
      />
      <Stack.Screen 
        name="PaymentScreen" 
        options={{ title: 'Payment' }} 
      />
      <Stack.Screen 
        name="OrderConfirmationScreen" 
        options={{ title: 'Order Confirmed', headerLeft: () => null }} 
      />
    </Stack>
  );
}