import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  Share
} from 'react-native';

const { width, height } = Dimensions.get('window');

const OrderConfirmationScreen = ({ navigation, route }) => {
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  
  const orderData = {
    orderId: 'ORD-784329',
    orderDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    orderTime: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: 'confirmed',
    estimatedDelivery: 'Dec 28, 2024',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    paymentMethod: {
      type: 'Visa',
      last4: '4242',
      amount: 194.61
    },
    items: [
      {
        id: '1',
        name: 'Wireless Bluetooth Headphones',
        price: 99.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150',
        color: 'Black',
        size: 'Standard'
      },
      {
        id: '2',
        name: 'Running Shoes',
        price: 79.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150',
        color: 'Blue/White',
        size: 'US 10'
      },
      {
        id: '3',
        name: 'Smartphone Case',
        price: 14.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=150',
        color: 'Clear',
        size: 'iPhone 15'
      }
    ],
    summary: {
      subtotal: 194.97,
      shipping: 5.99,
      tax: 18.65,
      discount: -25.00,
      total: 194.61
    },
    tracking: {
      number: 'TRK-784329185',
      carrier: 'FedEx',
      status: 'order_placed',
      steps: [
        {
          status: 'order_placed',
          title: 'Order Placed',
          description: 'We have received your order',
          completed: true,
          current: false,
          date: 'Today, 2:30 PM'
        },
        {
          status: 'processing',
          title: 'Processing',
          description: 'Seller is preparing your order',
          completed: false,
          current: true,
          date: 'Estimated: Today, 6:00 PM'
        },
        {
          status: 'shipped',
          title: 'Shipped',
          description: 'Your order is on the way',
          completed: false,
          current: false,
          date: 'Estimated: Dec 24, 2024'
        },
        {
          status: 'delivered',
          title: 'Delivered',
          description: 'Your order has been delivered',
          completed: false,
          current: false,
          date: 'Estimated: Dec 28, 2024'
        }
      ]
    }
  };

  const handleTrackOrder = () => {
    setIsTrackLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsTrackLoading(false);
      Alert.alert(
        'Tracking Started',
        `You can track your order #${orderData.orderId} using the tracking number: ${orderData.tracking.number}`,
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  const handleContinueShopping = () => {
    // navigation.navigate('Home');
    Alert.alert('Continue Shopping', 'Navigating to home screen...');
  };

  const handleViewOrderDetails = () => {
    // navigation.navigate('OrderDetails', { orderId: orderData.orderId });
    Alert.alert('Order Details', `Viewing details for order ${orderData.orderId}`);
  };

  const handleShareOrder = async () => {
    try {
      const message = `I just placed an order on ShopEasy! 🎉\n\nOrder ID: ${orderData.orderId}\nTotal: $${orderData.summary.total}\nExpected Delivery: ${orderData.estimatedDelivery}\n\nTrack my order: ${orderData.tracking.number}`;
      
      await Share.share({
        message: message,
        title: 'My ShopEasy Order'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share order details');
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Would you like to call or email our support team?',
      [
        { text: 'Call Support', onPress: () => Alert.alert('Call', 'Calling support...') },
        { text: 'Email Support', onPress: () => Alert.alert('Email', 'Opening email...') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderOrderItem = (item) => (
    <View key={item.id} style={styles.orderItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemAttributes}>
          {item.color} • {item.size}
        </Text>
        <Text style={styles.itemPrice}>
          ${item.price} × {item.quantity}
        </Text>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderTrackingStep = (step, index) => (
    <View key={step.status} style={styles.trackingStep}>
      <View style={styles.stepIndicator}>
        <View style={[
          styles.stepCircle,
          step.completed && styles.stepCircleCompleted,
          step.current && styles.stepCircleCurrent
        ]}>
          {step.completed ? (
            <Ionicons name="checkmark" size={16} color="#fff" />
          ) : step.current ? (
            <View style={styles.currentStepDot} />
          ) : (
            <View style={styles.pendingStepDot} />
          )}
        </View>
        {index < orderData.tracking.steps.length - 1 && (
          <View style={[
            styles.stepLine,
            step.completed && styles.stepLineCompleted
          ]} />
        )}
      </View>
      <View style={styles.stepInfo}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
        <Text style={styles.stepDate}>{step.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase. Your order has been confirmed.
          </Text>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order ID:</Text>
            <Text style={styles.orderId}> {orderData.orderId}</Text>
          </View>
          <Text style={styles.orderDate}>
            {orderData.orderDate} at {orderData.orderTime}
          </Text>
        </View>

        {/* Delivery Estimate */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <Ionicons name="time-outline" size={24} color="#FF6B6B" />
            <Text style={styles.deliveryTitle}>Estimated Delivery</Text>
          </View>
          <Text style={styles.deliveryDate}>{orderData.estimatedDelivery}</Text>
          <Text style={styles.deliveryNote}>
            We'll send you a notification when your order ships
          </Text>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({orderData.items.length})</Text>
          <View style={styles.orderItemsList}>
            {orderData.items.map(renderOrderItem)}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${orderData.summary.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>${orderData.summary.shipping.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${orderData.summary.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>
              -${Math.abs(orderData.summary.discount).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${orderData.summary.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <View style={styles.addressDetails}>
              <Text style={styles.addressName}>{orderData.shippingAddress.name}</Text>
              <Text style={styles.addressStreet}>{orderData.shippingAddress.street}</Text>
              <Text style={styles.addressCity}>
                {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}
              </Text>
              <Text style={styles.addressCountry}>{orderData.shippingAddress.country}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <Ionicons name="card-outline" size={20} color="#666" />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentType}>{orderData.paymentMethod.type}</Text>
              <Text style={styles.paymentNumber}>•••• {orderData.paymentMethod.last4}</Text>
            </View>
            <Text style={styles.paymentAmount}>${orderData.paymentMethod.amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Order Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Tracking</Text>
          <View style={styles.trackingCard}>
            <View style={styles.trackingHeader}>
              <View>
                <Text style={styles.trackingNumber}>
                  {orderData.tracking.number}
                </Text>
                <Text style={styles.trackingCarrier}>
                  {orderData.tracking.carrier}
                </Text>
              </View>
              <Ionicons name="cube-outline" size={24} color="#FF6B6B" />
            </View>
            
            <View style={styles.trackingSteps}>
              {orderData.tracking.steps.map(renderTrackingStep)}
            </View>
          </View>
        </View>

        {/* Support Card */}
        <View style={styles.supportCard}>
          <Ionicons name="help-buoy-outline" size={32} color="#FF6B6B" />
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            If you have any questions about your order, our support team is here to help.
          </Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleShareOrder}
        >
          <Ionicons name="share-outline" size={20} color="#FF6B6B" />
          <Text style={styles.secondaryButtonText}>Share Order</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleTrackOrder}
          disabled={isTrackLoading}
        >
          <Ionicons name="navigate-outline" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>
            {isTrackLoading ? 'Tracking...' : 'Track Order'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.bottomNavButton}
          onPress={handleViewOrderDetails}
        >
          <Text style={styles.bottomNavText}>View Order Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomNavButton}
          onPress={handleContinueShopping}
        >
          <Text style={styles.bottomNavText}>Continue Shopping</Text>
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
  scrollView: {
    flex: 1,
  },
  successHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  orderDate: {
    fontSize: 14,
    color: '#999',
  },
  deliveryCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  deliveryDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  deliveryNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderItemsList: {
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemAttributes: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: '#999',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
    fontWeight: '500',
    color: '#333',
  },
  discountValue: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressDetails: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  addressStreet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addressCountry: {
    fontSize: 14,
    color: '#666',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  paymentNumber: {
    fontSize: 14,
    color: '#666',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  trackingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  trackingCarrier: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  trackingSteps: {
    marginLeft: 8,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  stepCircleCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepCircleCurrent: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  currentStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  pendingStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: '#f0f0f0',
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepInfo: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  stepDate: {
    fontSize: 12,
    color: '#999',
  },
  supportCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  supportButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B6B',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bottomNavButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bottomNavText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

export default OrderConfirmationScreen;