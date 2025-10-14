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
    Alert,
    FlatList,
    ActivityIndicator,
    TextInput,
    Modal,
    Switch,
    RefreshControl
} from 'react-native';

const { width } = Dimensions.get('window');

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    admins: 0
  });

  // Form state for add/edit user
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    avatar: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    notifications: true,
    newsletter: false,
    twoFactor: false
  });

  // Static users data
  const staticUsers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      joinDate: '2023-05-15',
      lastLogin: '2024-01-28',
      emailVerified: true,
      phoneVerified: true,
      orders: 45,
      totalSpent: 12560.75,
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001'
      },
      notifications: true,
      newsletter: true,
      twoFactor: false,
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1 (555) 234-5678',
      role: 'customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      joinDate: '2023-08-22',
      lastLogin: '2024-01-27',
      emailVerified: true,
      phoneVerified: false,
      orders: 12,
      totalSpent: 3450.20,
      address: {
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        zipCode: '90210'
      },
      notifications: true,
      newsletter: false,
      twoFactor: true,
      ipAddress: '192.168.1.101'
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@example.com',
      phone: '+1 (555) 345-6789',
      role: 'customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      joinDate: '2023-11-10',
      lastLogin: '2024-01-25',
      emailVerified: true,
      phoneVerified: true,
      orders: 8,
      totalSpent: 1890.50,
      address: {
        street: '789 Pine Road',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        zipCode: '60601'
      },
      notifications: false,
      newsletter: true,
      twoFactor: false,
      ipAddress: '192.168.1.102'
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      phone: '+1 (555) 456-7890',
      role: 'vendor',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      joinDate: '2023-03-05',
      lastLogin: '2024-01-26',
      emailVerified: true,
      phoneVerified: true,
      orders: 0,
      totalSpent: 0,
      address: {
        street: '321 Elm Street',
        city: 'Houston',
        state: 'TX',
        country: 'USA',
        zipCode: '77001'
      },
      notifications: true,
      newsletter: true,
      twoFactor: true,
      ipAddress: '192.168.1.103'
    },
    {
      id: '5',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@example.com',
      phone: '+1 (555) 567-8901',
      role: 'customer',
      status: 'inactive',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      joinDate: '2023-12-01',
      lastLogin: '2023-12-15',
      emailVerified: true,
      phoneVerified: false,
      orders: 3,
      totalSpent: 450.75,
      address: {
        street: '654 Maple Drive',
        city: 'Phoenix',
        state: 'AZ',
        country: 'USA',
        zipCode: '85001'
      },
      notifications: true,
      newsletter: false,
      twoFactor: false,
      ipAddress: '192.168.1.104'
    },
    {
      id: '6',
      firstName: 'Lisa',
      lastName: 'Brown',
      email: 'lisa.brown@example.com',
      phone: '+1 (555) 678-9012',
      role: 'customer',
      status: 'suspended',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      joinDate: '2023-09-18',
      lastLogin: '2024-01-20',
      emailVerified: false,
      phoneVerified: false,
      orders: 15,
      totalSpent: 2780.30,
      address: {
        street: '987 Cedar Lane',
        city: 'Philadelphia',
        state: 'PA',
        country: 'USA',
        zipCode: '19101'
      },
      notifications: false,
      newsletter: false,
      twoFactor: false,
      ipAddress: '192.168.1.105'
    },
    {
      id: '7',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@example.com',
      phone: '+1 (555) 789-0123',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150',
      joinDate: '2023-02-14',
      lastLogin: '2024-01-28',
      emailVerified: true,
      phoneVerified: true,
      orders: 23,
      totalSpent: 5670.80,
      address: {
        street: '147 Walnut Street',
        city: 'San Antonio',
        state: 'TX',
        country: 'USA',
        zipCode: '78201'
      },
      notifications: true,
      newsletter: true,
      twoFactor: true,
      ipAddress: '192.168.1.106'
    },
    {
      id: '8',
      firstName: 'Amanda',
      lastName: 'Taylor',
      email: 'amanda.taylor@example.com',
      phone: '+1 (555) 890-1234',
      role: 'customer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      joinDate: '2024-01-05',
      lastLogin: '2024-01-28',
      emailVerified: true,
      phoneVerified: true,
      orders: 2,
      totalSpent: 320.25,
      address: {
        street: '258 Birch Avenue',
        city: 'San Diego',
        state: 'CA',
        country: 'USA',
        zipCode: '92101'
      },
      notifications: true,
      newsletter: true,
      twoFactor: false,
      ipAddress: '192.168.1.107'
    }
  ];

  const roleOptions = ['customer', 'vendor', 'admin', 'moderator'];
  const statusOptions = ['active', 'inactive', 'suspended', 'pending'];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    calculateStats();
  }, [users, searchQuery, activeFilter]);

  const loadUsers = () => {
    setLoading(true);
    setTimeout(() => {
      setUsers(staticUsers);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      );
    }

    // Filter by status
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(user => user.status === 'active');
        break;
      case 'inactive':
        filtered = filtered.filter(user => user.status === 'inactive');
        break;
      case 'suspended':
        filtered = filtered.filter(user => user.status === 'suspended');
        break;
      case 'admins':
        filtered = filtered.filter(user => user.role === 'admin');
        break;
      case 'vendors':
        filtered = filtered.filter(user => user.role === 'vendor');
        break;
      case 'verified':
        filtered = filtered.filter(user => user.emailVerified && user.phoneVerified);
        break;
    }

    setFilteredUsers(filtered);
  };

  const calculateStats = () => {
    const total = users.length;
    const active = users.filter(user => user.status === 'active').length;
    const verified = users.filter(user => user.emailVerified && user.phoneVerified).length;
    const admins = users.filter(user => user.role === 'admin').length;

    setStats({ total, active, verified, admins });
  };

  const resetForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'customer',
      status: 'active',
      avatar: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      },
      notifications: true,
      newsletter: false,
      twoFactor: false
    });
  };

  const handleAddUser = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditUser = (user) => {
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      address: user.address,
      notifications: user.notifications,
      newsletter: user.newsletter,
      twoFactor: user.twoFactor
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleSaveUser = () => {
    // Validation
    if (!userForm.firstName || !userForm.lastName || !userForm.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (showAddModal) {
      // Add new user
      const newUser = {
        id: Date.now().toString(),
        ...userForm,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0],
        emailVerified: false,
        phoneVerified: false,
        orders: 0,
        totalSpent: 0,
        ipAddress: '192.168.1.108'
      };

      setUsers(prev => [newUser, ...prev]);
      Alert.alert('Success', 'User added successfully');
    } else {
      // Update existing user
      const updatedUsers = users.map(u =>
        u.id === selectedUser.id
          ? {
              ...u,
              ...userForm
            }
          : u
      );

      setUsers(updatedUsers);
      Alert.alert('Success', 'User updated successfully');
    }

    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteUser = (user) => {
    if (user.role === 'admin') {
      Alert.alert(
        'Cannot Delete Admin',
        'Admin users cannot be deleted. Please change their role first.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${user.firstName} ${user.lastName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUsers(prev => prev.filter(u => u.id !== user.id));
            Alert.alert('Success', 'User deleted successfully');
          }
        }
      ]
    );
  };

  const toggleUserStatus = (user, newStatus) => {
    const updatedUsers = users.map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);
  };

  const resendVerification = (user, type) => {
    Alert.alert(
      'Verification Email Sent',
      `Verification email has been sent to ${user.email}`,
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FFA500';
      case 'suspended': return '#FF6B6B';
      case 'pending': return '#2196F3';
      default: return '#666';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#FF6B6B';
      case 'vendor': return '#4ECDC4';
      case 'moderator': return '#45B7D1';
      case 'customer': return '#96CEB4';
      default: return '#666';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderUserGrid = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
        <View style={styles.userBadges}>
          {item.emailVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
            </View>
          )}
          {item.twoFactor && (
            <View style={styles.twoFactorBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#2196F3" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>

        <View style={styles.userMeta}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.userStats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Orders</Text>
            <Text style={styles.statValue}>{item.orders}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>{formatCurrency(item.totalSpent)}</Text>
          </View>
        </View>

        <Text style={styles.joinDate}>Joined: {item.joinDate}</Text>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewUser(item)}
        >
          <Ionicons name="eye-outline" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditUser(item)}
        >
          <Ionicons name="create-outline" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteUser(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUserList = ({ item }) => (
    <View style={styles.userListItem}>
      <View style={styles.listLeft}>
        <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
        <View style={styles.listInfo}>
          <View style={styles.listHeader}>
            <Text style={styles.listName}>
              {item.firstName} {item.lastName}
            </Text>
            <View style={styles.listBadges}>
              {item.emailVerified && (
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              )}
              {item.twoFactor && (
                <Ionicons name="shield-checkmark" size={14} color="#2196F3" />
              )}
            </View>
          </View>
          <Text style={styles.listEmail}>{item.email}</Text>
          <View style={styles.listMeta}>
            <View style={[styles.listRole, { backgroundColor: getRoleColor(item.role) }]}>
              <Text style={styles.listRoleText}>{item.role}</Text>
            </View>
            <View style={[styles.listStatus, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.listStatusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.listRight}>
        <View style={styles.listStats}>
          <Text style={styles.listOrders}>{item.orders} orders</Text>
          <Text style={styles.listSpent}>{formatCurrency(item.totalSpent)}</Text>
        </View>
        <View style={styles.listActions}>
          <TouchableOpacity 
            style={styles.listActionButton}
            onPress={() => handleViewUser(item)}
          >
            <Ionicons name="eye-outline" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.listActionButton}
            onPress={() => handleEditUser(item)}
          >
            <Ionicons name="create-outline" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.listActionButton}
            onPress={() => handleDeleteUser(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStatsCard = (title, value, color, icon) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
    </View>
  );

  const renderFilterButton = (filter, label, icon) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === filter && styles.activeFilter]}
      onPress={() => setActiveFilter(filter)}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={activeFilter === filter ? "#fff" : "#666"} 
      />
      <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFormField = (label, value, onChange, placeholder, required = false, keyboardType = 'default') => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.formInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    return (
      <Modal
        visible={showUserDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.detailsContainer}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>User Details</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowUserDetails(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailsContent}>
            {/* User Profile */}
            <View style={styles.profileSection}>
              <Image source={{ uri: selectedUser.avatar }} style={styles.detailsAvatar} />
              <Text style={styles.detailsName}>
                {selectedUser.firstName} {selectedUser.lastName}
              </Text>
              <Text style={styles.detailsEmail}>{selectedUser.email}</Text>
              <View style={styles.detailsBadges}>
                <View style={[styles.detailsRole, { backgroundColor: getRoleColor(selectedUser.role) }]}>
                  <Text style={styles.detailsRoleText}>{selectedUser.role}</Text>
                </View>
                <View style={[styles.detailsStatus, { backgroundColor: getStatusColor(selectedUser.status) }]}>
                  <Text style={styles.detailsStatusText}>{selectedUser.status}</Text>
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Join Date</Text>
                  <Text style={styles.detailValue}>{selectedUser.joinDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Last Login</Text>
                  <Text style={styles.detailValue}>{selectedUser.lastLogin}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>IP Address</Text>
                  <Text style={styles.detailValue}>{selectedUser.ipAddress}</Text>
                </View>
              </View>
            </View>

            {/* Verification Status */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Verification Status</Text>
              <View style={styles.verificationGrid}>
                <View style={styles.verificationItem}>
                  <Ionicons 
                    name={selectedUser.emailVerified ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={selectedUser.emailVerified ? "#4CAF50" : "#FF6B6B"} 
                  />
                  <Text style={styles.verificationText}>Email Verified</Text>
                  {!selectedUser.emailVerified && (
                    <TouchableOpacity 
                      style={styles.verifyButton}
                      onPress={() => resendVerification(selectedUser, 'email')}
                    >
                      <Text style={styles.verifyButtonText}>Resend</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.verificationItem}>
                  <Ionicons 
                    name={selectedUser.phoneVerified ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={selectedUser.phoneVerified ? "#4CAF50" : "#FF6B6B"} 
                  />
                  <Text style={styles.verificationText}>Phone Verified</Text>
                  {!selectedUser.phoneVerified && (
                    <TouchableOpacity 
                      style={styles.verifyButton}
                      onPress={() => resendVerification(selectedUser, 'phone')}
                    >
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Shopping Statistics */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Shopping Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedUser.orders}</Text>
                  <Text style={styles.statLabel}>Total Orders</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCurrency(selectedUser.totalSpent)}</Text>
                  <Text style={styles.statLabel}>Total Spent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {selectedUser.orders > 0 ? formatCurrency(selectedUser.totalSpent / selectedUser.orders) : '$0'}
                  </Text>
                  <Text style={styles.statLabel}>Avg. Order</Text>
                </View>
              </View>
            </View>

            {/* Address Information */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Address</Text>
              <View style={styles.addressCard}>
                <Text style={styles.addressText}>{selectedUser.address.street}</Text>
                <Text style={styles.addressText}>
                  {selectedUser.address.city}, {selectedUser.address.state} {selectedUser.address.zipCode}
                </Text>
                <Text style={styles.addressText}>{selectedUser.address.country}</Text>
              </View>
            </View>

            {/* Preferences */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.preferencesGrid}>
                <View style={styles.preferenceItem}>
                  <Ionicons 
                    name={selectedUser.notifications ? "notifications" : "notifications-off"} 
                    size={20} 
                    color={selectedUser.notifications ? "#4CAF50" : "#666"} 
                  />
                  <Text style={styles.preferenceText}>Notifications</Text>
                </View>
                <View style={styles.preferenceItem}>
                  <Ionicons 
                    name={selectedUser.newsletter ? "mail" : "mail-outline"} 
                    size={20} 
                    color={selectedUser.newsletter ? "#4CAF50" : "#666"} 
                  />
                  <Text style={styles.preferenceText}>Newsletter</Text>
                </View>
                <View style={styles.preferenceItem}>
                  <Ionicons 
                    name={selectedUser.twoFactor ? "shield-checkmark" : "shield-outline"} 
                    size={20} 
                    color={selectedUser.twoFactor ? "#2196F3" : "#666"} 
                  />
                  <Text style={styles.preferenceText}>2FA Enabled</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity 
                  style={styles.actionButtonLarge}
                  onPress={() => handleEditUser(selectedUser)}
                >
                  <Ionicons name="create-outline" size={20} color="#666" />
                  <Text style={styles.actionButtonText}>Edit User</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButtonLarge}
                  onPress={() => {
                    // Implement send message functionality
                    Alert.alert('Send Message', `Send message to ${selectedUser.email}`);
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color="#666" />
                  <Text style={styles.actionButtonText}>Send Message</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButtonLarge}
                  onPress={() => {
                    const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
                    toggleUserStatus(selectedUser, newStatus);
                    setShowUserDetails(false);
                  }}
                >
                  <Ionicons 
                    name={selectedUser.status === 'active' ? "pause-circle" : "play-circle"} 
                    size={20} 
                    color="#666" 
                  />
                  <Text style={styles.actionButtonText}>
                    {selectedUser.status === 'active' ? 'Suspend' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>User Management</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add User</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name, email, or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Stats Overview */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          {renderStatsCard('Total Users', stats.total, '#FF6B6B', 'people-outline')}
          {renderStatsCard('Active', stats.active, '#4CAF50', 'checkmark-circle-outline')}
          {renderStatsCard('Verified', stats.verified, '#2196F3', 'shield-checkmark-outline')}
          {renderStatsCard('Admins', stats.admins, '#FFD700', 'star-outline')}
        </ScrollView>

        {/* View Toggle and Filters */}
        <View style={styles.controlsRow}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.activeView]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid" size={18} color={viewMode === 'grid' ? "#fff" : "#666"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.activeView]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={18} color={viewMode === 'list' ? "#fff" : "#666"} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {renderFilterButton('all', 'All', 'people-outline')}
            {renderFilterButton('active', 'Active', 'checkmark-circle-outline')}
            {renderFilterButton('inactive', 'Inactive', 'pause-circle-outline')}
            {renderFilterButton('suspended', 'Suspended', 'ban-outline')}
            {renderFilterButton('admins', 'Admins', 'star-outline')}
            {renderFilterButton('vendors', 'Vendors', 'storefront-outline')}
            {renderFilterButton('verified', 'Verified', 'shield-checkmark-outline')}
          </ScrollView>
        </View>
      </View>

      {/* Users List */}
      {viewMode === 'grid' ? (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserGrid}
          keyExtractor={item => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.usersGrid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserList}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.usersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first user'}
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddUser}>
            <Text style={styles.emptyButtonText}>Add User</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add/Edit User Modal */}
      <Modal
        visible={showAddModal || showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showAddModal ? 'Add New User' : 'Edit User'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                {renderFormField('First Name *', userForm.firstName, 
                  (text) => setUserForm(prev => ({ ...prev, firstName: text })), 
                  'Enter first name', true
                )}
              </View>
              <View style={styles.formHalf}>
                {renderFormField('Last Name *', userForm.lastName, 
                  (text) => setUserForm(prev => ({ ...prev, lastName: text })), 
                  'Enter last name', true
                )}
              </View>
            </View>

            {renderFormField('Email *', userForm.email, 
              (text) => setUserForm(prev => ({ ...prev, email: text })), 
              'Enter email address', true, 'email-address'
            )}

            {renderFormField('Phone', userForm.phone, 
              (text) => setUserForm(prev => ({ ...prev, phone: text })), 
              'Enter phone number', false, 'phone-pad'
            )}

            {renderFormField('Avatar URL', userForm.avatar, 
              (text) => setUserForm(prev => ({ ...prev, avatar: text })), 
              'Enter avatar image URL'
            )}

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Role *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.optionsContainer}>
                      {roleOptions.map(role => (
                        <TouchableOpacity
                          key={role}
                          style={[
                            styles.optionButton,
                            userForm.role === role && styles.selectedOption
                          ]}
                          onPress={() => setUserForm(prev => ({ ...prev, role }))}
                        >
                          <Text style={[
                            styles.optionText,
                            userForm.role === role && styles.selectedOptionText
                          ]}>
                            {role}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
              <View style={styles.formHalf}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Status *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.optionsContainer}>
                      {statusOptions.map(status => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.optionButton,
                            userForm.status === status && styles.selectedOption
                          ]}
                          onPress={() => setUserForm(prev => ({ ...prev, status }))}
                        >
                          <Text style={[
                            styles.optionText,
                            userForm.status === status && styles.selectedOptionText
                          ]}>
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Address Information</Text>

            {renderFormField('Street', userForm.address.street, 
              (text) => setUserForm(prev => ({ 
                ...prev, 
                address: { ...prev.address, street: text }
              })), 
              'Enter street address'
            )}

            <View style={styles.formRow}>
              <View style={styles.formThird}>
                {renderFormField('City', userForm.address.city, 
                  (text) => setUserForm(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, city: text }
                  })), 
                  'City'
                )}
              </View>
              <View style={styles.formThird}>
                {renderFormField('State', userForm.address.state, 
                  (text) => setUserForm(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, state: text }
                  })), 
                  'State'
                )}
              </View>
              <View style={styles.formThird}>
                {renderFormField('ZIP', userForm.address.zipCode, 
                  (text) => setUserForm(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, zipCode: text }
                  })), 
                  'ZIP Code'
                )}
              </View>
            </View>

            {renderFormField('Country', userForm.address.country, 
              (text) => setUserForm(prev => ({ 
                ...prev, 
                address: { ...prev.address, country: text }
              })), 
              'Country'
            )}

            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Email Notifications</Text>
                <Switch
                  value={userForm.notifications}
                  onValueChange={(value) => setUserForm(prev => ({ ...prev, notifications: value }))}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={userForm.notifications ? '#4CAF50' : '#f4f3f4'}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Newsletter Subscription</Text>
                <Switch
                  value={userForm.newsletter}
                  onValueChange={(value) => setUserForm(prev => ({ ...prev, newsletter: value }))}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={userForm.newsletter ? '#2196F3' : '#f4f3f4'}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Two-Factor Authentication</Text>
                <Switch
                  value={userForm.twoFactor}
                  onValueChange={(value) => setUserForm(prev => ({ ...prev, twoFactor: value }))}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={userForm.twoFactor ? '#FF6B6B' : '#f4f3f4'}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveUser}>
              <Text style={styles.saveButtonText}>
                {showAddModal ? 'Create User' : 'Update User'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* User Details Modal */}
      {renderUserDetails()}
    </View>
  );
};

// ... (Styles remain the same as previous components with appropriate adjustments for user management)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    marginBottom: 15,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 150,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeView: {
    backgroundColor: '#FF6B6B',
  },
  filtersContainer: {
    flex: 1,
    marginLeft: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  usersGrid: {
    padding: 10,
  },
  usersList: {
    padding: 10,
  },
  userCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 5,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: (width - 30) / 2,
  },
  userHeader: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userBadges: {
    position: 'absolute',
    top: -5,
    right: -5,
    flexDirection: 'row',
  },
  verifiedBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    marginLeft: 2,
  },
  twoFactorBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    marginLeft: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  roleText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  joinDate: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    padding: 6,
  },
  userListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  listBadges: {
    flexDirection: 'row',
  },
  listEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  listMeta: {
    flexDirection: 'row',
  },
  listRole: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  listRoleText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  listStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  listStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  listRight: {
    alignItems: 'flex-end',
  },
  listStats: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  listOrders: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  listSpent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  listActions: {
    flexDirection: 'row',
  },
  listActionButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#FF6B6B',
  },
  formInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formHalf: {
    width: '48%',
  },
  formThird: {
    width: '31%',
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
  switchContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // User Details Styles
  detailsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  detailsHeader: {
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
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsContent: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  detailsName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  detailsBadges: {
    flexDirection: 'row',
  },
  detailsRole: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  detailsRoleText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  detailsStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailsStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  verificationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    marginRight: 8,
  },
  verifyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  verifyButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  preferencesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  preferenceItem: {
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtonLarge: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '31%',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default UserManagementScreen;