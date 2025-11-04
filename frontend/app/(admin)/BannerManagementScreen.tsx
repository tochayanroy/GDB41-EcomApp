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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.102:5000';

const BannerManagementScreen = () => {
  const [banners, setBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0
  });

  // Form state for add/edit banner
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image: null,
    link: '',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const targetScreens = [
    'Home',
    'Products',
    'NewArrivals',
    'CategoryProducts',
    'FlashSale',
    'Offers',
    'Cart',
    'Profile'
  ];

  const colorOptions = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA07A', '#DDA0DD',
    '#FFD700', '#87CEEB', '#98FB98', '#FFB6C1', '#D2B48C', '#F0E68C'
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

  // Request camera and gallery permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera and gallery permissions to make this work!');
      return false;
    }
    return true;
  };

  // Image Picker Functions
  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setBannerForm(prev => ({ 
          ...prev, 
          image: result.assets[0] 
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setBannerForm(prev => ({ 
          ...prev, 
          image: result.assets[0] 
        }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhotoWithCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImageFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const removeSelectedImage = () => {
    setBannerForm(prev => ({ ...prev, image: null }));
  };

  // API Functions
  const fetchBanners = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/banner/allBanner`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      Alert.alert('Error', 'Failed to fetch banners');
      return [];
    }
  };

  const createBanner = async (formData) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/banner/addBanner`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  };

  const updateBanner = async (bannerId, formData) => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/banner/update/${bannerId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  };

  const updateBannerImage = async (bannerId, formData) => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/banner/updateImage/${bannerId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating banner image:', error);
      throw error;
    }
  };

  const deleteBanner = async (bannerId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/banner/${bannerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  };

  const toggleBannerStatus = async (bannerId, isActive) => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/banner/${bannerId}/activate`, 
        { isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling banner status:', error);
      throw error;
    }
  };

  const reorderBanners = async (bannerIds) => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/banner/reorder`, 
        { bannerIds },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error reordering banners:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    filterBanners();
    calculateStats();
  }, [banners, searchQuery, activeFilter]);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const bannersData = await fetchBanners();
      setBanners(bannersData);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBanners();
    setRefreshing(false);
  };

  const filterBanners = () => {
    let filtered = banners;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(banner =>
        banner.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    const today = new Date().toISOString().split('T')[0];
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(banner => 
          banner.isActive && 
          banner.startDate <= today && 
          (!banner.endDate || banner.endDate >= today)
        );
        break;
      case 'inactive':
        filtered = filtered.filter(banner => !banner.isActive);
        break;
      case 'scheduled':
        filtered = filtered.filter(banner => banner.startDate > today);
        break;
      case 'expired':
        filtered = filtered.filter(banner => 
          banner.endDate && banner.endDate < today
        );
        break;
    }

    setFilteredBanners(filtered);
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const total = banners.length;
    const active = banners.filter(banner => 
      banner.isActive && banner.startDate <= today && (!banner.endDate || banner.endDate >= today)
    ).length;
    const scheduled = banners.filter(banner => banner.startDate > today).length;
    const expired = banners.filter(banner => banner.endDate && banner.endDate < today).length;

    setStats({ total, active, scheduled, expired });
  };

  const resetForm = () => {
    setBannerForm({
      title: '',
      subtitle: '',
      image: null,
      link: '',
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
  };

  const handleAddBanner = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditBanner = (banner) => {
    setBannerForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image ? { uri: `${API_BASE_URL}/${banner.image}` } : null,
      link: banner.link || '',
      isActive: banner.isActive !== false,
      startDate: banner.startDate || new Date().toISOString().split('T')[0],
      endDate: banner.endDate || ''
    });
    setSelectedBanner(banner);
    setShowEditModal(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.title) {
      Alert.alert('Error', 'Please fill in banner title');
      return;
    }

    if (!bannerForm.image) {
      Alert.alert('Error', 'Please select a banner image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', bannerForm.title);
      formData.append('subtitle', bannerForm.subtitle);
      formData.append('link', bannerForm.link);
      formData.append('isActive', bannerForm.isActive.toString());
      formData.append('startDate', bannerForm.startDate);
      if (bannerForm.endDate) {
        formData.append('endDate', bannerForm.endDate);
      }

      // Add image if selected
      if (bannerForm.image && bannerForm.image.uri) {
        if (bannerForm.image.uri.startsWith('file:')) {
          formData.append('image', {
            uri: bannerForm.image.uri,
            type: 'image/jpeg',
            name: `banner_${Date.now()}.jpg`
          });
        }
      }

      if (showAddModal) {
        await createBanner(formData);
        Alert.alert('Success', 'Banner added successfully');
      } else {
        await updateBanner(selectedBanner._id, formData);
        Alert.alert('Success', 'Banner updated successfully');
      }

      await loadBanners();
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving banner:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async (banner) => {
    Alert.alert(
      'Delete Banner',
      `Are you sure you want to delete "${banner.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBanner(banner._id);
              Alert.alert('Success', 'Banner deleted successfully');
              await loadBanners();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete banner');
            }
          }
        }
      ]
    );
  };

  const handleToggleBannerStatus = async (banner) => {
    try {
      await toggleBannerStatus(banner._id, !banner.isActive);
      Alert.alert('Success', `Banner ${!banner.isActive ? 'activated' : 'deactivated'} successfully`);
      await loadBanners();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update banner status');
    }
  };

  const handleUpdateBannerImage = async (banner) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `banner_${Date.now()}.jpg`
        });

        await updateBannerImage(banner._id, formData);
        Alert.alert('Success', 'Banner image updated successfully');
        await loadBanners();
      }
    } catch (error) {
      console.error('Error updating banner image:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update banner image');
    }
  };

  const getBannerStatus = (banner) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (!banner.isActive) {
      return { text: 'Inactive', color: '#FF6B6B', icon: 'pause-circle' };
    }
    if (banner.startDate > today) {
      return { text: 'Scheduled', color: '#FFA500', icon: 'time-outline' };
    }
    if (banner.endDate && banner.endDate < today) {
      return { text: 'Expired', color: '#666', icon: 'calendar-outline' };
    }
    return { text: 'Active', color: '#4CAF50', icon: 'play-circle' };
  };

  const renderBannerItem = ({ item }) => {
    const status = getBannerStatus(item);

    return (
      <View style={styles.bannerCard}>
        {/* Banner Preview */}
        <View style={styles.bannerPreview}>
          <Image 
            source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/400x150' }} 
            style={styles.bannerImage} 
          />
          <TouchableOpacity 
            style={styles.imageUpdateButton}
            onPress={() => handleUpdateBannerImage(item)}
          >
            <Ionicons name="camera" size={16} color="#fff" />
            <Text style={styles.imageUpdateText}>Update Image</Text>
          </TouchableOpacity>
        </View>

        {/* Banner Info */}
        <View style={styles.bannerInfo}>
          <View style={styles.bannerHeader}>
            <View style={styles.bannerTitleSection}>
              <Text style={styles.bannerName} numberOfLines={1}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Ionicons name={status.icon} size={12} color="#fff" />
                <Text style={styles.statusText}>{status.text}</Text>
              </View>
            </View>
            <View style={styles.bannerActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditBanner(item)}
              >
                <Ionicons name="create-outline" size={18} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteBanner(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.bannerSubtitle} numberOfLines={2}>{item.subtitle}</Text>
          
          <View style={styles.bannerMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="link-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{item.link || 'No link'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={14} color="#666" />
              <Text style={styles.metaText}>Order: {item.order}</Text>
            </View>
          </View>

          <View style={styles.dateRange}>
            <Text style={styles.dateText}>
              {item.startDate} {item.endDate ? `- ${item.endDate}` : '(No end date)'}
            </Text>
          </View>

          <View style={styles.bannerControls}>
            <TouchableOpacity 
              style={[styles.statusButton, item.isActive ? styles.activeButton : styles.inactiveButton]}
              onPress={() => handleToggleBannerStatus(item)}
            >
              <Text style={styles.statusButtonText}>
                {item.isActive ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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

  const renderFormField = (label, value, onChange, placeholder, required = false) => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.formInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
      />
    </View>
  );

  const renderImagePickerSection = () => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>Banner Image *</Text>
      
      {bannerForm.image ? (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: bannerForm.image.uri }} 
            style={styles.imagePreview} 
          />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={removeSelectedImage}
          >
            <Ionicons name="close-circle" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.imagePickerButton}
          onPress={showImagePickerOptions}
        >
          <Ionicons name="camera" size={24} color="#666" />
          <Text style={styles.imagePickerText}>Select Banner Image</Text>
          <Text style={styles.imagePickerSubtext}>Tap to choose from gallery or camera</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading banners...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Banner Management</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddBanner}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Banner</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search banners by title or subtitle..."
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
          {renderStatsCard('Total Banners', stats.total, '#FF6B6B', 'images-outline')}
          {renderStatsCard('Active', stats.active, '#4CAF50', 'play-circle-outline')}
          {renderStatsCard('Scheduled', stats.scheduled, '#FFA500', 'time-outline')}
          {renderStatsCard('Expired', stats.expired, '#666', 'calendar-outline')}
        </ScrollView>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {renderFilterButton('all', 'All', 'grid-outline')}
          {renderFilterButton('active', 'Active', 'play-circle-outline')}
          {renderFilterButton('inactive', 'Inactive', 'pause-circle-outline')}
          {renderFilterButton('scheduled', 'Scheduled', 'time-outline')}
          {renderFilterButton('expired', 'Expired', 'calendar-outline')}
        </ScrollView>
      </View>

      {/* Banners List */}
      <FlatList
        data={filteredBanners}
        renderItem={renderBannerItem}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bannersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No banners found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Start by creating your first banner'}
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddBanner}>
              <Text style={styles.emptyButtonText}>Create Banner</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add/Edit Banner Modal */}
      <Modal
        visible={showAddModal || showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showAddModal ? 'Create New Banner' : 'Edit Banner'}
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
            {/* Banner Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.bannerPreviewModal}>
                {bannerForm.image ? (
                  <Image source={{ uri: bannerForm.image.uri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                    <Text style={styles.previewPlaceholderText}>Banner Image</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Form Fields */}
            {renderFormField('Banner Title *', bannerForm.title, 
              (text) => setBannerForm(prev => ({ ...prev, title: text })), 
              'Enter banner title', true
            )}

            {renderFormField('Subtitle', bannerForm.subtitle, 
              (text) => setBannerForm(prev => ({ ...prev, subtitle: text })), 
              'Enter banner subtitle'
            )}

            {renderFormField('Link', bannerForm.link, 
              (text) => setBannerForm(prev => ({ ...prev, link: text })), 
              'Enter banner link URL'
            )}

            {/* Image Picker Section */}
            {renderImagePickerSection()}

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                {renderFormField('Start Date *', bannerForm.startDate, 
                  (text) => setBannerForm(prev => ({ ...prev, startDate: text })), 
                  'YYYY-MM-DD', true
                )}
              </View>
              <View style={styles.formHalf}>
                {renderFormField('End Date', bannerForm.endDate, 
                  (text) => setBannerForm(prev => ({ ...prev, endDate: text })), 
                  'YYYY-MM-DD (optional)'
                )}
              </View>
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active Banner</Text>
                <Switch
                  value={bannerForm.isActive}
                  onValueChange={(value) => setBannerForm(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={bannerForm.isActive ? '#FF6B6B' : '#f4f3f4'}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, uploading && styles.saveButtonDisabled]} 
              onPress={handleSaveBanner}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {showAddModal ? 'Create Banner' : 'Update Banner'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ... (keep all the same styles from the previous code, just add the new image picker styles)

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
  filtersContainer: {
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  bannersList: {
    padding: 10,
  },
  bannerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  bannerPreview: {
    height: 120,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imageUpdateButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageUpdateText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  bannerInfo: {
    padding: 15,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bannerTitleSection: {
    flex: 1,
    marginRight: 10,
  },
  bannerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  bannerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  bannerMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dateRange: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  bannerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: '#FFE6E6',
  },
  inactiveButton: {
    backgroundColor: '#E8F5E8',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
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
  previewSection: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bannerPreviewModal: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
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
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // Image Picker Styles
  imagePickerButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  imagePickerSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BannerManagementScreen;