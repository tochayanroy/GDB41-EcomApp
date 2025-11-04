import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    TextInput,
    Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.102:5000';

const CategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

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

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/product/category/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching category products:', error);
      Alert.alert('Error', 'Failed to fetch products for this category');
      return [];
    }
  };

  const fetchAllProducts = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/product/allProduct`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  };

  // Helper function to get icon based on category name
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Electronics': 'phone-portrait',
      'Fashion': 'shirt',
      'Home': 'home',
      'Beauty': 'color-palette',
      'Sports': 'basketball',
      'Books': 'book',
      'Toys': 'game-controller',
      'Automotive': 'car',
      'Food': 'fast-food',
      'Health': 'fitness',
      'Education': 'school',
      'Travel': 'airplane',
      'Jewelry': 'diamond'
    };
    return iconMap[categoryName] || 'cube';
  };

  const getCategoryColor = (index) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#FFA07A', '#778899', '#F08080', '#FFD700',
      '#87CEEB', '#98FB98', '#FFB6C1', '#D2B48C'
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter(category =>
        category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await fetchCategories();
      const productsData = await fetchAllProducts();
      
      // Count products per category
      const categoriesWithCounts = categoriesData.map(category => {
        const productCount = productsData.filter(product => 
          product.categorie?._id === category._id
        ).length;
        
        return {
          ...category,
          productCount,
          icon: getCategoryIcon(category.name),
          color: getCategoryColor(categoriesData.indexOf(category)),
          subcategories: ['Featured', 'Popular', 'New Arrivals', 'On Sale'] // Default subcategories
        };
      });

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = async (category) => {
    setSelectedCategory(category);
    setProductsLoading(true);
    
    try {
      const products = await fetchProductsByCategory(category._id);
      setCategoryProducts(products);
    } catch (error) {
      console.error('Error loading category products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryProducts([]);
  };

  const handleProductPress = (product) => {
    // Handle product press - could show product details
    console.log('Product pressed:', product.name);
    // navigation.navigate('ProductDetail', { productId: product._id });
  };

  const renderCategoryGrid = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={32} color="#fff" />
      </View>
      <Image 
        source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
        style={styles.categoryImage} 
      />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {item.description || 'Explore amazing products'}
        </Text>
        <Text style={styles.productCount}>{item.productCount || 0} products</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryList = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryListItem}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryListLeft}>
        <View style={[styles.listIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="#fff" />
        </View>
        <View style={styles.listText}>
          <Text style={styles.listCategoryName}>{item.name}</Text>
          <Text style={styles.listProductCount}>{item.productCount || 0} products</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <Image 
        source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating || 4.0}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price}</Text>
          {item.discount > 0 && (
            <Text style={styles.originalPrice}>
              ${(item.price / (1 - item.discount / 100)).toFixed(2)}
            </Text>
          )}
        </View>
      </View>
      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{Math.round(item.discount)}% OFF</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSubcategory = (subcategory, index) => (
    <TouchableOpacity key={index} style={styles.subcategoryItem}>
      <Text style={styles.subcategoryText}>{subcategory}</Text>
      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </TouchableOpacity>
  );

  // Category Details View
  const renderCategoryDetails = () => {
    if (!selectedCategory) return null;

    return (
      <View style={styles.categoryDetails}>
        {/* Header */}
        <View style={styles.detailsHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToCategories}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.detailsTitle}>{selectedCategory.name}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Category Banner */}
          <View style={styles.categoryBanner}>
            <Image 
              source={{ uri: selectedCategory.image ? `${API_BASE_URL}/${selectedCategory.image}` : 'https://via.placeholder.com/400x200' }} 
              style={styles.bannerImage} 
            />
            <View style={styles.bannerOverlay}>
              <View style={[styles.bannerIcon, { backgroundColor: selectedCategory.color }]}>
                <Ionicons name={selectedCategory.icon} size={40} color="#fff" />
              </View>
              <Text style={styles.bannerTitle}>{selectedCategory.name}</Text>
              <Text style={styles.bannerDescription}>
                {selectedCategory.description || 'Explore our amazing collection'}
              </Text>
              <Text style={styles.bannerProductCount}>
                {selectedCategory.productCount || 0} products available
              </Text>
            </View>
          </View>

          {/* Subcategories */}
          <View style={styles.subcategoriesSection}>
            <Text style={styles.sectionTitle}>Browse</Text>
            <View style={styles.subcategoriesGrid}>
              {selectedCategory.subcategories?.map((subcategory, index) => (
                <TouchableOpacity key={index} style={styles.subcategoryCard}>
                  <Text style={styles.subcategoryCardText}>{subcategory}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Featured Products */}
          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : (
            <>
              <View style={styles.productsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Popular Products</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                </View>
                {categoryProducts.length > 0 ? (
                  <FlatList
                    data={categoryProducts.slice(0, 5)}
                    renderItem={renderProductItem}
                    keyExtractor={item => item._id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productsList}
                  />
                ) : (
                  <View style={styles.emptyProducts}>
                    <Ionicons name="cube-outline" size={40} color="#ccc" />
                    <Text style={styles.emptyProductsText}>No products found</Text>
                  </View>
                )}
              </View>

              {/* All Products Grid */}
              <View style={styles.allProductsSection}>
                <Text style={styles.sectionTitle}>All Products</Text>
                {categoryProducts.length > 0 ? (
                  <FlatList
                    data={categoryProducts}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.gridProductCard}>
                        <Image 
                          source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
                          style={styles.gridProductImage} 
                        />
                        <View style={styles.gridProductInfo}>
                          <Text style={styles.gridProductName} numberOfLines={2}>
                            {item.name}
                          </Text>
                          <View style={styles.gridPriceContainer}>
                            <Text style={styles.gridCurrentPrice}>${item.price}</Text>
                            {item.discount > 0 && (
                              <Text style={styles.gridOriginalPrice}>
                                ${(item.price / (1 - item.discount / 100)).toFixed(2)}
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                    keyExtractor={item => item._id}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.productsGrid}
                    contentContainerStyle={styles.gridProductsList}
                  />
                ) : (
                  <View style={styles.emptyProducts}>
                    <Ionicons name="cube-outline" size={40} color="#ccc" />
                    <Text style={styles.emptyProductsText}>No products available</Text>
                    <Text style={styles.emptyProductsSubtext}>
                      Check back later for new arrivals
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  // Main Categories View
  const renderCategoriesView = () => (
    <View style={styles.categoriesView}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        <Text style={styles.headerSubtitle}>
          Browse products by category
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#ccc" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <Text style={styles.resultsText}>
          {filteredCategories.length} categories found
        </Text>
        <View style={styles.toggleButtons}>
          <TouchableOpacity style={styles.toggleButton}>
            <Ionicons name="grid" size={20} color="#FF6B6B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleButton}>
            <Ionicons name="list" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryGrid}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.categoriesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No categories found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search criteria
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.retryText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
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
      {selectedCategory ? renderCategoryDetails() : renderCategoriesView()}
    </View>
  );
};

// ... (keep all the same styles from the previous code)

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
  // Categories View Styles
  categoriesView: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  toggleButtons: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  categoriesList: {
    padding: 10,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    maxWidth: (width - 30) / 2,
  },
  categoryIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryImage: {
    width: '100%',
    height: 100,
  },
  categoryInfo: {
    padding: 12,
  },
  categoryName: {
    fontSize: 16,
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
  productCount: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  categoryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listText: {
    flex: 1,
  },
  listCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  listProductCount: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  emptyProducts: {
    alignItems: 'center',
    padding: 40,
  },
  emptyProductsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyProductsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Category Details Styles
  categoryDetails: {
    flex: 1,
    paddingTop: 50,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerPlaceholder: {
    width: 34,
  },
  categoryBanner: {
    height: 200,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bannerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  bannerDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  bannerProductCount: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  subcategoriesSection: {
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
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subcategoryCard: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  subcategoryCardText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  productsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  productsList: {
    paddingRight: 20,
  },
  productCard: {
    width: 150,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 10,
    marginRight: 15,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    height: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 4,
  },
  originalPrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  allProductsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    flex: 1,
  },
  gridProductsList: {
    paddingBottom: 20,
  },
  productsGrid: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridProductCard: {
    width: (width - 50) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  gridProductImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  gridProductInfo: {
    flex: 1,
  },
  gridProductName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    height: 32,
  },
  gridPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridCurrentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 4,
  },
  gridOriginalPrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
});

export default CategoriesScreen;