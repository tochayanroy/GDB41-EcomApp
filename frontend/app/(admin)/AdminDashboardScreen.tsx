import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  FlatList
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.102:5000';

const AdminDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const timeRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' }
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

  const fetchDashboardStats = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/order/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          timeRange: selectedTimeRange
        }
      });

      // Calculate stats from orders data
      const orders = response.data.orders || [];
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.orderStatus === 'pending').length;
      const completedOrders = orders.filter(order => order.orderStatus === 'delivered').length;
      
      // For demo purposes - in real app, these would come from separate API endpoints
      const newCustomers = Math.floor(Math.random() * 50) + 20; // Mock data
      const conversionRate = parseFloat((Math.random() * 5 + 1).toFixed(1));
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const refunds = orders.filter(order => order.orderStatus === 'cancelled').length;

      setStats({
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        newCustomers,
        conversionRate,
        averageOrderValue,
        refunds
      });

      return orders;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
      return [];
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/order/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          limit: 5,
          page: 1,
          sort: 'createdAt'
        }
      });

      const orders = response.data.orders || [];
      const formattedOrders = orders.map(order => ({
        id: order._id,
        customer: order.user?.username || 'Unknown Customer',
        amount: order.totalAmount || 0,
        status: order.orderStatus || 'pending',
        date: new Date(order.createdAt).toISOString().split('T')[0],
        items: order.items?.length || 0
      }));

      setRecentOrders(formattedOrders);
      return formattedOrders;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  };

  const fetchTopProducts = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/product/allProduct`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const products = response.data || [];
      // For demo - in real app, you'd have sales data from orders
      const topProductsData = products.slice(0, 4).map((product, index) => ({
        id: product._id,
        name: product.name,
        sales: Math.floor(Math.random() * 50) + 20, // Mock sales data
        revenue: (product.price || 0) * (Math.floor(Math.random() * 50) + 20), // Mock revenue
        image: product.image
      }));

      setTopProducts(topProductsData);
      return topProductsData;
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      const [orders, recentOrdersData, topProductsData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentOrders(),
        fetchTopProducts()
      ]);

      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA726',
      processing: '#42A5F5',
      shipped: '#AB47BC',
      delivered: '#4CAF50',
      cancelled: '#EF5350'
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderManagement', { orderId: order.id });
  };

  const handleViewAll = (type) => {
    switch (type) {
      case 'orders':
        navigation.navigate('OrderManagement');
        break;
      case 'products':
        navigation.navigate('ProductManagement');
        break;
      case 'users':
        navigation.navigate('UserManagement');
        break;
    }
  };

  const renderStatCard = (icon, title, value, subtitle, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>
        {typeof value === 'number' && title.includes('Revenue') ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
         typeof value === 'number' && title.includes('Rate') ? `${value}%` : value}
      </Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>ORD-{item.id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.orderCustomer}>{item.customer}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>
      <View style={styles.orderDetails}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <Text style={styles.orderAmount}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.orderItems}>{item.items} items</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productSales}>{item.sales} sales</Text>
      </View>
      <Text style={styles.productRevenue}>${item.revenue.toFixed(2)}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back, Admin!</Text>
          <Text style={styles.subtitle}>Here's what's happening today</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Time Range Filter */}
        <View style={styles.timeRangeContainer}>
          <Text style={styles.sectionTitle}>Time Range</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.timeRangeButtons}>
              {timeRanges.map((range) => (
                <TouchableOpacity
                  key={range.id}
                  style={[
                    styles.timeRangeButton,
                    selectedTimeRange === range.id && styles.timeRangeButtonActive
                  ]}
                  onPress={() => setSelectedTimeRange(range.id)}
                >
                  <Text style={[
                    styles.timeRangeText,
                    selectedTimeRange === range.id && styles.timeRangeTextActive
                  ]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Stats Grid */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              {renderStatCard(
                'cash-outline',
                'Total Revenue',
                stats.totalRevenue,
                '+12% from last period',
                '#4CAF50'
              )}
              {renderStatCard(
                'cart-outline',
                'Total Orders',
                stats.totalOrders,
                `${stats.pendingOrders} pending`,
                '#FF6B6B'
              )}
            </View>
            <View style={styles.statsRow}>
              {renderStatCard(
                'people-outline',
                'New Customers',
                stats.newCustomers,
                'Customer acquisition',
                '#2196F3'
              )}
              {renderStatCard(
                'trending-up-outline',
                'Conversion Rate',
                stats.conversionRate,
                'Website performance',
                '#FFA726'
              )}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('ProductManagement')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="cube-outline" size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionText}>Manage Products</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('OrderManagement')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5E8' }]}>
                <Ionicons name="receipt-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText}>Manage Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="people-outline" size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionText}>Manage Users</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('CategoryManagement')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="list-outline" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.actionText}>Categories</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => handleViewAll('orders')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.length > 0 ? (
            <FlatList
              data={recentOrders}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.ordersList}
            />
          ) : (
            <Text style={styles.noDataText}>No recent orders</Text>
          )}
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Selling Products</Text>
            <TouchableOpacity onPress={() => handleViewAll('products')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {topProducts.length > 0 ? (
            <FlatList
              data={topProducts}
              renderItem={renderProductItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
            />
          ) : (
            <Text style={styles.noDataText}>No products data</Text>
          )}
        </View>

        {/* Performance Metrics */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.metricValue}>2.1 days</Text>
                <Text style={styles.metricLabel}>Avg. Delivery Time</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="star-outline" size={20} color="#666" />
                <Text style={styles.metricValue}>4.8/5</Text>
                <Text style={styles.metricLabel}>Customer Rating</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="refresh-outline" size={20} color="#666" />
                <Text style={styles.metricValue}>{stats.refunds}</Text>
                <Text style={styles.metricLabel}>Cancellations</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="cash-outline" size={20} color="#666" />
                <Text style={styles.metricValue}>${stats.averageOrderValue.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>Avg. Order Value</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  timeRangeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timeRangeButtons: {
    flexDirection: 'row',
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  timeRangeButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  statsGrid: {
    padding: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 5,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  ordersList: {
    paddingBottom: 5,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  orderCustomer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 11,
    color: '#999',
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  orderItems: {
    fontSize: 11,
    color: '#999',
  },
  productsList: {
    paddingBottom: 5,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productSales: {
    fontSize: 12,
    color: '#666',
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    padding: 20,
  },
});

export default AdminDashboardScreen;