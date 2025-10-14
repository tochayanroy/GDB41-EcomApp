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

const { width, height } = Dimensions.get('window');

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

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalRevenue: 12540.75,
        totalOrders: 342,
        pendingOrders: 28,
        completedOrders: 289,
        newCustomers: 45,
        conversionRate: 3.2,
        averageOrderValue: 146.75,
        refunds: 8
      });

      setRecentOrders([
        {
          id: 'ORD-784329',
          customer: 'John Doe',
          amount: 194.61,
          status: 'delivered',
          date: '2024-12-20',
          items: 3
        },
        {
          id: 'ORD-784328',
          customer: 'Sarah Wilson',
          amount: 89.99,
          status: 'shipped',
          date: '2024-12-20',
          items: 2
        },
        {
          id: 'ORD-784327',
          customer: 'Mike Johnson',
          amount: 245.50,
          status: 'processing',
          date: '2024-12-19',
          items: 4
        },
        {
          id: 'ORD-784326',
          customer: 'Emily Davis',
          amount: 67.25,
          status: 'pending',
          date: '2024-12-19',
          items: 1
        },
        {
          id: 'ORD-784325',
          customer: 'Robert Brown',
          amount: 156.80,
          status: 'cancelled',
          date: '2024-12-18',
          items: 2
        }
      ]);

      setTopProducts([
        {
          id: '1',
          name: 'Wireless Headphones',
          sales: 45,
          revenue: 4499.55,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'
        },
        {
          id: '2',
          name: 'Running Shoes',
          sales: 38,
          revenue: 3039.62,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'
        },
        {
          id: '3',
          name: 'Smart Watch',
          sales: 32,
          revenue: 6399.68,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
        },
        {
          id: '4',
          name: 'Backpack',
          sales: 28,
          revenue: 1679.72,
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100'
        }
      ]);

      setLoading(false);
    }, 1500);
  };

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
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>{item.id}</Text>
        <Text style={styles.orderCustomer}>{item.customer}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>
      <View style={styles.orderDetails}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <Text style={styles.orderAmount}>${item.amount}</Text>
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

  if (loading) {
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
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            {renderStatCard(
              'cash-outline',
              'Total Revenue',
              `$${stats.totalRevenue.toLocaleString()}`,
              '+12% from last period',
              '#4CAF50'
            )}
            {renderStatCard(
              'cart-outline',
              'Total Orders',
              stats.totalOrders.toString(),
              `${stats.pendingOrders} pending`,
              '#FF6B6B'
            )}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard(
              'people-outline',
              'New Customers',
              stats.newCustomers.toString(),
              'Customer acquisition',
              '#2196F3'
            )}
            {renderStatCard(
              'trending-up-outline',
              'Conversion Rate',
              `${stats.conversionRate}%`,
              'Website performance',
              '#FFA726'
            )}
          </View>
        </View>

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
          <FlatList
            data={recentOrders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.ordersList}
          />
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Selling Products</Text>
            <TouchableOpacity onPress={() => handleViewAll('products')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={topProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* Performance Metrics */}
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
              <Text style={styles.metricValue}>2.3%</Text>
              <Text style={styles.metricLabel}>Return Rate</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" />
              <Text style={styles.metricValue}>98%</Text>
              <Text style={styles.metricLabel}>Response Rate</Text>
            </View>
          </View>
        </View>
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
});

export default AdminDashboardScreen;