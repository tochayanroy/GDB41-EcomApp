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

const { width } = Dimensions.get('window');

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Static cart data
  const staticCartItems = [
    {
      id: '1',
      productId: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 99.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      quantity: 1,
      inStock: true,
      maxQuantity: 10,
      color: 'Black',
      size: 'Standard'
    },
    {
      id: '2',
      productId: '3',
      name: 'Smart Watch Series 5',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      quantity: 2,
      inStock: true,
      maxQuantity: 5,
      color: 'Silver',
      size: '42mm'
    },
    {
      id: '3',
      productId: '7',
      name: 'Wireless Earbuds Pro',
      price: 129.99,
      originalPrice: 159.99,
      image: 'https://images.unsplash.com/photo-1590658165737-15a047b8b5e0?w=300',
      quantity: 1,
      inStock: false,
      maxQuantity: 0,
      color: 'White',
      size: 'Standard'
    },
    {
      id: '4',
      productId: '5',
      name: 'Designer Coffee Mug Set',
      price: 14.99,
      originalPrice: 19.99,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300',
      quantity: 3,
      inStock: true,
      maxQuantity: 20,
      color: 'Ceramic White',
      size: '350ml'
    }
  ];

  // Coupon codes
  const coupons = [
    { code: 'WELCOME10', discount: 10, type: 'percentage', minAmount: 50 },
    { code: 'SUMMER25', discount: 25, type: 'percentage', minAmount: 100 },
    { code: 'FREESHIP', discount: 0, type: 'shipping', minAmount: 30 },
    { code: 'SAVE15', discount: 15, type: 'percentage', minAmount: 75 }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setCartItems(staticCartItems);
      setLoading(false);
    }, 1000);
  }, []);

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

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
          }
        }
      ]
    );
  };

  const moveToWishlist = (item) => {
    Alert.alert(
      'Move to Wishlist',
      `Move "${item.name}" to your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move',
          onPress: () => {
            setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== item.id));
            Alert.alert('Success', 'Item moved to wishlist');
          }
        }
      ]
    );
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    
    // Simulate API call
    setTimeout(() => {
      const coupon = coupons.find(c => c.code === couponCode.toUpperCase());
      
      if (coupon) {
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        if (subtotal >= coupon.minAmount) {
          setAppliedCoupon(coupon);
          Alert.alert('Success', `Coupon "${coupon.code}" applied successfully!`);
        } else {
          Alert.alert('Error', `Minimum order amount of $${coupon.minAmount} required for this coupon`);
        }
      } else {
        Alert.alert('Error', 'Invalid coupon code');
      }
      
      setIsApplyingCoupon(false);
    }, 1000);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
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

  const clearCart = () => {
    if (cartItems.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setCartItems([])
        }
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
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
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
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
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Ionicons 
                name="remove" 
                size={16} 
                color={item.quantity <= 1 ? "#ccc" : "#333"} 
              />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={[
                styles.quantityButton,
                item.quantity >= item.maxQuantity && styles.disabledButton
              ]}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
            >
              <Ionicons 
                name="add" 
                size={16} 
                color={item.quantity >= item.maxQuantity ? "#ccc" : "#333"} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.wishlistButton}
              onPress={() => moveToWishlist(item)}
            >
              <Ionicons name="heart-outline" size={18} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
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
        
        {/* Recently Viewed Suggestions */}
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>You might be interested in</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {staticCartItems.slice(0, 3).map(item => (
              <TouchableOpacity key={item.id} style={styles.suggestionItem}>
                <Image source={{ uri: item.image }} style={styles.suggestionImage} />
                <Text style={styles.suggestionName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.suggestionPrice}>${item.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
            <TouchableOpacity onPress={clearCart}>
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
    marginBottom: 40,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsSection: {
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  suggestionItem: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    height: 32,
  },
  suggestionPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
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