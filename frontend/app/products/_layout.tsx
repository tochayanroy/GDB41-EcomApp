import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="ProductListingScreen" 
        options={{ title: 'Products' }} 
      />
      <Stack.Screen 
        name="ProductDetailsScreen" 
        options={{ title: 'Product Details' }} 
      />
    </Stack>
  );
}