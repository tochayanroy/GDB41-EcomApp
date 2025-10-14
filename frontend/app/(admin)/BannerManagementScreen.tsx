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
    image: '',
    targetScreen: 'Home',
    position: '1',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    buttonText: 'Shop Now',
    backgroundColor: '#FF6B6B',
    textColor: '#FFFFFF'
  });

  // Static banners data
  const staticBanners = [
    {
      id: '1',
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on all items',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
      targetScreen: 'Products',
      position: 1,
      isActive: true,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      buttonText: 'Shop Now',
      backgroundColor: '#FF6B6B',
      textColor: '#FFFFFF',
      clicks: 1245,
      impressions: 8943,
      createdAt: '2024-01-01',
      createdBy: 'Admin'
    },
    {
      id: '2',
      title: 'New Arrivals',
      subtitle: 'Discover the latest trends',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      targetScreen: 'NewArrivals',
      position: 2,
      isActive: true,
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      buttonText: 'Explore',
      backgroundColor: '#4ECDC4',
      textColor: '#FFFFFF',
      clicks: 867,
      impressions: 5678,
      createdAt: '2024-01-15',
      createdBy: 'Admin'
    },
    {
      id: '3',
      title: 'Electronics Week',
      subtitle: 'Smart gadgets at amazing prices',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      targetScreen: 'CategoryProducts',
      position: 3,
      isActive: false,
      startDate: '2024-02-01',
      endDate: '2024-02-07',
      buttonText: 'View Deals',
      backgroundColor: '#45B7D1',
      textColor: '#FFFFFF',
      clicks: 543,
      impressions: 3456,
      createdAt: '2024-01-20',
      createdBy: 'Admin'
    },
    {
      id: '4',
      title: 'Winter Collection',
      subtitle: 'Stay warm in style',
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
      targetScreen: 'CategoryProducts',
      position: 4,
      isActive: true,
      startDate: '2024-11-01',
      endDate: '2024-12-31',
      buttonText: 'Browse Collection',
      backgroundColor: '#96CEB4',
      textColor: '#FFFFFF',
      clicks: 321,
      impressions: 2345,
      createdAt: '2024-01-25',
      createdBy: 'Admin'
    },
    {
      id: '5',
      title: 'Flash Sale',
      subtitle: 'Limited time offers - 24 hours only',
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=400',
      targetScreen: 'FlashSale',
      position: 5,
      isActive: true,
      startDate: '2024-01-28',
      endDate: '2024-01-29',
      buttonText: 'Grab Deal',
      backgroundColor: '#FFA07A',
      textColor: '#FFFFFF',
      clicks: 1567,
      impressions: 6789,
      createdAt: '2024-01-27',
      createdBy: 'Admin'
    },
    {
      id: '6',
      title: 'Back to School',
      subtitle: 'Everything you need for the new semester',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      targetScreen: 'CategoryProducts',
      position: 6,
      isActive: false,
      startDate: '2024-07-15',
      endDate: '2024-09-15',
      buttonText: 'Get Ready',
      backgroundColor: '#DDA0DD',
      textColor: '#FFFFFF',
      clicks: 0,
      impressions: 0,
      createdAt: '2024-01-30',
      createdBy: 'Admin'
    }
  ];

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

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    filterBanners();
    calculateStats();
  }, [banners, searchQuery, activeFilter]);

  const loadBanners = () => {
    setLoading(true);
    setTimeout(() => {
      setBanners(staticBanners);
      setLoading(false);
    }, 1000);
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
        banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
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
      case 'highPerformance':
        filtered = filtered.filter(banner => banner.clicks > 1000);
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
      image: '',
      targetScreen: 'Home',
      position: (banners.length + 1).toString(),
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      buttonText: 'Shop Now',
      backgroundColor: '#FF6B6B',
      textColor: '#FFFFFF'
    });
  };

  const handleAddBanner = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditBanner = (banner) => {
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      targetScreen: banner.targetScreen,
      position: banner.position.toString(),
      isActive: banner.isActive,
      startDate: banner.startDate,
      endDate: banner.endDate,
      buttonText: banner.buttonText,
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor
    });
    setSelectedBanner(banner);
    setShowEditModal(true);
  };

  const handleSaveBanner = () => {
    // Validation
    if (!bannerForm.title || !bannerForm.image || !bannerForm.startDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (showAddModal) {
      // Add new banner
      const newBanner = {
        id: Date.now().toString(),
        ...bannerForm,
        position: parseInt(bannerForm.position),
        clicks: 0,
        impressions: 0,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Admin'
      };

      setBanners(prev => [newBanner, ...prev]);
      Alert.alert('Success', 'Banner added successfully');
    } else {
      // Update existing banner
      const updatedBanners = banners.map(b =>
        b.id === selectedBanner.id
          ? {
              ...b,
              ...bannerForm,
              position: parseInt(bannerForm.position)
            }
          : b
      );

      setBanners(updatedBanners);
      Alert.alert('Success', 'Banner updated successfully');
    }

    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteBanner = (banner) => {
    Alert.alert(
      'Delete Banner',
      `Are you sure you want to delete "${banner.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBanners(prev => prev.filter(b => b.id !== banner.id));
            Alert.alert('Success', 'Banner deleted successfully');
          }
        }
      ]
    );
  };

  const toggleBannerStatus = (banner) => {
    const updatedBanners = banners.map(b =>
      b.id === banner.id ? { ...b, isActive: !b.isActive } : b
    );
    setBanners(updatedBanners);
  };

  const duplicateBanner = (banner) => {
    const newBanner = {
      ...banner,
      id: Date.now().toString(),
      title: `${banner.title} (Copy)`,
      clicks: 0,
      impressions: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setBanners(prev => [newBanner, ...prev]);
    Alert.alert('Success', 'Banner duplicated successfully');
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

  const getPerformanceColor = (clicks, impressions) => {
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    if (ctr > 5) return '#4CAF50';
    if (ctr > 2) return '#FFA500';
    return '#FF6B6B';
  };

  const renderBannerItem = ({ item }) => {
    const status = getBannerStatus(item);
    const performanceColor = getPerformanceColor(item.clicks, item.impressions);
    const ctr = item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(1) : 0;

    return (
      <View style={styles.bannerCard}>
        {/* Banner Preview */}
        <View style={styles.bannerPreview}>
          <Image source={{ uri: item.image }} style={styles.bannerImage} />
          <View style={[styles.bannerOverlay, { backgroundColor: item.backgroundColor }]}>
            <View style={styles.bannerContent}>
              <Text style={[styles.previewTitle, { color: item.textColor }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.previewSubtitle, { color: item.textColor }]} numberOfLines={1}>
                {item.subtitle}
              </Text>
              <View style={[styles.previewButton, { backgroundColor: item.textColor }]}>
                <Text style={[styles.previewButtonText, { color: item.backgroundColor }]}>
                  {item.buttonText}
                </Text>
              </View>
            </View>
          </View>
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
                onPress={() => duplicateBanner(item)}
              >
                <Ionicons name="copy-outline" size={18} color="#666" />
              </TouchableOpacity>
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
              <Ionicons name="navigate-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{item.targetScreen}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={14} color="#666" />
              <Text style={styles.metaText}>Position: {item.position}</Text>
            </View>
          </View>

          <View style={styles.performanceStats}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Impressions</Text>
              <Text style={styles.performanceValue}>{item.impressions.toLocaleString()}</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Clicks</Text>
              <Text style={styles.performanceValue}>{item.clicks.toLocaleString()}</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>CTR</Text>
              <Text style={[styles.performanceValue, { color: performanceColor }]}>
                {ctr}%
              </Text>
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
              onPress={() => toggleBannerStatus(item)}
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
          {renderFilterButton('highPerformance', 'Top Performing', 'trending-up-outline')}
        </ScrollView>
      </View>

      {/* Banners List */}
      <FlatList
        data={filteredBanners}
        renderItem={renderBannerItem}
        keyExtractor={item => item.id}
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
                  <Image source={{ uri: bannerForm.image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                    <Text style={styles.previewPlaceholderText}>Banner Image</Text>
                  </View>
                )}
                <View style={[styles.previewOverlay, { backgroundColor: bannerForm.backgroundColor }]}>
                  <View style={styles.previewContent}>
                    <Text style={[styles.previewTitleText, { color: bannerForm.textColor }]} numberOfLines={1}>
                      {bannerForm.title || 'Banner Title'}
                    </Text>
                    <Text style={[styles.previewSubtitleText, { color: bannerForm.textColor }]} numberOfLines={1}>
                      {bannerForm.subtitle || 'Banner subtitle text'}
                    </Text>
                    <View style={[styles.previewButtonModal, { backgroundColor: bannerForm.textColor }]}>
                      <Text style={[styles.previewButtonModalText, { color: bannerForm.backgroundColor }]}>
                        {bannerForm.buttonText || 'Button'}
                      </Text>
                    </View>
                  </View>
                </View>
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

            {renderFormField('Image URL *', bannerForm.image, 
              (text) => setBannerForm(prev => ({ ...prev, image: text })), 
              'Enter image URL', true
            )}

            {renderFormField('Button Text', bannerForm.buttonText, 
              (text) => setBannerForm(prev => ({ ...prev, buttonText: text })), 
              'Enter button text'
            )}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Target Screen</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsContainer}>
                  {targetScreens.map(screen => (
                    <TouchableOpacity
                      key={screen}
                      style={[
                        styles.optionButton,
                        bannerForm.targetScreen === screen && styles.selectedOption
                      ]}
                      onPress={() => setBannerForm(prev => ({ ...prev, targetScreen: screen }))}
                    >
                      <Text style={[
                        styles.optionText,
                        bannerForm.targetScreen === screen && styles.selectedOptionText
                      ]}>
                        {screen}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                {renderFormField('Position', bannerForm.position, 
                  (text) => setBannerForm(prev => ({ ...prev, position: text })), 
                  '1', false
                )}
              </View>
              <View style={styles.formHalf}>
                {renderFormField('Start Date *', bannerForm.startDate, 
                  (text) => setBannerForm(prev => ({ ...prev, startDate: text })), 
                  'YYYY-MM-DD', true
                )}
              </View>
            </View>

            {renderFormField('End Date', bannerForm.endDate, 
              (text) => setBannerForm(prev => ({ ...prev, endDate: text })), 
              'YYYY-MM-DD (optional)'
            )}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Background Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.colorContainer}>
                  {colorOptions.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        bannerForm.backgroundColor === color && styles.selectedColor
                      ]}
                      onPress={() => setBannerForm(prev => ({ ...prev, backgroundColor: color }))}
                    >
                      {bannerForm.backgroundColor === color && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Text Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.colorContainer}>
                  {['#FFFFFF', '#000000', '#333333', '#666666'].map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        bannerForm.textColor === color && styles.selectedColor
                      ]}
                      onPress={() => setBannerForm(prev => ({ ...prev, textColor: color }))}
                    >
                      {bannerForm.textColor === color && (
                        <Ionicons name="checkmark" size={16} color={color === '#FFFFFF' ? '#000' : '#fff'} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
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

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveBanner}>
              <Text style={styles.saveButtonText}>
                {showAddModal ? 'Create Banner' : 'Update Banner'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 15,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  previewButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  previewButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 20,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  previewTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewSubtitleText: {
    fontSize: 14,
    marginBottom: 12,
  },
  previewButtonModal: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  previewButtonModalText: {
    fontSize: 12,
    fontWeight: '600',
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
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
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
});

export default BannerManagementScreen;