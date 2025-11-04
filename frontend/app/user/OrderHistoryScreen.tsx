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
    Modal,
    TextInput,
    RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.0.102:5000';

const OrderHistoryScreen = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');

  // Order status options
  const statusOptions = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'recent', label: 'Most Recent' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'price_high', label: 'Highest Price' },
    { id: 'price_low', label: 'Lowest Price' }
  ];

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
  const fetchOrders = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };

  const cancelOrder = async (orderId) => {
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

  const reorderItems = async (order) => {
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

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [orders, selectedFilter, searchQuery, selectedSort]);

  const loadOrders = async () => {
    try {
      const ordersData = await fetchOrders();
      
      // Transform API data to match component structure
      const transformedOrders = ordersData.map(order => ({
        _id: order._id,
        id: order.orderNumber || `ORD-${order._id.slice(-6).toUpperCase()}`,
        date: order.createdAt,
        status: order.orderStatus,
        total: order.totalAmount,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        items: order.items?.map(item => ({
          _id: item._id,
          product: item.product,
          name: item.product?.name || 'Product',
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.product?.image ? `${API_BASE_URL}/${item.product.image}` : 'https://via.placeholder.com/300',
          color: 'Standard',
          size: 'One Size'
        })) || [],
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber || `TRK-${order._id.slice(-8).toUpperCase()}`,
        estimatedDelivery: calculateEstimatedDelivery(order.createdAt)
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const calculateEstimatedDelivery = (orderDate) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 7); // Add 7 days for delivery estimate
    return date.toISOString();
  };

  const applyFiltersAndSort = () => {
    let filtered = [...orders];

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(order => order.status === selectedFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'price_high':
        filtered.sort((a, b) => b.total - a.total);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.total - b.total);
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredOrders(filtered);
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
      pending: 'time',
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderModalVisible(true);
  };

  const handleReorder = async (order) => {
    try {
      await reorderItems(order);
      Alert.alert('Success', 'All items have been added to your cart!');
      router.push('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      Alert.alert('Error', 'Failed to add items to cart. Please try again.');
    }
  };

  const handleTrackOrder = (order) => {
    if (order.trackingNumber) {
      Alert.alert(
        'Track Order',
        `Tracking number: ${order.trackingNumber}\n\nWould you like to track this order?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Track', 
            onPress: () => {
              // In a real app, you would open the carrier's tracking page
              console.log('Track order:', order.trackingNumber);
            }
          }
        ]
      );
    } else {
      Alert.alert('No Tracking', 'Tracking information is not available for this order yet.');
    }
  };

  const handleCancelOrder = async (order) => {
    if (order.status === 'pending' || order.status === 'confirmed') {
      Alert.alert(
        'Cancel Order',
        `Are you sure you want to cancel order ${order.id}?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                await cancelOrder(order._id);
                Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
                loadOrders(); // Refresh orders list
              } catch (error) {
                console.error('Error cancelling order:', error);
                Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
              }
            }
          }
        ]
      );
    } else {
      Alert.alert('Cannot Cancel', 'This order cannot be cancelled at this stage.');
    }
  };

  const requestReturn = (order) => {
    if (order.status === 'delivered') {
      Alert.alert(
        'Request Return',
        `Request return for order ${order.id}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Request Return',
            onPress: () => {
              // Navigate to return process
              router.push(`/orders/return/${order._id}`);
            }
          }
        ]
      );
    } else {
      Alert.alert('Cannot Return', 'This order is not eligible for return.');
    }
  };

  const contactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Would you like to contact customer support?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => {
            // Implement email support
            console.log('Contact support');
          }
        }
      ]
    );
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => viewOrderDetails(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>{item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.date)} • {getDaysAgo(item.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={14} color="#fff" />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((product, index) => (
          <View key={product._id} style={styles.orderProduct}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.productDetails}>
                {product.color} • Qty: {product.quantity}
              </Text>
            </View>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>৳{item.total.toFixed(2)}</Text>
        <View style={styles.orderActions}>
          {item.status === 'delivered' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleReorder(item)}
            >
              <Ionicons name="repeat" size={16} color="#FF6B6B" />
              <Text style={styles.actionText}>Reorder</Text>
            </TouchableOpacity>
          )}
          
          {(item.status === 'shipped' || item.status === 'processing') && item.trackingNumber && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleTrackOrder(item)}
            >
              <Ionicons name="locate" size={16} color="#2196F3" />
              <Text style={styles.actionText}>Track</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => viewOrderDetails(item)}
          >
            <Ionicons name="eye" size={16} color="#666" />
            <Text style={styles.actionText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOrderDetailsModal = () => (
    <Modal
      visible={orderModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setOrderModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedOrder && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order Details</Text>
                <TouchableOpacity onPress={() => setOrderModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Order Summary */}
                <View style={styles.detailSection}>
                  <View style={styles.orderSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Order ID</Text>
                      <Text style={styles.summaryValue}>{selectedOrder.id}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Order Date</Text>
                      <Text style={styles.summaryValue}>{formatDate(selectedOrder.date)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Status</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                        <Text style={styles.statusText}>{selectedOrder.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Amount</Text>
                      <Text style={styles.totalAmount}>৳{selectedOrder.total.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>

                {/* Items */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Items ({selectedOrder.items.length})</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={item._id} style={styles.detailItem}>
                      <Image source={{ uri: item.image }} style={styles.detailItemImage} />
                      <View style={styles.detailItemInfo}>
                        <Text style={styles.detailItemName}>{item.name}</Text>
                        <Text style={styles.detailItemAttributes}>
                          {item.color} • {item.size} • Qty: {item.quantity}
                        </Text>
                        <Text style={styles.detailItemPrice}>৳{item.price} × {item.quantity}</Text>
                      </View>
                      <Text style={styles.detailItemTotal}>
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                    <View style={styles.addressCard}>
                      <Text style={styles.addressName}>{selectedOrder.shippingAddress.fullName}</Text>
                      <Text style={styles.addressText}>{selectedOrder.shippingAddress.addressLine1}</Text>
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <Text style={styles.addressText}>{selectedOrder.shippingAddress.addressLine2}</Text>
                      )}
                      <Text style={styles.addressText}>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      </Text>
                      <Text style={styles.addressText}>{selectedOrder.shippingAddress.country}</Text>
                      {selectedOrder.shippingAddress.phone && (
                        <Text style={styles.addressText}>Phone: {selectedOrder.shippingAddress.phone}</Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Payment & Shipping */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Payment & Shipping</Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Payment Method</Text>
                      <Text style={styles.infoValue}>
                        {selectedOrder.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                      </Text>
                    </View>
                    {selectedOrder.trackingNumber && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Tracking Number</Text>
                        <Text style={styles.infoValue}>{selectedOrder.trackingNumber}</Text>
                      </View>
                    )}
                    {selectedOrder.estimatedDelivery && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Estimated Delivery</Text>
                        <Text style={styles.infoValue}>{formatDate(selectedOrder.estimatedDelivery)}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && (
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setOrderModalVisible(false);
                        handleCancelOrder(selectedOrder);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel Order</Text>
                    </TouchableOpacity>
                  )}
                  
                  {selectedOrder.status === 'delivered' && (
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.returnButton]}
                      onPress={() => {
                        setOrderModalVisible(false);
                        requestReturn(selectedOrder);
                      }}
                    >
                      <Text style={styles.returnButtonText}>Request Return</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={[styles.modalButton, styles.reorderButton]}
                    onPress={() => {
                      setOrderModalVisible(false);
                      handleReorder(selectedOrder);
                    }}
                  >
                    <Text style={styles.reorderButtonText}>Reorder All Items</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Status Filter */}
            <Text style={styles.filterSectionTitle}>Order Status</Text>
            <View style={styles.filterOptions}>
              {statusOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    selectedFilter === option.id && styles.selectedFilterOption
                  ]}
                  onPress={() => setSelectedFilter(option.id)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilter === option.id && styles.selectedFilterOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {selectedFilter === option.id && (
                    <Ionicons name="checkmark" size={16} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Options */}
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.filterOptions}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    selectedSort === option.id && styles.selectedFilterOption
                  ]}
                  onPress={() => setSelectedSort(option.id)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedSort === option.id && styles.selectedFilterOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {selectedSort === option.id && (
                    <Ionicons name="checkmark" size={16} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.resetButton]}
                onPress={() => {
                  setSelectedFilter('all');
                  setSelectedSort('recent');
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.applyButton]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order History</Text>
        <Text style={styles.headerSubtitle}>Manage and track your orders</Text>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.controlsBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders or products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#666" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredOrders.length} orders found
        </Text>
        <Text style={styles.filterInfo}>
          {selectedFilter !== 'all' && `Filtered by: ${statusOptions.find(s => s.id === selectedFilter)?.label}`}
        </Text>
      </View>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter !== 'all' || searchQuery 
              ? 'Try adjusting your filters or search criteria'
              : 'You haven\'t placed any orders yet'
            }
          </Text>
          {(selectedFilter !== 'all' || searchQuery) && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modals */}
      {renderOrderDetailsModal()}
      {renderFilterModal()}
    </View>
  );
};

// ... (keep all the existing styles from the previous code)

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
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
  },
  filterButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resultsInfo: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ordersList: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  productDetails: {
    fontSize: 12,
    color: '#666',
  },
  moreItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  orderActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
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
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailItemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailItemAttributes: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailItemPrice: {
    fontSize: 12,
    color: '#666',
  },
  detailItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
  infoGrid: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  infoItem: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionSection: {
    marginTop: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  returnButton: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  returnButtonText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: '600',
  },
  reorderButton: {
    backgroundColor: '#FF6B6B',
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Filter Modal Styles
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 10,
  },
  filterOptions: {
    marginBottom: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedFilterOptionText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#FF6B6B',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderHistoryScreen;