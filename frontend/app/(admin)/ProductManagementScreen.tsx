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
    originalPrice: '',
    category: '',
    brand: '',
    description: '',
    quantity: '',
    sku: '',
    isActive: true,
    isFeatured: false,
    images: [''],
    features: [''],
    specifications: {
      weight: '',
      dimensions: '',
      color: ''
    }
  });

  // Static products data
  const staticProducts = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 99.99,
      originalPrice: 129.99,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
      category: 'Electronics',
      brand: 'SoundMax',
      description: 'Premium wireless headphones with noise cancellation',
      quantity: 25,
      sku: 'SM-BT001',
      isActive: true,
      isFeatured: true,
      rating: 4.5,
      reviewCount: 128,
      createdAt: '2024-01-15',
      sales: 45
    },
    {
      id: '2',
      name: 'Running Shoes',
      price: 79.99,
      originalPrice: 99.99,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
      category: 'Sports',
      brand: 'RunPro',
      description: 'Professional running shoes for all terrains',
      quantity: 15,
      sku: 'RP-RS002',
      isActive: true,
      isFeatured: false,
      rating: 4.2,
      reviewCount: 89,
      createdAt: '2024-01-10',
      sales: 32
    },
    {
      id: '3',
      name: 'Smart Watch Series 5',
      price: 199.99,
      originalPrice: 249.99,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
      category: 'Electronics',
      brand: 'TechWear',
      description: 'Advanced smartwatch with health monitoring',
      quantity: 8,
      sku: 'TW-SW005',
      isActive: true,
      isFeatured: true,
      rating: 4.7,
      reviewCount: 234,
      createdAt: '2024-01-08',
      sales: 67
    },
    {
      id: '4',
      name: 'Designer Perfume',
      price: 49.99,
      originalPrice: 69.99,
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'],
      category: 'Beauty',
      brand: 'LuxScents',
      description: 'Premium fragrance for everyday wear',
      quantity: 0,
      sku: 'LS-PF004',
      isActive: false,
      isFeatured: false,
      rating: 4.3,
      reviewCount: 56,
      createdAt: '2024-01-05',
      sales: 23
    },
    {
      id: '5',
      name: 'Coffee Mug Set',
      price: 14.99,
      originalPrice: 19.99,
      images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'],
      category: 'Home',
      brand: 'HomeEssentials',
      description: 'Ceramic coffee mug set of 4',
      quantity: 3,
      sku: 'HE-CM007',
      isActive: true,
      isFeatured: false,
      rating: 4.1,
      reviewCount: 34,
      createdAt: '2024-01-03',
      sales: 18
    },
    {
      id: '6',
      name: 'Professional Backpack',
      price: 59.99,
      originalPrice: 79.99,
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
      category: 'Fashion',
      brand: 'UrbanGear',
      description: 'Durable backpack for professionals',
      quantity: 12,
      sku: 'UG-BP009',
      isActive: true,
      isFeatured: true,
      rating: 4.4,
      reviewCount: 78,
      createdAt: '2024-01-01',
      sales: 41
    }
  ];

  const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Toys', 'Automotive'];
  const brands = ['SoundMax', 'RunPro', 'TechWear', 'LuxScents', 'HomeEssentials', 'UrbanGear', 'Apple', 'Samsung'];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    calculateStats();
  }, [products, searchQuery, activeFilter]);

  const loadProducts = () => {
    setLoading(true);
    setTimeout(() => {
      setProducts(staticProducts);
      setLoading(false);
    }, 1000);
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
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    switch (activeFilter) {
      case 'active':
        filtered = filtered.filter(product => product.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(product => !product.isActive);
        break;
      case 'lowStock':
        filtered = filtered.filter(product => product.quantity > 0 && product.quantity <= 5);
        break;
      case 'outOfStock':
        filtered = filtered.filter(product => product.quantity === 0);
        break;
      case 'featured':
        filtered = filtered.filter(product => product.isFeatured);
        break;
    }

    setFilteredProducts(filtered);
  };

  const calculateStats = () => {
    const total = products.length;
    const active = products.filter(p => p.isActive).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;

    setStats({ total, active, lowStock, outOfStock });
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      price: '',
      originalPrice: '',
      category: '',
      brand: '',
      description: '',
      quantity: '',
      sku: '',
      isActive: true,
      isFeatured: false,
      images: [''],
      features: [''],
      specifications: {
        weight: '',
        dimensions: '',
        color: ''
      }
    });
  };

  const handleAddProduct = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      brand: product.brand,
      description: product.description,
      quantity: product.quantity.toString(),
      sku: product.sku,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      images: product.images,
      features: [''],
      specifications: {
        weight: '',
        dimensions: '',
        color: ''
      }
    });
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleSaveProduct = () => {
    // Validation
    if (!productForm.name || !productForm.price || !productForm.category || !productForm.quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (showAddModal) {
      // Add new product
      const newProduct = {
        id: Date.now().toString(),
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        quantity: parseInt(productForm.quantity),
        rating: 0,
        reviewCount: 0,
        sales: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setProducts(prev => [newProduct, ...prev]);
      Alert.alert('Success', 'Product added successfully');
    } else {
      // Update existing product
      const updatedProducts = products.map(p =>
        p.id === selectedProduct.id
          ? {
              ...p,
              ...productForm,
              price: parseFloat(productForm.price),
              originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
              quantity: parseInt(productForm.quantity)
            }
          : p
      );

      setProducts(updatedProducts);
      Alert.alert('Success', 'Product updated successfully');
    }

    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProducts(prev => prev.filter(p => p.id !== product.id));
            Alert.alert('Success', 'Product deleted successfully');
          }
        }
      ]
    );
  };

  const toggleProductStatus = (product) => {
    const updatedProducts = products.map(p =>
      p.id === product.id ? { ...p, isActive: !p.isActive } : p
    );
    setProducts(updatedProducts);
  };

  const toggleFeatured = (product) => {
    const updatedProducts = products.map(p =>
      p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p
    );
    setProducts(updatedProducts);
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
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        
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

          <Text style={styles.productSku}>SKU: {item.sku}</Text>
          <Text style={styles.productBrand}>Brand: {item.brand}</Text>
          <Text style={styles.productCategory}>Category: {item.category}</Text>

          <View style={styles.productDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>${item.price}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>${item.originalPrice}</Text>
              )}
            </View>
            
            <View style={styles.stockRow}>
              <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
                {stockStatus.text}
              </Text>
              <Text style={styles.quantity}>Qty: {item.quantity}</Text>
            </View>
          </View>

          <View style={styles.productMetrics}>
            <View style={styles.metric}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.metricText}>{item.rating}</Text>
            </View>
            <View style={styles.metric}>
              <Ionicons name="chatbubble-outline" size={14} color="#666" />
              <Text style={styles.metricText}>{item.reviewCount}</Text>
            </View>
            <View style={styles.metric}>
              <Ionicons name="cart-outline" size={14} color="#666" />
              <Text style={styles.metricText}>{item.sales}</Text>
            </View>
          </View>

          <View style={styles.productControls}>
            <TouchableOpacity 
              style={[styles.statusButton, item.isActive ? styles.activeButton : styles.inactiveButton]}
              onPress={() => toggleProductStatus(item)}
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

  const renderFormField = (label, value, onChange, placeholder, keyboardType = 'default') => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={styles.formInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
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
            placeholder="Search products by name, SKU, or brand..."
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
        keyExtractor={item => item.id}
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
            {renderFormField('Product Name *', productForm.name, 
              (text) => setProductForm(prev => ({ ...prev, name: text })), 
              'Enter product name'
            )}

            {renderFormField('SKU *', productForm.sku, 
              (text) => setProductForm(prev => ({ ...prev, sku: text })), 
              'Enter SKU'
            )}

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                {renderFormField('Price *', productForm.price, 
                  (text) => setProductForm(prev => ({ ...prev, price: text })), 
                  '0.00', 'decimal-pad'
                )}
              </View>
              <View style={styles.formHalf}>
                {renderFormField('Original Price', productForm.originalPrice, 
                  (text) => setProductForm(prev => ({ ...prev, originalPrice: text })), 
                  '0.00', 'decimal-pad'
                )}
              </View>
            </View>

            {renderFormField('Quantity *', productForm.quantity, 
              (text) => setProductForm(prev => ({ ...prev, quantity: text })), 
              '0', 'number-pad'
            )}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        productForm.category === category && styles.selectedCategory
                      ]}
                      onPress={() => setProductForm(prev => ({ ...prev, category }))}
                    >
                      <Text style={[
                        styles.categoryText,
                        productForm.category === category && styles.selectedCategoryText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Brand</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {brands.map(brand => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        styles.categoryButton,
                        productForm.brand === brand && styles.selectedCategory
                      ]}
                      onPress={() => setProductForm(prev => ({ ...prev, brand }))}
                    >
                      <Text style={[
                        styles.categoryText,
                        productForm.brand === brand && styles.selectedCategoryText
                      ]}>
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
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

            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active Product</Text>
                <Switch
                  value={productForm.isActive}
                  onValueChange={(value) => setProductForm(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={productForm.isActive ? '#FF6B6B' : '#f4f3f4'}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Featured Product</Text>
                <Switch
                  value={productForm.isFeatured}
                  onValueChange={(value) => setProductForm(prev => ({ ...prev, isFeatured: value }))}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={productForm.isFeatured ? '#FFD700' : '#f4f3f4'}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
              <Text style={styles.saveButtonText}>
                {showAddModal ? 'Add Product' : 'Update Product'}
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
  productSku: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  productCategory: {
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
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
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
  productMetrics: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metricText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
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

export default ProductManagementScreen;