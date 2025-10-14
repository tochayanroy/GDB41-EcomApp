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
    Linking
} from 'react-native';

const { width } = Dimensions.get('window');

const OrderDetailsScreen = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items'); // items, shipping, status

  // Static order data with detailed information
  const staticOrder = {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 299.97,
    subtotal: 299.97,
    shipping: 0,
    tax: 24.00,
    discount: 0,
    items: [
      {
        id: '1',
        productId: '1',
        name: 'Wireless Bluetooth Headphones',
        price: 99.99,
        originalPrice: 129.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        quantity: 1,
        color: 'Black',
        size: 'Standard',
        discount: 23,
        inStock: true,
        rating: 4.5,
        reviewCount: 128
      },
      {
        id: '3',
        productId: '3',
        name: 'Smart Watch Series 5',
        price: 199.99,
        originalPrice: 249.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        quantity: 1,
        color: 'Silver',
        size: '42mm',
        discount: 20,
        inStock: true,
        rating: 4.7,
        reviewCount: 256
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com'
    },
    billingAddress: {
      name: 'John Doe',
      street: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    paymentMethod: {
      type: 'Credit Card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/25'
    },
    shippingMethod: {
      name: 'Free Shipping',
      price: 0,
      estimatedDays: '7-10 business days',
      carrier: 'Standard Shipping'
    },
    tracking: {
      number: 'TRK123456789',
      carrier: 'UPS',
      status: 'delivered',
      timeline: [
        {
          status: 'ordered',
          date: '2024-01-15',
          time: '14:30',
          description: 'Order placed',
          location: 'Online Store'
        },
        {
          status: 'confirmed',
          date: '2024-01-15',
          time: '15:45',
          description: 'Order confirmed',
          location: 'Warehouse'
        },
        {
          status: 'processed',
          date: '2024-01-16',
          time: '09:15',
          description: 'Order processed',
          location: 'Warehouse'
        },
        {
          status: 'shipped',
          date: '2024-01-16',
          time: '14:20',
          description: 'Shipped from warehouse',
          location: 'New York, NY'
        },
        {
          status: 'in_transit',
          date: '2024-01-17',
          time: '08:30',
          description: 'In transit',
          location: 'Philadelphia, PA'
        },
        {
          status: 'out_for_delivery',
          date: '2024-01-18',
          time: '08:00',
          description: 'Out for delivery',
          location: 'New York, NY'
        },
        {
          status: 'delivered',
          date: '2024-01-18',
          time: '14:15',
          description: 'Delivered',
          location: 'Front Door'
        }
      ]
    },
    notes: [
      {
        date: '2024-01-15',
        note: 'Order placed successfully. Payment confirmed.',
        type: 'system'
      },
      {
        date: '2024-01-16',
        note: 'Customer requested expedited shipping. Upgrade applied.',
        type: 'customer_service'
      }
    ]
  };

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setOrder(staticOrder);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      ordered: '#FFA500',
      confirmed: '#2196F3',
      processed: '#9C27B0',
      shipped: '#9C27B0',
      in_transit: '#FF9800',
      out_for_delivery: '#4CAF50',
      delivered: '#4CAF50',
      cancelled: '#F44336',
      returned: '#FF9800'
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      ordered: 'receipt',
      confirmed: 'checkmark-circle',
      processed: 'construct',
      shipped: 'cube',
      in_transit: 'car',
      out_for_delivery: 'walk',
      delivered: 'checkmark-done',
      cancelled: 'close-circle',
      returned: 'refresh'
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

  const formatTime = (timeString) => {
    return timeString; // In real app, you might want to format this properly
  };

  const trackPackage = () => {
    if (!order?.tracking?.number) return;
    
    const trackingUrl = `https://www.ups.com/track?tracknum=${order.tracking.number}`;
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
        { text: 'Call', onPress: () => Linking.openURL('tel:+15551234567') },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@store.com') }
      ]
    );
  };

  const reorderItems = () => {
    if (!order) return;
    
    Alert.alert(
      'Reorder',
      'Add all items from this order to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reorder All',
          onPress: () => {
            Alert.alert('Success', 'All items have been added to your cart!');
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
        { text: 'Write Review', style: 'default' }
      ]
    );
  };

  const returnItem = (item) => {
    Alert.alert(
      'Return Item',
      `Start return process for ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Return', style: 'default' }
      ]
    );
  };

  // Render functions with null checks
  const renderOrderHeader = () => {
    if (!order) return null;

    return (
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>Placed on {formatDate(order.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Ionicons name={getStatusIcon(order.status)} size={16} color="#fff" />
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
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
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemAttributes}>
                  <Text style={styles.attribute}>{item.color}</Text>
                  <Text style={styles.attribute}>{item.size}</Text>
                  <Text style={styles.attribute}>Qty: {item.quantity}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>${item.price}</Text>
                  {item.originalPrice > item.price && (
                    <Text style={styles.originalPrice}>${item.originalPrice}</Text>
                  )}
                  {item.discount > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{item.discount}% OFF</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
              <View style={styles.itemActions}>
                {order.status === 'delivered' && (
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
                  onPress={() => console.log('Buy again', item.name)}
                >
                  <Ionicons name="cart" size={16} color="#FF6B6B" />
                  <Text style={styles.actionText}>Buy Again</Text>
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
            <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${order.tax.toFixed(2)}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>
                -${order.discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
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
              {order.tracking.timeline.map((event, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      { backgroundColor: getStatusColor(event.status) }
                    ]}>
                      <Ionicons 
                        name={getStatusIcon(event.status)} 
                        size={12} 
                        color="#fff" 
                      />
                    </View>
                    {index < order.tracking.timeline.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineDescription}>{event.description}</Text>
                    <Text style={styles.timelineLocation}>{event.location}</Text>
                    <Text style={styles.timelineDate}>
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Order Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Order Notes</Text>
          {order.notes.map((note, index) => (
            <View key={index} style={styles.noteItem}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteType}>
                  {note.type === 'system' ? 'System' : 'Customer Service'}
                </Text>
                <Text style={styles.noteDate}>{formatDate(note.date)}</Text>
              </View>
              <Text style={styles.noteText}>{note.note}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderShippingTab = () => {
    if (!order) return null;

    return (
      <View style={styles.tabContent}>
        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
            <Text style={styles.addressText}>{order.shippingAddress.street}</Text>
            {order.shippingAddress.apartment && (
              <Text style={styles.addressText}>{order.shippingAddress.apartment}</Text>
            )}
            <Text style={styles.addressText}>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </Text>
            <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactText}>{order.shippingAddress.phone}</Text>
              <Text style={styles.contactText}>{order.shippingAddress.email}</Text>
            </View>
          </View>
        </View>

        {/* Billing Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{order.billingAddress.name}</Text>
            <Text style={styles.addressText}>{order.billingAddress.street}</Text>
            {order.billingAddress.apartment && (
              <Text style={styles.addressText}>{order.billingAddress.apartment}</Text>
            )}
            <Text style={styles.addressText}>
              {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
            </Text>
            <Text style={styles.addressText}>{order.billingAddress.country}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentMethod}>
              <Ionicons name="card" size={24} color="#666" />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentType}>{order.paymentMethod.type}</Text>
                <Text style={styles.paymentDetails}>
                  **** **** **** {order.paymentMethod.last4} • Expires {order.paymentMethod.expiry}
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
                <Text style={styles.shippingName}>{order.shippingMethod.name}</Text>
                <Text style={styles.shippingDetails}>
                  {order.shippingMethod.carrier} • {order.shippingMethod.estimatedDays}
                </Text>
                <Text style={styles.shippingPrice}>
                  {order.shippingMethod.price === 0 ? 'FREE' : `$${order.shippingMethod.price}`}
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        {renderOrderHeader()}

        {/* Tabs */}
        {renderTabs()}

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={contactSupport}
        >
          <Ionicons name="headset" size={20} color="#666" />
          <Text style={styles.supportButtonText}>Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reorderButton}
          onPress={reorderItems}
        >
          <Ionicons name="repeat" size={20} color="#fff" />
          <Text style={styles.reorderButtonText}>Reorder All</Text>
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
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  discountValue: {
    color: '#4CAF50',
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
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  timelineLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 11,
    color: '#999',
  },
  notesSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  noteItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  noteDate: {
    fontSize: 11,
    color: '#999',
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  // Shipping Tab
  section: {
    marginBottom: 20,
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
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 10,
  },
  supportButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reorderButton: {
    flex: 2,
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