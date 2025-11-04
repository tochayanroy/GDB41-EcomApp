import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    TextInput
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.102:5000';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [updatingQuantity, setUpdatingQuantity] = useState(null);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // API Functions
  const fetchCart = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/cart/getCart`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const token = await getAuthToken();
      const response = await axios.patch(`${API_BASE_URL}/cart/updateCart/${productId}`, 
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      throw error;
    }
  };

  const removeCartItem = async (productId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/cart/removeCart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/cart/clear`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const applyCouponAPI = async (code) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/coupon/apply`, 
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  };

  // Updated moveToWishlistAPI to use watchlist routes
  const moveToWishlistAPI = async (productId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/watchlist/addWatchlist/${productId}`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      throw error;
    }
  };

  // New function to toggle wishlist using the toggle endpoint
  const toggleWishlistAPI = async (productId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/watchlist/toggle/${productId}`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartData = await fetchCart();
      if (cartData && cartData.items) {
        // Transform cart data to match our component structure
        const transformedItems = cartData.items.map(item => ({
          id: item._id,
          productId: item.product?._id,
          name: item.product?.name,
          price: item.product?.price,
          originalPrice: item.product?.price / (1 - (item.product?.discount || 0) / 100),
          image: item.product?.image,
          quantity: item.quantity,
          inStock: item.product?.quantity > 0,
          maxQuantity: item.product?.quantity || 10,
          color: 'Default',
          size: 'Standard'
        }));
        setCartItems(transformedItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const shipping = subtotal > 0 ? (subtotal >= 50 ? 0 : 5.99) : 0;
    
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        discount = (subtotal * appliedCoupon.discount) / 100;
      } else if (appliedCoupon.type === 'fixed') {
        discount = appliedCoupon.discount;
      }
    }

    const tax = (subtotal - discount) * 0.08; // 8% tax
    const total = Math.max(0, subtotal + shipping + tax - discount);

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      discount: discount.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const updateQuantity = async (itemId, productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingQuantity(itemId);
    try {
      await updateCartItemQuantity(productId, newQuantity);
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const removeItem = async (itemId, productId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCartItem(productId);
              setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item from cart');
            }
          }
        }
      ]
    );
  };

  const moveToWishlist = async (item) => {
    Alert.alert(
      'Move to Wishlist',
      `Move "${item.name}" to your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move',
          onPress: async () => {
            try {
              // Use the addWatchlist endpoint to add to wishlist
              await moveToWishlistAPI(item.productId);
              
              // Remove from cart after successful addition to wishlist
              await removeCartItem(item.productId);
              setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== item.id));
              
              Alert.alert('Success', 'Item moved to wishlist successfully!');
            } catch (error) {
              console.error('Error moving to wishlist:', error);
              
              if (error.response?.status === 400 && error.response?.data?.message === 'Product already in watchlist') {
                Alert.alert(
                  'Already in Wishlist', 
                  'This item is already in your wishlist. Removing from cart.',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        // Still remove from cart even if it's already in wishlist
                        await removeCartItem(item.productId);
                        setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== item.id));
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to move item to wishlist');
              }
            }
          }
        }
      ]
    );
  };

  // New function to quickly add to wishlist without removing from cart
  const quickAddToWishlist = async (item) => {
    try {
      // Use the toggle endpoint for quick wishlist addition
      const result = await toggleWishlistAPI(item.productId);
      
      if (result.inWishlist) {
        Alert.alert('Added to Wishlist', `${item.name} has been added to your wishlist!`);
      } else {
        Alert.alert('Removed from Wishlist', `${item.name} has been removed from your wishlist!`);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await applyCouponAPI(couponCode);
      if (result.success) {
        setAppliedCoupon(result.coupon);
        Alert.alert('Success', `Coupon "${result.coupon.code}" applied successfully!`);
      } else {
        Alert.alert('Error', result.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
              setCartItems([]);
              Alert.alert('Success', 'Cart cleared successfully');
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart');
            }
          }
        }
      ]
    );
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Add some items to proceed.');
      return;
    }

    const outOfStockItems = cartItems.filter(item => !item.inStock);
    if (outOfStockItems.length > 0) {
      Alert.alert(
        'Out of Stock Items',
        'Please remove out of stock items before proceeding to checkout.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Proceed to Checkout',
      'Continue to payment and shipping details?',
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Checkout', style: 'default' }
      ]
    );
  };

  const continueShopping = () => {
    // This would typically navigate to home or products screen
    Alert.alert('Continue Shopping', 'Keep browsing our products!');
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
        style={styles.itemImage} 
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.itemAttributes}>
          {item.color && (
            <Text style={styles.attribute}>Color: {item.color}</Text>
          )}
          {item.size && (
            <Text style={styles.attribute}>Size: {item.size}</Text>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
          )}
        </View>

        {!item.inStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        <View style={styles.itemActions}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={[
                styles.quantityButton,
                item.quantity <= 1 && styles.disabledButton
              ]}
              onPress={() => updateQuantity(item.id, item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1 || updatingQuantity === item.id}
            >
              {updatingQuantity === item.id ? (
                <ActivityIndicator size="small" color="#ccc" />
              ) : (
                <Ionicons 
                  name="remove" 
                  size={16} 
                  color={item.quantity <= 1 ? "#ccc" : "#333"} 
                />
              )}
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={[
                styles.quantityButton,
                item.quantity >= item.maxQuantity && styles.disabledButton
              ]}
              onPress={() => updateQuantity(item.id, item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity || updatingQuantity === item.id}
            >
              {updatingQuantity === item.id ? (
                <ActivityIndicator size="small" color="#ccc" />
              ) : (
                <Ionicons 
                  name="add" 
                  size={16} 
                  color={item.quantity >= item.maxQuantity ? "#ccc" : "#333"} 
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.wishlistButton}
              onPress={() => quickAddToWishlist(item)}
            >
              <Ionicons name="heart-outline" size={18} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.moveToWishlistButton}
              onPress={() => moveToWishlist(item)}
            >
              <Ionicons name="heart" size={18} color="#FF6B6B" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeItem(item.id, item.productId)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const totals = calculateTotals();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Looks like you haven't added any items to your cart yet.
        </Text>
        <TouchableOpacity 
          style={styles.continueShoppingButton}
          onPress={continueShopping}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{cartItems.length} items</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.cartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cart Items</Text>
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={styles.clearCartText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.cartItemsList}
          />
        </View>

        {/* Coupon Section */}
        <View style={styles.couponSection}>
          <Text style={styles.sectionTitle}>Apply Coupon</Text>
          <View style={styles.couponContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              editable={!appliedCoupon}
            />
            {appliedCoupon ? (
              <TouchableOpacity 
                style={styles.removeCouponButton}
                onPress={removeCoupon}
              >
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.applyCouponButton,
                  isApplyingCoupon && styles.disabledButton
                ]}
                onPress={applyCoupon}
                disabled={isApplyingCoupon}
              >
                {isApplyingCoupon ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.applyCouponText}>Apply</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          {appliedCoupon && (
            <View style={styles.couponApplied}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.couponAppliedText}>
                Coupon "{appliedCoupon.code}" applied - {appliedCoupon.discount}% off
              </Text>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${totals.subtotal}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {totals.shipping === '0.00' ? 'Free' : `$${totals.shipping}`}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${totals.tax}</Text>
          </View>
          
          {appliedCoupon && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>
                Discount ({appliedCoupon.discount}%)
              </Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                -${totals.discount}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totals.total}</Text>
          </View>

          {totals.shipping !== '0.00' && (
            <View style={styles.shippingNote}>
              <Ionicons name="information-circle" size={14} color="#666" />
              <Text style={styles.shippingNoteText}>
                Add ${(50 - parseFloat(totals.subtotal)).toFixed(2)} more for free shipping
              </Text>
            </View>
          )}
        </View>

        {/* Security Features */}
        <View style={styles.securitySection}>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>Secure checkout</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>Payment protection</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="return-up-back" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>Easy returns</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>${totals.total}</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.checkoutButton,
            cartItems.filter(item => !item.inStock).length > 0 && styles.disabledButton
          ]}
          onPress={proceedToCheckout}
          disabled={cartItems.filter(item => !item.inStock).length > 0}
        >
          <Ionicons name="lock-closed" size={20} color="#fff" />
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  continueShoppingButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  cartSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearCartText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  cartItemsList: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemAttributes: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  attribute: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  outOfStockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  outOfStockText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  disabledButton: {
    backgroundColor: '#f9f9f9',
  },
  quantityText: {
    paddingHorizontal: 15,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  wishlistButton: {
    padding: 8,
    marginRight: 8,
  },
  moveToWishlistButton: {
    padding: 8,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  couponSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  couponContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
  },
  applyCouponButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  removeCouponButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  applyCouponText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeCouponText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F9F0',
    borderRadius: 8,
  },
  couponAppliedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  summarySection: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountLabel: {
    color: '#4CAF50',
  },
  discountValue: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  shippingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  shippingNoteText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  securitySection: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  securityItem: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  footerTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginLeft: 15,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CartScreen;