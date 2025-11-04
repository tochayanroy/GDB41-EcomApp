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

const CategoryManagementScreen = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    featured: 0,
    empty: 0
  });

  // Form state for add/edit category
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: null,
    icon: 'cube-outline',
    color: '#FF6B6B',
    isActive: true,
    isFeatured: false,
    displayOrder: '1',
    parentCategory: '',
    metaTitle: '',
    metaDescription: '',
    seoUrl: ''
  });

  const iconOptions = [
    'phone-portrait', 'shirt', 'home', 'color-palette', 'basketball', 'book',
    'game-controller', 'car', 'fast-food', 'diamond', 'heart', 'star',
    'musical-notes', 'cut', 'fitness', 'airplane', 'bed', 'cafe',
    'cart', 'gift', 'headset', 'laptop', 'paw', 'restaurant',
    'school', 'train', 'tv', 'watch', 'wine'
  ];

  const colorOptions = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#FFA07A', '#778899', '#87CEEB', '#98FB98', '#FFB6C1', '#D2B48C',
    '#F0E68C', '#E6E6FA', '#FFDAB9', '#B0E0E6', '#FF69B4', '#9370DB'
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setCategoryForm(prev => ({ 
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setCategoryForm(prev => ({ 
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
    setCategoryForm(prev => ({ ...prev, image: null }));
  };

  // API Functions
  const fetchCategories = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/category/getAllCategories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories');
      return [];
    }
  };

  const createCategory = async (formData) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/category/createCategory`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const updateCategory = async (categoryId, formData) => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/category/update/${categoryId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/category/delete/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
    calculateStats();
  }, [categories, searchQuery, activeFilter]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const filterCategories = () => {
    let filtered = categories;

    if (searchQuery) {
      filtered = filtered.filter(category =>
        category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(category => category.isActive !== false);
        break;
      case 'inactive':
        filtered = filtered.filter(category => category.isActive === false);
        break;
      case 'featured':
        filtered = filtered.filter(category => category.isFeatured === true);
        break;
      case 'empty':
        filtered = filtered.filter(category => category.productCount === 0);
        break;
    }

    setFilteredCategories(filtered);
  };

  const calculateStats = () => {
    const total = categories.length;
    const active = categories.filter(cat => cat.isActive !== false).length;
    const featured = categories.filter(cat => cat.isFeatured === true).length;
    const empty = categories.filter(cat => cat.productCount === 0).length;

    setStats({ total, active, featured, empty });
  };

  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      image: null,
      icon: 'cube-outline',
      color: '#FF6B6B',
      isActive: true,
      isFeatured: false,
      displayOrder: (categories.length + 1).toString(),
      parentCategory: '',
      metaTitle: '',
      metaDescription: '',
      seoUrl: ''
    });
  };

  const handleAddCategory = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      image: category.image ? { uri: `${API_BASE_URL}/${category.image}` } : null,
      icon: category.icon || 'cube-outline',
      color: category.color || '#FF6B6B',
      isActive: category.isActive !== false,
      isFeatured: category.isFeatured === true,
      displayOrder: category.displayOrder?.toString() || '1',
      parentCategory: category.parentCategory || '',
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
      seoUrl: category.seoUrl || ''
    });
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      Alert.alert('Error', 'Please fill in category name');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description);
      formData.append('icon', categoryForm.icon);
      formData.append('color', categoryForm.color);
      formData.append('isActive', categoryForm.isActive.toString());
      formData.append('isFeatured', categoryForm.isFeatured.toString());
      formData.append('displayOrder', categoryForm.displayOrder);
      formData.append('parentCategory', categoryForm.parentCategory);
      formData.append('metaTitle', categoryForm.metaTitle);
      formData.append('metaDescription', categoryForm.metaDescription);
      formData.append('seoUrl', categoryForm.seoUrl);

      // Add image if selected
      if (categoryForm.image && categoryForm.image.uri) {
        // Check if it's a new image (has file extension) or existing image (URL)
        if (categoryForm.image.uri.startsWith('file:')) {
          formData.append('image', {
            uri: categoryForm.image.uri,
            type: 'image/jpeg',
            name: `category_${Date.now()}.jpg`
          });
        }
      }

      if (showAddModal) {
        await createCategory(formData);
        Alert.alert('Success', 'Category added successfully');
      } else {
        await updateCategory(selectedCategory._id, formData);
        Alert.alert('Success', 'Category updated successfully');
      }

      await loadCategories();
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save category');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category._id);
              Alert.alert('Success', 'Category deleted successfully');
              await loadCategories();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  const toggleCategoryStatus = async (category) => {
    try {
      await updateCategory(category._id, {
        ...category,
        isActive: !category.isActive
      });
      await loadCategories();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update category status');
    }
  };

  const toggleFeatured = async (category) => {
    try {
      await updateCategory(category._id, {
        ...category,
        isFeatured: !category.isFeatured
      });
      await loadCategories();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update featured status');
    }
  };

  const generateSeoUrl = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const renderCategoryGrid = ({ item }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: item.color || '#FF6B6B' }]}>
          <Ionicons name={item.icon || 'cube-outline'} size={24} color="#fff" />
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditCategory(item)}
          >
            <Ionicons name="create-outline" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteCategory(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <Image 
        source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
        style={styles.categoryImage} 
      />
      
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={12} color="#666" />
            <Text style={styles.statText}>{item.productCount || 0} products</Text>
          </View>
        </View>

        <View style={styles.categoryMeta}>
          <Text style={styles.orderText}>Order: {item.displayOrder || 1}</Text>
          <Text style={styles.seoText}>{item.seoUrl || generateSeoUrl(item.name)}</Text>
        </View>

        <View style={styles.categoryControls}>
          <TouchableOpacity 
            style={[styles.statusButton, (item.isActive !== false) ? styles.activeButton : styles.inactiveButton]}
            onPress={() => toggleCategoryStatus(item)}
          >
            <Text style={styles.statusButtonText}>
              {(item.isActive !== false) ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featuredButton, (item.isFeatured === true) && styles.featuredActive]}
            onPress={() => toggleFeatured(item)}
          >
            <Ionicons 
              name={(item.isFeatured === true) ? "star" : "star-outline"} 
              size={16} 
              color={(item.isFeatured === true) ? "#FFD700" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCategoryList = ({ item }) => (
    <View style={styles.categoryListItem}>
      <View style={styles.listLeft}>
        <View style={[styles.listIcon, { backgroundColor: item.color || '#FF6B6B' }]}>
          <Ionicons name={item.icon || 'cube-outline'} size={20} color="#fff" />
        </View>
        <Image 
          source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
          style={styles.listImage} 
        />
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.listDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.listStats}>
            <Text style={styles.listStat}>{item.productCount || 0} products</Text>
          </View>
        </View>
      </View>

      <View style={styles.listRight}>
        <View style={styles.listStatus}>
          {(item.isFeatured === true) && (
            <Ionicons name="star" size={16} color="#FFD700" />
          )}
          <Text style={[styles.statusText, { color: (item.isActive !== false) ? '#4CAF50' : '#FF6B6B' }]}>
            {(item.isActive !== false) ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.listActions}>
          <TouchableOpacity 
            style={styles.listActionButton}
            onPress={() => handleEditCategory(item)}
          >
            <Ionicons name="create-outline" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.listActionButton}
            onPress={() => handleDeleteCategory(item)}
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

  const renderFormField = (label, value, onChange, placeholder, required = false, multiline = false) => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.formInput, multiline && styles.textArea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  const renderImagePickerSection = () => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>Category Image</Text>
      
      {categoryForm.image ? (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: categoryForm.image.uri }} 
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
          <Text style={styles.imagePickerText}>Select Image</Text>
          <Text style={styles.imagePickerSubtext}>Tap to choose from gallery or camera</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Category Management</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Category</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories by name or description..."
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
          {renderStatsCard('Total Categories', stats.total, '#FF6B6B', 'grid-outline')}
          {renderStatsCard('Active', stats.active, '#4CAF50', 'checkmark-circle-outline')}
          {renderStatsCard('Featured', stats.featured, '#FFD700', 'star-outline')}
          {renderStatsCard('Empty', stats.empty, '#FFA500', 'warning-outline')}
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
            {renderFilterButton('all', 'All', 'grid-outline')}
            {renderFilterButton('active', 'Active', 'checkmark-circle-outline')}
            {renderFilterButton('inactive', 'Inactive', 'close-circle-outline')}
            {renderFilterButton('featured', 'Featured', 'star-outline')}
            {renderFilterButton('empty', 'Empty', 'warning-outline')}
          </ScrollView>
        </View>
      </View>

      {/* Categories List */}
      {viewMode === 'grid' ? (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryGrid}
          keyExtractor={item => item._id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoriesGrid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryList}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Empty State */}
      {filteredCategories.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="grid-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No categories found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try adjusting your search criteria' : 'Start by creating your first category'}
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddCategory}>
            <Text style={styles.emptyButtonText}>Create Category</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add/Edit Category Modal */}
      <Modal
        visible={showAddModal || showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showAddModal ? 'Create New Category' : 'Edit Category'}
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
            {/* Category Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.categoryPreview}>
                <View style={[styles.previewIcon, { backgroundColor: categoryForm.color }]}>
                  <Ionicons name={categoryForm.icon} size={32} color="#fff" />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>
                    {categoryForm.name || 'Category Name'}
                  </Text>
                  <Text style={styles.previewDescription} numberOfLines={2}>
                    {categoryForm.description || 'Category description will appear here'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            {renderFormField('Category Name *', categoryForm.name, 
              (text) => {
                setCategoryForm(prev => ({ 
                  ...prev, 
                  name: text,
                  seoUrl: generateSeoUrl(text)
                }));
              }, 
              'Enter category name', true
            )}

            {renderFormField('Description', categoryForm.description, 
              (text) => setCategoryForm(prev => ({ ...prev, description: text })), 
              'Enter category description', false, true
            )}

            {/* Image Picker Section */}
            {renderImagePickerSection()}

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                {renderFormField('Display Order', categoryForm.displayOrder, 
                  (text) => setCategoryForm(prev => ({ ...prev, displayOrder: text })), 
                  '1'
                )}
              </View>
              <View style={styles.formHalf}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Parent Category</Text>
                  <TextInput
                    style={styles.formInput}
                    value={categoryForm.parentCategory}
                    onChangeText={(text) => setCategoryForm(prev => ({ ...prev, parentCategory: text }))}
                    placeholder="Optional"
                  />
                </View>
              </View>
            </View>

            {/* Icon and Color Selection */}
            <Text style={styles.sectionTitle}>Appearance</Text>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.iconsContainer}>
                  {iconOptions.map(icon => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconButton,
                        categoryForm.icon === icon && styles.selectedIcon
                      ]}
                      onPress={() => setCategoryForm(prev => ({ ...prev, icon }))}
                    >
                      <Ionicons 
                        name={icon} 
                        size={20} 
                        color={categoryForm.icon === icon ? "#fff" : "#666"} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.colorContainer}>
                  {colorOptions.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        categoryForm.color === color && styles.selectedColor
                      ]}
                      onPress={() => setCategoryForm(prev => ({ ...prev, color }))}
                    >
                      {categoryForm.color === color && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* SEO Settings */}
            <Text style={styles.sectionTitle}>SEO Settings</Text>

            {renderFormField('SEO URL', categoryForm.seoUrl, 
              (text) => setCategoryForm(prev => ({ ...prev, seoUrl: text })), 
              'category-url'
            )}

            {renderFormField('Meta Title', categoryForm.metaTitle, 
              (text) => setCategoryForm(prev => ({ ...prev, metaTitle: text })), 
              'Meta title for SEO'
            )}

            {renderFormField('Meta Description', categoryForm.metaDescription, 
              (text) => setCategoryForm(prev => ({ ...prev, metaDescription: text })), 
              'Meta description for SEO', false, true
            )}

            {/* Settings */}
            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active Category</Text>
                <Switch
                  value={categoryForm.isActive}
                  onValueChange={(value) => setCategoryForm(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={categoryForm.isActive ? '#FF6B6B' : '#f4f3f4'}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Featured Category</Text>
                <Switch
                  value={categoryForm.isFeatured}
                  onValueChange={(value) => setCategoryForm(prev => ({ ...prev, isFeatured: value }))}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={categoryForm.isFeatured ? '#FFD700' : '#f4f3f4'}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, uploading && styles.saveButtonDisabled]} 
              onPress={handleSaveCategory}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {showAddModal ? 'Create Category' : 'Update Category'}
                </Text>
              )}
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
  categoriesGrid: {
    padding: 10,
  },
  categoriesList: {
    padding: 10,
  },
  categoryCard: {
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
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
  categoryImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  categoryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderText: {
    fontSize: 10,
    color: '#666',
  },
  seoText: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  categoryControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeButton: {
    backgroundColor: '#E8F5E8',
  },
  inactiveButton: {
    backgroundColor: '#FFE6E6',
  },
  statusButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  featuredButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  featuredActive: {
    backgroundColor: '#FFF9E6',
    borderColor: '#FFD700',
  },
  categoryListItem: {
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
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  listDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  listStats: {
    flexDirection: 'row',
  },
  listStat: {
    fontSize: 10,
    color: '#999',
    marginRight: 6,
  },
  listRight: {
    alignItems: 'flex-end',
  },
  listStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
  previewSection: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categoryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  previewIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formHalf: {
    width: '48%',
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedIcon: {
    backgroundColor: '#FF6B6B',
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
    marginBottom: 12,
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
    width: 120,
    height: 120,
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

export default CategoryManagementScreen;