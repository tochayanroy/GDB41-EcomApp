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

const ProductManagementScreen = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // Form state for add/edit product
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    quantity: '',
    categorie: '',
    discount: '0',
  });

  const [formErrors, setFormErrors] = useState({});

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
  const fetchProducts = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/product/allProduct`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
      return [];
    }
  };

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
      return [];
    }
  };

  const createProduct = async (productData, imageUri) => {
    try {
      const token = await getAuthToken();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('description', productData.description);
      formData.append('quantity', productData.quantity);
      formData.append('categorie', productData.categorie);
      formData.append('discount', productData.discount);
      
      // Add image if available
      if (imageUri) {
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `product-${Date.now()}.jpg`
        });
      }

      const response = await axios.post(`${API_BASE_URL}/product/addProduct`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const token = await getAuthToken();
      const response = await axios.put(`${API_BASE_URL}/product/${productId}`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Image Picker Function
  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      // Launch image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      // Launch camera
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    calculateStats();
  }, [products, searchQuery, activeFilter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(product => product.isActive !== false);
        break;
      case 'inactive':
        filtered = filtered.filter(product => product.isActive === false);
        break;
      case 'lowStock':
        filtered = filtered.filter(product => product.quantity > 0 && product.quantity <= 5);
        break;
      case 'outOfStock':
        filtered = filtered.filter(product => product.quantity === 0);
        break;
      case 'featured':
        filtered = filtered.filter(product => product.isFeatured === true);
        break;
    }

    setFilteredProducts(filtered);
  };

  const calculateStats = () => {
    const total = products.length;
    const active = products.filter(p => p.isActive !== false).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;

    setStats({ total, active, lowStock, outOfStock });
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      quantity: '',
      categorie: '',
      discount: '0',
    });
    setImage(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!productForm.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!productForm.price.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(productForm.price) || parseFloat(productForm.price) <= 0) {
      errors.price = 'Price must be a valid number greater than 0';
    }

    if (!productForm.quantity.trim()) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(productForm.quantity) || parseInt(productForm.quantity) < 0) {
      errors.quantity = 'Quantity must be a valid non-negative number';
    }

    if (!productForm.categorie) {
      errors.categorie = 'Category is required';
    }

    if (productForm.discount && (isNaN(productForm.discount) || parseFloat(productForm.discount) < 0)) {
      errors.discount = 'Discount must be a valid non-negative number';
    }

    // Image validation for new products
    if (showAddModal && !image) {
      errors.image = 'Product image is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name || '',
      price: product.price?.toString() || '',
      description: product.description || '',
      quantity: product.quantity?.toString() || '',
      categorie: product.categorie?._id || product.categorie || '',
      discount: product.discount?.toString() || '0',
    });
    setImage(product.image ? `${API_BASE_URL}/${product.image}` : null);
    setSelectedProduct(product);
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setUploading(true);
    try {
      const productData = {
        name: productForm.name.trim(),
        price: parseFloat(productForm.price),
        description: productForm.description.trim(),
        quantity: parseInt(productForm.quantity),
        categorie: productForm.categorie,
        discount: productForm.discount ? parseFloat(productForm.discount) : 0
      };

      if (showAddModal) {
        // Add new product with image
        await createProduct(productData, image);
        Alert.alert('Success', 'Product added successfully');
      } else {
        // Update existing product
        await updateProduct(selectedProduct._id, productData);
        Alert.alert('Success', 'Product updated successfully');
      }

      // Refresh products list
      await loadProducts();
      
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Save product error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product._id);
              Alert.alert('Success', 'Product deleted successfully');
              await loadProducts();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const toggleProductStatus = async (product) => {
    try {
      await updateProduct(product._id, {
        ...product,
        isActive: !product.isActive
      });
      await loadProducts();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update product status');
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await updateProduct(product._id, {
        ...product,
        isFeatured: !product.isFeatured
      });
      await loadProducts();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update featured status');
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: '#FF6B6B' };
    if (quantity <= 5) return { text: 'Low Stock', color: '#FFA500' };
    return { text: 'In Stock', color: '#4CAF50' };
  };

  const renderProductItem = ({ item }) => {
    const stockStatus = getStockStatus(item.quantity);

    return (
      <View style={styles.productCard}>
        <Image 
          source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/80' }} 
          style={styles.productImage} 
        />
        
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.productActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditProduct(item)}
              >
                <Ionicons name="create-outline" size={18} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteProduct(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.productCategory}>
            Category: {item.categorie?.name || 'Uncategorized'}
          </Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.productDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>${item.price}</Text>
              {item.discount > 0 && (
                <Text style={styles.discountText}>{item.discount}% off</Text>
              )}
            </View>
            
            <View style={styles.stockRow}>
              <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
                {stockStatus.text}
              </Text>
              <Text style={styles.quantity}>Qty: {item.quantity}</Text>
            </View>
          </View>

          <View style={styles.productControls}>
            <TouchableOpacity 
              style={[styles.statusButton, item.isActive !== false ? styles.activeButton : styles.inactiveButton]}
              onPress={() => toggleProductStatus(item)}
            >
              <Text style={styles.statusButtonText}>
                {item.isActive !== false ? 'Active' : 'Inactive'}
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

  const renderFormField = (label, value, onChange, placeholder, keyboardType = 'default', error = null) => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, error && styles.formInputError]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Product Management</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products by name or description..."
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
          {renderStatsCard('Total Products', stats.total, '#FF6B6B', 'cube-outline')}
          {renderStatsCard('Active', stats.active, '#4CAF50', 'checkmark-circle-outline')}
          {renderStatsCard('Low Stock', stats.lowStock, '#FFA500', 'warning-outline')}
          {renderStatsCard('Out of Stock', stats.outOfStock, '#FF6B6B', 'close-circle-outline')}
        </ScrollView>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {renderFilterButton('all', 'All', 'grid-outline')}
          {renderFilterButton('active', 'Active', 'checkmark-circle-outline')}
          {renderFilterButton('inactive', 'Inactive', 'close-circle-outline')}
          {renderFilterButton('lowStock', 'Low Stock', 'warning-outline')}
          {renderFilterButton('outOfStock', 'Out of Stock', 'ban-outline')}
          {renderFilterButton('featured', 'Featured', 'star-outline')}
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first product'}
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddProduct}>
              <Text style={styles.emptyButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add/Edit Product Modal */}
      <Modal
        visible={showAddModal || showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showAddModal ? 'Add New Product' : 'Edit Product'}
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
            {/* Image Upload Section */}
            <View style={styles.formField}>
              <Text style={styles.formLabel}>
                Product Image {showAddModal && <Text style={styles.required}>*</Text>}
              </Text>
              
              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageUploadContainer}>
                  <TouchableOpacity 
                    style={styles.imageUploadButton}
                    onPress={pickImage}
                  >
                    <Ionicons name="image-outline" size={32} color="#666" />
                    <Text style={styles.imageUploadText}>Choose from Gallery</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.imageUploadButton}
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera-outline" size={32} color="#666" />
                    <Text style={styles.imageUploadText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {formErrors.image && <Text style={styles.errorText}>{formErrors.image}</Text>}
            </View>

            {renderFormField(
              'Product Name *', 
              productForm.name, 
              (text) => setProductForm(prev => ({ ...prev, name: text })), 
              'Enter product name',
              'default',
              formErrors.name
            )}

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                {renderFormField(
                  'Price *', 
                  productForm.price, 
                  (text) => setProductForm(prev => ({ ...prev, price: text })), 
                  '0.00', 
                  'decimal-pad',
                  formErrors.price
                )}
              </View>
              <View style={styles.formHalf}>
                {renderFormField(
                  'Discount %', 
                  productForm.discount, 
                  (text) => setProductForm(prev => ({ ...prev, discount: text })), 
                  '0', 
                  'number-pad',
                  formErrors.discount
                )}
              </View>
            </View>

            {renderFormField(
              'Quantity *', 
              productForm.quantity, 
              (text) => setProductForm(prev => ({ ...prev, quantity: text })), 
              '0', 
              'number-pad',
              formErrors.quantity
            )}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category._id}
                      style={[
                        styles.categoryButton,
                        productForm.categorie === category._id && styles.selectedCategory
                      ]}
                      onPress={() => setProductForm(prev => ({ ...prev, categorie: category._id }))}
                    >
                      <Text style={[
                        styles.categoryText,
                        productForm.categorie === category._id && styles.selectedCategoryText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {formErrors.categorie && <Text style={styles.errorText}>{formErrors.categorie}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={productForm.description}
                onChangeText={(text) => setProductForm(prev => ({ ...prev, description: text }))}
                placeholder="Enter product description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, uploading && styles.saveButtonDisabled]} 
              onPress={handleSaveProduct}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {showAddModal ? 'Add Product' : 'Update Product'}
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
  productsList: {
    padding: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  productActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  productCategory: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 6,
  },
  discountText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  stockRow: {
    alignItems: 'flex-end',
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 11,
    color: '#666',
  },
  productControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  formInputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
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
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  selectedCategory: {
    backgroundColor: '#FF6B6B',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  // Image Upload Styles
  imageUploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageUploadButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  imageUploadText: {
    marginTop: 8,
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
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
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

export default ProductManagementScreen;