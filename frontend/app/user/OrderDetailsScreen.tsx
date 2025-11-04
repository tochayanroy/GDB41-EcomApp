import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
    RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.0.102:5000';

const OrderDetailsScreen = () => {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('items');

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
  const fetchOrderDetails = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  };

  const cancelOrder = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  };

  const reorderItems = async () => {
    try {
      const token = await getAuthToken();
      
      // Add all items from order to cart
      const addToCartPromises = order.items.map(item => 
        axios.post(`${API_BASE_URL}/cart/add/${item.product._id}`, 
          { quantity: item.quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      
      await Promise.all(addToCartPromises);
      return true;
    } catch (error) {
      console.error('Error reordering items:', error);
      throw error;
    }
  };

  const getOrderStatusSteps = (status) => {
    const steps = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'We have received your order',
        completed: true,
        current: status === 'pending',
        date: 'Today'
      },
      {
        status: 'confirmed',
        title: 'Confirmed',
        description: 'Order has been confirmed',
        completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status),
        current: status === 'confirmed',
        date: 'Today'
      },
      {
        status: 'processing',
        title: 'Processing',
        description: 'Seller is preparing your order',
        completed: ['processing', 'shipped', 'delivered'].includes(status),
        current: status === 'processing',
        date: 'Estimated: Today'
      },
      {
        status: 'shipped',
        title: 'Shipped',
        description: 'Your order is on the way',
        completed: ['shipped', 'delivered'].includes(status),
        current: status === 'shipped',
        date: 'Estimated: Tomorrow'
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered',
        completed: status === 'delivered',
        current: status === 'delivered',
        date: 'Delivered'
      },
      {
        status: 'cancelled',
        title: 'Cancelled',
        description: 'Order has been cancelled',
        completed: status === 'cancelled',
        current: status === 'cancelled',
        date: 'Cancelled'
      }
    ];
    return steps;
  };

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      const orderDetails = await fetchOrderDetails();
      
      // Transform API data to match component structure
      const transformedData = {
        _id: orderDetails._id,
        orderNumber: orderDetails.orderNumber || `ORD-${orderDetails._id.slice(-6).toUpperCase()}`,
        createdAt: orderDetails.createdAt,
        orderStatus: orderDetails.orderStatus,
        totalAmount: orderDetails.totalAmount,
        subtotal: orderDetails.subtotal,
        shippingFee: orderDetails.shippingFee,
        tax: (orderDetails.subtotal || 0) * 0.08, // 8% tax
        items: orderDetails.items?.map(item => ({
          _id: item._id,
          product: item.product,
          name: item.product?.name || 'Product',
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.product?.image ? `${API_BASE_URL}/${item.product.image}` : 'https://via.placeholder.com/300',
          color: 'Standard',
          size: 'One Size'
        })) || [],
        shippingAddress: orderDetails.shippingAddress,
        paymentMethod: orderDetails.paymentMethod,
        tracking: {
          number: `TRK-${orderDetails._id.slice(-8).toUpperCase()}`,
          carrier: 'Standard Shipping',
          status: orderDetails.orderStatus,
          steps: getOrderStatusSteps(orderDetails.orderStatus)
        }
      };

      setOrder(transformedData);
    } catch (error) {
      console.error('Error loading order data:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrderData();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#2196F3',
      processing: '#9C27B0',
      shipped: '#9C27B0',
      delivered: '#4CAF50',
      cancelled: '#F44336'
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'receipt',
      confirmed: 'checkmark-circle',
      processing: 'construct',
      shipped: 'cube',
      delivered: 'checkmark-done',
      cancelled: 'close-circle'
    };
    return icons[status] || 'help';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const trackPackage = () => {
    if (!order?.tracking?.number) return;
    
    // In a real app, you would use the actual carrier tracking URL
    const trackingUrl = `https://example.com/track?tracking=${order.tracking.number}`;
    Linking.openURL(trackingUrl).catch(err => {
      Alert.alert('Error', 'Could not open tracking page');
    });
  };

  const contactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Would you like to contact customer support about this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@example.com') }
      ]
    );
  };

  const handleReorder = async () => {
    if (!order) return;
    
    try {
      await reorderItems();
      Alert.alert('Success', 'All items have been added to your cart!');
      router.push('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      Alert.alert('Error', 'Failed to add items to cart. Please try again.');
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder();
              Alert.alert('Success', 'Order has been cancelled successfully');
              loadOrderData(); // Refresh order data
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
            }
          }
        }
      ]
    );
  };

  const writeReview = (item) => {
    Alert.alert(
      'Write Review',
      `Write a review for ${item.name}?`,
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'Write Review', 
          onPress: () => {
            router.push(`/products/review/${item.product._id}`);
          }
        }
      ]
    );
  };

  const returnItem = (item) => {
    Alert.alert(
      'Return Item',
      `Start return process for ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Return', 
          onPress: () => {
            // Navigate to return process
            console.log('Start return for:', item.name);
          }
        }
      ]
    );
  };

  // Render functions with null checks
  const renderOrderHeader = () => {
    if (!order) return null;

    return (
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.orderNumber}</Text>
          <Text style={styles.orderDate}>Placed on {formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.orderStatus) }]}>
          <Ionicons name={getStatusIcon(order.orderStatus)} size={16} color="#fff" />
          <Text style={styles.statusText}>{order.orderStatus.toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'items' && styles.activeTab]}
          onPress={() => setActiveTab('items')}
        >
          <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>
            Items ({order?.items?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'status' && styles.activeTab]}
          onPress={() => setActiveTab('status')}
        >
          <Text style={[styles.tabText, activeTab === 'status' && styles.activeTabText]}>
            Order Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shipping' && styles.activeTab]}
          onPress={() => setActiveTab('shipping')}
        >
          <Text style={[styles.tabText, activeTab === 'shipping' && styles.activeTabText]}>
            Shipping & Payment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderItemsTab = () => {
    if (!order) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.itemsList}>
          {order.items.map((item, index) => (
            <View key={item._id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemAttributes}>
                  <Text style={styles.attribute}>{item.color}</Text>
                  <Text style={styles.attribute}>{item.size}</Text>
                  <Text style={styles.attribute}>Qty: {item.quantity}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>৳{item.price}</Text>
                </View>
                <Text style={styles.itemTotal}>
                  ৳{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
              <View style={styles.itemActions}>
                {order.orderStatus === 'delivered' && (
                  <>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => writeReview(item)}
                    >
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.actionText}>Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => returnItem(item)}
                    >
                      <Ionicons name="return-up-back" size={16} color="#666" />
                      <Text style={styles.actionText}>Return</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push(`/products/${item.product._id}`)}
                >
                  <Ionicons name="eye" size={16} color="#666" />
                  <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>৳{order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {order.shippingFee === 0 ? 'FREE' : `৳${order.shippingFee.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>৳{order.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>৳{order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatusTab = () => {
    if (!order) return null;

    return (
      <View style={styles.tabContent}>
        {/* Tracking Info */}
        {order.tracking && (
          <View style={styles.trackingSection}>
            <View style={styles.trackingHeader}>
              <View>
                <Text style={styles.trackingTitle}>Tracking Information</Text>
                <Text style={styles.trackingNumber}>
                  {order.tracking.number} • {order.tracking.carrier}
                </Text>
              </View>
              <TouchableOpacity style={styles.trackButton} onPress={trackPackage}>
                <Text style={styles.trackButtonText}>Track Package</Text>
              </TouchableOpacity>
            </View>

            {/* Timeline */}
            <View style={styles.timeline}>
              {order.tracking.steps.map((step, index) => (
                <View key={step.status} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      { backgroundColor: step.completed ? getStatusColor(step.status) : '#e0e0e0' }
                    ]}>
                      {step.completed ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      ) : (
                        <View style={styles.pendingStepDot} />
                      )}
                    </View>
                    {index < order.tracking.steps.length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        step.completed && styles.timelineLineCompleted
                      ]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineDescription,
                      step.current && styles.currentStepText
                    ]}>
                      {step.title}
                    </Text>
                    <Text style={styles.timelineDescription}>{step.description}</Text>
                    <Text style={styles.timelineDate}>{step.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderShippingTab = () => {
    if (!order) return null;

    return (
      <View style={styles.tabContent}>
        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
              <Text style={styles.addressText}>{order.shippingAddress.addressLine1}</Text>
              {order.shippingAddress.addressLine2 && (
                <Text style={styles.addressText}>{order.shippingAddress.addressLine2}</Text>
              )}
              <Text style={styles.addressText}>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </Text>
              <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactText}>Phone: {order.shippingAddress.phone}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentMethod}>
              <Ionicons name="card" size={24} color="#666" />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentType}>
                  {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                </Text>
                <Text style={styles.paymentDetails}>
                  {order.paymentMethod === 'card' ? 'Payment completed' : 'Pay on delivery'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shipping Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Method</Text>
          <View style={styles.shippingCard}>
            <View style={styles.shippingMethod}>
              <Ionicons name="cube" size={24} color="#666" />
              <View style={styles.shippingInfo}>
                <Text style={styles.shippingName}>Standard Shipping</Text>
                <Text style={styles.shippingDetails}>
                  {order.tracking.carrier} • 5-7 business days
                </Text>
                <Text style={styles.shippingPrice}>
                  {order.shippingFee === 0 ? 'FREE' : `৳${order.shippingFee}`}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (!order) return null;

    switch (activeTab) {
      case 'items':
        return renderItemsTab();
      case 'status':
        return renderStatusTab();
      case 'shipping':
        return renderShippingTab();
      default:
        return renderItemsTab();
    }
  };

  const renderFooterActions = () => {
    if (!order) return null;

    return (
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={contactSupport}
        >
          <Ionicons name="headset" size={20} color="#666" />
          <Text style={styles.supportButtonText}>Support</Text>
        </TouchableOpacity>
        
        {order.orderStatus === 'pending' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelOrder}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.reorderButton}
          onPress={handleReorder}
        >
          <Ionicons name="repeat" size={20} color="#fff" />
          <Text style={styles.reorderButtonText}>Reorder All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Order not found</Text>
        <Text style={styles.errorSubtext}>
          The order you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrderData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Order Header */}
        {renderOrderHeader()}

        {/* Tabs */}
        {renderTabs()}

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Action Footer */}
      {renderFooterActions()}
    </View>
  );
};

// ... (keep all the existing styles, they remain the same)

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  scrollView: {
    flex: 1,
  },
  // Order Header
  orderHeader: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Tabs
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  // Tab Content
  tabContent: {
    backgroundColor: '#fff',
    padding: 20,
  },
  // Items Tab
  itemsList: {
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemAttributes: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  attribute: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 8,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  // Order Summary
  orderSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
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
  // Status Tab
  trackingSection: {
    marginBottom: 20,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 14,
    color: '#666',
  },
  trackButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeline: {
    marginLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  pendingStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  currentStepText: {
    fontWeight: '600',
    color: '#FF6B6B',
  },
  timelineDate: {
    fontSize: 11,
    color: '#999',
  },
  // Shipping Tab
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  paymentCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 14,
    color: '#666',
  },
  shippingCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  shippingMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  shippingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  shippingDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  shippingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  // Footer
  footer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  supportButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F44336',
    borderRadius: 8,
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  reorderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  reorderButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;