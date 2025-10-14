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
    TextInput,
    Alert,
    ActivityIndicator,
    Switch,
    Modal
} from 'react-native';

const { width } = Dimensions.get('window');

const UserProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, settings, orders
  const [editMode, setEditMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    orderUpdates: true,
    promotions: true,
    securityAlerts: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    allowFriendRequests: true,
    showActivity: true,
    searchVisibility: true
  });

  // Static user data
  const staticUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
    joinDate: '2023-01-15',
    membership: 'Gold Member',
    points: 1250,
    addresses: [
      {
        id: '1',
        type: 'home',
        name: 'Home',
        street: '123 Main Street',
        apartment: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        isDefault: true
      },
      {
        id: '2',
        type: 'work',
        name: 'Work',
        street: '456 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'United States',
        isDefault: false
      }
    ],
    paymentMethods: [
      {
        id: '1',
        type: 'Credit Card',
        last4: '4242',
        brand: 'Visa',
        expiry: '12/25',
        isDefault: true
      },
      {
        id: '2',
        type: 'PayPal',
        email: 'john.doe@example.com',
        isDefault: false
      }
    ],
    stats: {
      totalOrders: 15,
      completedOrders: 12,
      pendingOrders: 2,
      cancelledOrders: 1,
      totalSpent: 2450.75,
      favoriteCategory: 'Electronics'
    }
  };

  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setUser(staticUser);
      setUserForm({
        name: staticUser.name,
        email: staticUser.email,
        phone: staticUser.phone,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveProfile = () => {
    // Validate form
    if (!userForm.name.trim() || !userForm.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setUser(prev => ({
        ...prev,
        name: userForm.name,
        email: userForm.email,
        phone: userForm.phone
      }));
      setEditMode(false);
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1000);
  };

  const handleChangePassword = () => {
    if (!userForm.currentPassword || !userForm.newPassword || !userForm.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (userForm.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (userForm.newPassword !== userForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // Simulate password change
    setLoading(true);
    setTimeout(() => {
      setUserForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setLoading(false);
      Alert.alert('Success', 'Password changed successfully!');
    }, 1000);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const togglePrivacySetting = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getMembershipColor = (membership) => {
    const colors = {
      'Gold Member': '#FFD700',
      'Silver Member': '#C0C0C0',
      'Bronze Member': '#CD7F32',
      'Basic Member': '#666'
    };
    return colors[membership] || '#666';
  };

  // Render functions with null checks
  const renderProfileHeader = () => {
    if (!user) return null;

    return (
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={[styles.membershipBadge, { backgroundColor: getMembershipColor(user.membership) }]}>
            <Text style={styles.membershipText}>{user.membership}</Text>
          </View>
          <Text style={styles.joinDate}>Member since {formatJoinDate(user.joinDate)}</Text>
        </View>
      </View>
    );
  };

  const renderStats = () => {
    if (!user) return null;

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Activity</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.stats.completedOrders}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.points}</Text>
            <Text style={styles.statLabel}>Reward Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${user.stats.totalSpent}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderProfileTab = () => {
    if (!user) return null;

    return (
      <View style={styles.tabContent}>
        {!editMode ? (
          <>
            {renderProfileHeader()}
            {renderStats()}

            {/* Personal Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setEditMode(true)}
                >
                  <Ionicons name="create-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{user.name}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Member ID</Text>
                  <Text style={styles.infoValue}>{user.id}</Text>
                </View>
              </View>
            </View>

            {/* Addresses */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Saved Addresses</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Ionicons name="add" size={16} color="#FF6B6B" />
                  <Text style={styles.addButtonText}>Add New</Text>
                </TouchableOpacity>
              </View>
              {user.addresses.map(address => (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressType}>
                      <Ionicons 
                        name={address.type === 'home' ? 'home' : 'business'} 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.addressName}>{address.name}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="create-outline" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.addressText}>{address.street}</Text>
                  {address.apartment && (
                    <Text style={styles.addressText}>{address.apartment}</Text>
                  )}
                  <Text style={styles.addressText}>
                    {address.city}, {address.state} {address.zipCode}
                  </Text>
                  <Text style={styles.addressText}>{address.country}</Text>
                </View>
              ))}
            </View>

            {/* Payment Methods */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Methods</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Ionicons name="add" size={16} color="#FF6B6B" />
                  <Text style={styles.addButtonText}>Add New</Text>
                </TouchableOpacity>
              </View>
              {user.paymentMethods.map(payment => (
                <View key={payment.id} style={styles.paymentCard}>
                  <View style={styles.paymentMethod}>
                    <Ionicons name="card" size={20} color="#666" />
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentType}>{payment.type}</Text>
                      <Text style={styles.paymentDetails}>
                        {payment.last4 ? `**** **** **** ${payment.last4}` : payment.email}
                      </Text>
                    </View>
                  </View>
                  {payment.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.editForm}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={userForm.name}
                onChangeText={(text) => setUserForm(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={userForm.email}
                onChangeText={(text) => setUserForm(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={userForm.phone}
                onChangeText={(text) => setUserForm(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setEditMode(false);
                  setUserForm({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates via email</Text>
            </View>
            <Switch
              value={notifications.email}
              onValueChange={() => toggleNotification('email')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications.email ? '#FF6B6B' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive push notifications</Text>
            </View>
            <Switch
              value={notifications.push}
              onValueChange={() => toggleNotification('push')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications.push ? '#FF6B6B' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Order Updates</Text>
              <Text style={styles.settingDescription}>Get order status updates</Text>
            </View>
            <Switch
              value={notifications.orderUpdates}
              onValueChange={() => toggleNotification('orderUpdates')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications.orderUpdates ? '#FF6B6B' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Promotions & Offers</Text>
              <Text style={styles.settingDescription}>Special deals and discounts</Text>
            </View>
            <Switch
              value={notifications.promotions}
              onValueChange={() => toggleNotification('promotions')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications.promotions ? '#FF6B6B' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Privacy & Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Show Online Status</Text>
              <Text style={styles.settingDescription}>Allow others to see when you're online</Text>
            </View>
            <Switch
              value={privacySettings.showOnlineStatus}
              onValueChange={() => togglePrivacySetting('showOnlineStatus')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={privacySettings.showOnlineStatus ? '#FF6B6B' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Allow Friend Requests</Text>
              <Text style={styles.settingDescription}>Let other users send you friend requests</Text>
            </View>
            <Switch
              value={privacySettings.allowFriendRequests}
              onValueChange={() => togglePrivacySetting('allowFriendRequests')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={privacySettings.allowFriendRequests ? '#FF6B6B' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Search Visibility</Text>
              <Text style={styles.settingDescription}>Allow your profile to appear in search results</Text>
            </View>
            <Switch
              value={privacySettings.searchVisibility}
              onValueChange={() => togglePrivacySetting('searchVisibility')}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={privacySettings.searchVisibility ? '#FF6B6B' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Change Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.passwordForm}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={userForm.currentPassword}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, currentPassword: text }))}
              placeholder="Enter current password"
              secureTextEntry
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={userForm.newPassword}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, newPassword: text }))}
              placeholder="Enter new password"
              secureTextEntry
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={userForm.confirmPassword}
              onChangeText={(text) => setUserForm(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Confirm new password"
              secureTextEntry
            />
          </View>
          <TouchableOpacity 
            style={styles.changePasswordButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.changePasswordButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <View style={styles.accountActions}>
          <TouchableOpacity style={styles.accountAction}>
            <Ionicons name="download-outline" size={20} color="#666" />
            <Text style={styles.accountActionText}>Download Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accountAction}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <Text style={styles.accountActionText}>Deactivate Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.accountAction, styles.deleteAction]}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            <Text style={[styles.accountActionText, styles.deleteActionText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOrdersTab = () => {
    if (!user) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.ordersOverview}>
          <View style={styles.orderStat}>
            <Ionicons name="time-outline" size={24} color="#FFA500" />
            <Text style={styles.orderStatNumber}>{user.stats.pendingOrders}</Text>
            <Text style={styles.orderStatLabel}>Pending</Text>
          </View>
          <View style={styles.orderStat}>
            <Ionicons name="checkmark-done-outline" size={24} color="#4CAF50" />
            <Text style={styles.orderStatNumber}>{user.stats.completedOrders}</Text>
            <Text style={styles.orderStatLabel}>Completed</Text>
          </View>
          <View style={styles.orderStat}>
            <Ionicons name="close-outline" size={24} color="#F44336" />
            <Text style={styles.orderStatNumber}>{user.stats.cancelledOrders}</Text>
            <Text style={styles.orderStatLabel}>Cancelled</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="cart-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Order Completed</Text>
                <Text style={styles.activityDescription}>Your order #ORD-015 has been delivered</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="star-outline" size={20} color="#FFD700" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Review Added</Text>
                <Text style={styles.activityDescription}>You reviewed Wireless Headphones</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="card-outline" size={20} color="#2196F3" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Payment Method Updated</Text>
                <Text style={styles.activityDescription}>You added a new credit card</Text>
                <Text style={styles.activityTime}>3 days ago</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.viewAllOrdersButton}>
          <Text style={styles.viewAllOrdersText}>View All Orders</Text>
          <Ionicons name="arrow-forward" size={16} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTabContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'settings':
        return renderSettingsTab();
      case 'orders':
        return renderOrdersTab();
      default:
        return renderProfileTab();
    }
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={activeTab === 'profile' ? '#FF6B6B' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons 
            name="receipt-outline" 
            size={20} 
            color={activeTab === 'orders' ? '#FF6B6B' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons 
            name="settings-outline" 
            size={20} 
            color={activeTab === 'settings' ? '#FF6B6B' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Profile not found</Text>
        <Text style={styles.errorSubtext}>
          There was an error loading your profile. Please try again.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setTimeout(() => {
              setUser(staticUser);
              setUserForm({
                name: staticUser.name,
                email: staticUser.email,
                phone: staticUser.phone,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
              setLoading(false);
            }, 1000);
          }}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        {renderTabs()}

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

// Styles remain exactly the same as previous code...
// [All the StyleSheet.create code from previous response]

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
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  // Tabs
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    marginLeft: 8,
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
  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  membershipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  joinDate: {
    fontSize: 12,
    color: '#999',
  },
  // Stats Section
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Sections
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  // Info Grid
  infoGrid: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // Address Card
  addressCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  // Payment Card
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 12,
    color: '#666',
  },
  // Default Badge
  defaultBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Edit Form
  editForm: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    padding: 15,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Settings
  settingsList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  // Password Form
  passwordForm: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
  },
  changePasswordButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Account Actions
  accountActions: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  accountAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  accountActionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  deleteAction: {
    borderBottomWidth: 0,
  },
  deleteActionText: {
    color: '#FF6B6B',
  },
  // Orders Tab
  ordersOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  orderStat: {
    alignItems: 'center',
    flex: 1,
  },
  orderStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  orderStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  activityList: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
  },
  viewAllOrdersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
  },
  viewAllOrdersText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default UserProfileScreen;