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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
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
    image: '',
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

  // Static categories data
  const staticCategories = [
    {
      id: '1',
      name: 'Electronics',
      description: 'Latest gadgets and electronic devices',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300',
      icon: 'phone-portrait',
      color: '#FF6B6B',
      isActive: true,
      isFeatured: true,
      displayOrder: 1,
      productCount: 156,
      parentCategory: '',
      metaTitle: 'Electronics - Latest Gadgets & Devices',
      metaDescription: 'Shop the latest electronics including smartphones, laptops, headphones and more',
      seoUrl: 'electronics',
      createdAt: '2024-01-01',
      createdBy: 'Admin',
      views: 12450,
      sales: 89
    },
    {
      id: '2',
      name: 'Fashion',
      description: 'Trendy clothing and accessories for everyone',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300',
      icon: 'shirt',
      color: '#4ECDC4',
      isActive: true,
      isFeatured: true,
      displayOrder: 2,
      productCount: 289,
      parentCategory: '',
      metaTitle: 'Fashion - Trendy Clothing & Accessories',
      metaDescription: 'Discover the latest fashion trends and styles',
      seoUrl: 'fashion',
      createdAt: '2024-01-02',
      createdBy: 'Admin',
      views: 18760,
      sales: 134
    },
    {
      id: '3',
      name: 'Home & Garden',
      description: 'Furniture and home decor items',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
      icon: 'home',
      color: '#45B7D1',
      isActive: true,
      isFeatured: false,
      displayOrder: 3,
      productCount: 178,
      parentCategory: '',
      metaTitle: 'Home & Garden - Furniture & Decor',
      metaDescription: 'Beautiful home and garden furniture and decor items',
      seoUrl: 'home-garden',
      createdAt: '2024-01-03',
      createdBy: 'Admin',
      views: 9560,
      sales: 67
    },
    {
      id: '4',
      name: 'Beauty & Health',
      description: 'Cosmetics and wellness products',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300',
      icon: 'color-palette',
      color: '#96CEB4',
      isActive: true,
      isFeatured: true,
      displayOrder: 4,
      productCount: 234,
      parentCategory: '',
      metaTitle: 'Beauty & Health - Cosmetics & Wellness',
      metaDescription: 'Premium beauty and health products for your wellness',
      seoUrl: 'beauty-health',
      createdAt: '2024-01-04',
      createdBy: 'Admin',
      views: 11230,
      sales: 98
    },
    {
      id: '5',
      name: 'Sports & Outdoors',
      description: 'Sports equipment and outdoor gear',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      icon: 'basketball',
      color: '#FFEAA7',
      isActive: true,
      isFeatured: false,
      displayOrder: 5,
      productCount: 167,
      parentCategory: '',
      metaTitle: 'Sports & Outdoors - Equipment & Gear',
      metaDescription: 'Professional sports equipment and outdoor gear',
      seoUrl: 'sports-outdoors',
      createdAt: '2024-01-05',
      createdBy: 'Admin',
      views: 8760,
      sales: 45
    },
    {
      id: '6',
      name: 'Books & Media',
      description: 'Books, movies, and music for all ages',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
      icon: 'book',
      color: '#DDA0DD',
      isActive: false,
      isFeatured: false,
      displayOrder: 6,
      productCount: 0,
      parentCategory: '',
      metaTitle: 'Books & Media - Entertainment',
      metaDescription: 'Books, movies, music and media entertainment',
      seoUrl: 'books-media',
      createdAt: '2024-01-06',
      createdBy: 'Admin',
      views: 2340,
      sales: 0
    },
    {
      id: '7',
      name: 'Toys & Games',
      description: 'Toys and entertainment for all ages',
      image: 'https://images.unsplash.com/photo-1550747534-8aec95df0f61?w=300',
      icon: 'game-controller',
      color: '#FFA07A',
      isActive: true,
      isFeatured: false,
      displayOrder: 7,
      productCount: 198,
      parentCategory: '',
      metaTitle: 'Toys & Games - Fun & Entertainment',
      metaDescription: 'Educational and fun toys and games for all ages',
      seoUrl: 'toys-games',
      createdAt: '2024-01-07',
      createdBy: 'Admin',
      views: 6540,
      sales: 32
    },
    {
      id: '8',
      name: 'Automotive',
      description: 'Car accessories and parts',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300',
      icon: 'car',
      color: '#778899',
      isActive: true,
      isFeatured: false,
      displayOrder: 8,
      productCount: 145,
      parentCategory: '',
      metaTitle: 'Automotive - Car Accessories & Parts',
      metaDescription: 'Quality automotive accessories and car parts',
      seoUrl: 'automotive',
      createdAt: '2024-01-08',
      createdBy: 'Admin',
      views: 5430,
      sales: 28
    }
  ];

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

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
    calculateStats();
  }, [categories, searchQuery, activeFilter]);

  const loadCategories = () => {
    setLoading(true);
    setTimeout(() => {
      setCategories(staticCategories);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const filterCategories = () => {
    let filtered = categories;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(category => category.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(category => !category.isActive);
        break;
      case 'featured':
        filtered = filtered.filter(category => category.isFeatured);
        break;
      case 'empty':
        filtered = filtered.filter(category => category.productCount === 0);
        break;
      case 'highSales':
        filtered = filtered.filter(category => category.sales > 50);
        break;
    }

    setFilteredCategories(filtered);
  };

  const calculateStats = () => {
    const total = categories.length;
    const active = categories.filter(cat => cat.isActive).length;
    const featured = categories.filter(cat => cat.isFeatured).length;
    const empty = categories.filter(cat => cat.productCount === 0).length;

    setStats({ total, active, featured, empty });
  };

  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      image: '',
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
      name: category.name,
      description: category.description,
      image: category.image,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      isFeatured: category.isFeatured,
      displayOrder: category.displayOrder.toString(),
      parentCategory: category.parentCategory,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      seoUrl: category.seoUrl
    });
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleSaveCategory = () => {
    // Validation
    if (!categoryForm.name || !categoryForm.description || !categoryForm.image) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (showAddModal) {
      // Add new category
      const newCategory = {
        id: Date.now().toString(),
        ...categoryForm,
        displayOrder: parseInt(categoryForm.displayOrder),
        productCount: 0,
        views: 0,
        sales: 0,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Admin'
      };

      setCategories(prev => [newCategory, ...prev]);
      Alert.alert('Success', 'Category added successfully');
    } else {
      // Update existing category
      const updatedCategories = categories.map(cat =>
        cat.id === selectedCategory.id
          ? {
              ...cat,
              ...categoryForm,
              displayOrder: parseInt(categoryForm.displayOrder)
            }
          : cat
      );

      setCategories(updatedCategories);
      Alert.alert('Success', 'Category updated successfully');
    }

    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteCategory = (category) => {
    if (category.productCount > 0) {
      Alert.alert(
        'Cannot Delete Category',
        `This category contains ${category.productCount} products. Please remove all products before deleting the category.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCategories(prev => prev.filter(cat => cat.id !== category.id));
            Alert.alert('Success', 'Category deleted successfully');
          }
        }
      ]
    );
  };

  const toggleCategoryStatus = (category) => {
    const updatedCategories = categories.map(cat =>
      cat.id === category.id ? { ...cat, isActive: !cat.isActive } : cat
    );
    setCategories(updatedCategories);
  };

  const toggleFeatured = (category) => {
    const updatedCategories = categories.map(cat =>
      cat.id === category.id ? { ...cat, isFeatured: !cat.isFeatured } : cat
    );
    setCategories(updatedCategories);
  };

  const generateSeoUrl = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const renderCategoryGrid = ({ item }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="#fff" />
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

      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={12} color="#666" />
            <Text style={styles.statText}>{item.productCount} products</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={12} color="#666" />
            <Text style={styles.statText}>{item.views.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="cart-outline" size={12} color="#666" />
            <Text style={styles.statText}>{item.sales}</Text>
          </View>
        </View>

        <View style={styles.categoryMeta}>
          <Text style={styles.orderText}>Order: {item.displayOrder}</Text>
          <Text style={styles.seoText}>{item.seoUrl}</Text>
        </View>

        <View style={styles.categoryControls}>
          <TouchableOpacity 
            style={[styles.statusButton, item.isActive ? styles.activeButton : styles.inactiveButton]}
            onPress={() => toggleCategoryStatus(item)}
          >
            <Text style={styles.statusButtonText}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featuredButton, item.isFeatured && styles.featuredActive]}
            onPress={() => toggleFeatured(item)}
          >
            <Ionicons 
              name={item.isFeatured ? "star" : "star-outline"} 
              size={16} 
              color={item.isFeatured ? "#FFD700" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCategoryList = ({ item }) => (
    <View style={styles.categoryListItem}>
      <View style={styles.listLeft}>
        <View style={[styles.listIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={20} color="#fff" />
        </View>
        <Image source={{ uri: item.image }} style={styles.listImage} />
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.listDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.listStats}>
            <Text style={styles.listStat}>{item.productCount} products</Text>
            <Text style={styles.listStat}>•</Text>
            <Text style={styles.listStat}>{item.views.toLocaleString()} views</Text>
            <Text style={styles.listStat}>•</Text>
            <Text style={styles.listStat}>{item.sales} sales</Text>
          </View>
        </View>
      </View>

      <View style={styles.listRight}>
        <View style={styles.listStatus}>
          {item.isFeatured && (
            <Ionicons name="star" size={16} color="#FFD700" />
          )}
          <Text style={[styles.statusText, { color: item.isActive ? '#4CAF50' : '#FF6B6B' }]}>
            {item.isActive ? 'Active' : 'Inactive'}
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
            {renderFilterButton('highSales', 'Top Selling', 'trending-up-outline')}
          </ScrollView>
        </View>
      </View>

      {/* Categories List */}
      {viewMode === 'grid' ? (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryGrid}
          keyExtractor={item => item.id}
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
          keyExtractor={item => item.id}
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

            {renderFormField('Description *', categoryForm.description, 
              (text) => setCategoryForm(prev => ({ ...prev, description: text })), 
              'Enter category description', true, true
            )}

            {renderFormField('Image URL *', categoryForm.image, 
              (text) => setCategoryForm(prev => ({ ...prev, image: text })), 
              'Enter image URL', true
            )}

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

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCategory}>
              <Text style={styles.saveButtonText}>
                {showAddModal ? 'Create Category' : 'Update Category'}
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

export default CategoryManagementScreen;