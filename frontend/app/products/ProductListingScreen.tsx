import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    Modal,
    ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.102:5000';

const ProductListingScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState('featured');
  const [searchText, setSearchText] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);

  // Sort options
  const sortOptions = [
    { id: 'featured', label: 'Featured', icon: 'star' },
    { id: 'price_low', label: 'Price: Low to High', icon: 'arrow-up' },
    { id: 'price_high', label: 'Price: High to Low', icon: 'arrow-down' },
    { id: 'name', label: 'Name: A to Z', icon: 'text' },
    { id: 'rating', label: 'Highest Rated', icon: 'trending-up' },
    { id: 'newest', label: 'Newest First', icon: 'time' },
  ];

  const ratingOptions = [
    { value: 5, label: '5 Stars' },
    { value: 4, label: '4 Stars & Up' },
    { value: 3, label: '3 Stars & Up' },
    { value: 2, label: '2 Stars & Up' },
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
      throw error;
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

  const fetchCartCount = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/cart/getCart`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.totalItems) {
        return response.data.totalItems;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching cart count:', error);
      return 0;
    }
  };

  const addToCart = async (product) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/cart/add/${product._id}`, 
        {
          quantity: 1
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        Alert.alert(
          'Added to Cart',
          `${product.name} has been added to your cart`,
          [{ text: 'OK' }]
        );
        
        // Refresh cart count
        const newCartCount = await fetchCartCount();
        setCartCount(newCartCount);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add product to cart');
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add product to cart');
    }
  };

  const addToWishlist = async (product) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/watchlist/toggle/${product._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.inWishlist) {
        Alert.alert(
          'Added to Wishlist',
          `${product.name} has been added to your wishlist`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Removed from Wishlist',
          `${product.name} has been removed from your wishlist`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, cartCountData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchCartCount()
      ]);

      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesData);
      setCartCount(cartCountData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, selectedSort, searchText, priceRange, selectedCategories, selectedRatings]);

  const applyFiltersAndSort = () => {
    let result = [...products];

    // Apply search filter
    if (searchText) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply price filter
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(product =>
        selectedCategories.includes(product.categorie?._id)
      );
    }

    // Apply rating filter
    if (selectedRatings.length > 0) {
      result = result.filter(product => {
        const productRating = product.rating || 0;
        return selectedRatings.some(rating => productRating >= rating);
      });
    }

    // Apply sorting
    switch (selectedSort) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default: // featured
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    setFilteredProducts(result);
  };

  const handleProductPress = (product) => {
    router.push('../products/ProductDetailsScreen', { 
      productId: product._id
    });
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(cat => cat !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleRating = (rating) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const clearAllFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSelectedRatings([]);
    setSearchText('');
  };

  const renderProductGrid = ({ item }) => {
    const discountPercentage = item.discount > 0 ? Math.round(item.discount) : null;
    const productRating = item.rating || 0;
    const reviewCount = item.reviews?.length || 0;

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
            style={styles.productImage} 
          />
          <TouchableOpacity 
            style={styles.wishlistButton}
            onPress={() => addToWishlist(item)}
          >
            <Ionicons name="heart-outline" size={20} color="#666" />
          </TouchableOpacity>
          {discountPercentage && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
            </View>
          )}
          {!item.quantity || item.quantity === 0 && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          
          <Text style={styles.productCategory}>
            {item.categorie?.name || 'Uncategorized'}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{productRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${item.price}</Text>
            {item.discount > 0 && (
              <Text style={styles.originalPrice}>
                ${(item.price / (1 - item.discount / 100)).toFixed(2)}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              (!item.quantity || item.quantity === 0) && styles.disabledButton
            ]}
            onPress={() => item.quantity > 0 && addToCart(item)}
            disabled={!item.quantity || item.quantity === 0}
          >
            <Text style={styles.addToCartText}>
              {item.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductList = ({ item }) => {
    const discountPercentage = item.discount > 0 ? Math.round(item.discount) : null;
    const productRating = item.rating || 0;
    const reviewCount = item.reviews?.length || 0;

    return (
      <TouchableOpacity 
        style={styles.productListCard}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.productListImageContainer}>
          <Image 
            source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
            style={styles.productListImage} 
          />
          {discountPercentage && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productListInfo}>
          <Text style={styles.productListName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productListDescription} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          
          <Text style={styles.productCategory}>
            {item.categorie?.name || 'Uncategorized'}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{productRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${item.price}</Text>
            {item.discount > 0 && (
              <Text style={styles.originalPrice}>
                ${(item.price / (1 - item.discount / 100)).toFixed(2)}
              </Text>
            )}
          </View>
          
          <View style={styles.productListActions}>
            <TouchableOpacity 
              style={[
                styles.addToCartListButton,
                (!item.quantity || item.quantity === 0) && styles.disabledButton
              ]}
              onPress={() => item.quantity > 0 && addToCart(item)}
              disabled={!item.quantity || item.quantity === 0}
            >
              <Text style={styles.addToCartText}>
                {item.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.wishlistListButton}
              onPress={() => addToWishlist(item)}
            >
              <Ionicons name="heart-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSortModal = () => (
    <Modal
      visible={sortModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSortModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity onPress={() => setSortModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={sortOptions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  selectedSort === item.id && styles.selectedSortOption
                ]}
                onPress={() => {
                  setSelectedSort(item.id);
                  setSortModalVisible(false);
                }}
              >
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={selectedSort === item.id ? '#FF6B6B' : '#666'} 
                />
                <Text style={[
                  styles.sortOptionText,
                  selectedSort === item.id && styles.selectedSortOptionText
                ]}>
                  {item.label}
                </Text>
                {selectedSort === item.id && (
                  <Ionicons name="checkmark" size={20} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
          />
        </View>
      </View>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceRangeDisplay}>
                <Text style={styles.priceRangeText}>${priceRange[0]} - ${priceRange[1]}</Text>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              {categories.map(category => (
                <TouchableOpacity
                  key={category._id}
                  style={styles.filterOption}
                  onPress={() => toggleCategory(category._id)}
                >
                  <Text style={styles.filterOptionText}>{category.name}</Text>
                  <View style={[
                    styles.checkbox,
                    selectedCategories.includes(category._id) && styles.checkboxChecked
                  ]}>
                    {selectedCategories.includes(category._id) && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ratings */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Customer Ratings</Text>
              {ratingOptions.map(rating => (
                <TouchableOpacity
                  key={rating.value}
                  style={styles.filterOption}
                  onPress={() => toggleRating(rating.value)}
                >
                  <View style={styles.ratingFilter}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.filterOptionText}>{rating.label}</Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    selectedRatings.includes(rating.value) && styles.checkboxChecked
                  ]}>
                    {selectedRatings.includes(rating.value) && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
          <Text style={styles.headerTitle}>All Products</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="cart-outline" size={24} color="#333" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Controls Bar */}
      <View style={styles.controlsBar}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} products found
        </Text>
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setSortModalVisible(true)}
          >
            <Ionicons name="swap-vertical" size={20} color="#666" />
            <Text style={styles.controlButtonText}>Sort</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color="#666" />
            <Text style={styles.controlButtonText}>Filter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list' : 'grid'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List */}
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={viewMode === 'grid' ? renderProductGrid : renderProductList}
          keyExtractor={item => item._id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          key={viewMode}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search or filter criteria
          </Text>
          <TouchableOpacity 
            style={styles.continueShoppingButton}
            onPress={clearAllFilters}
          >
            <Text style={styles.continueShoppingText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      {renderSortModal()}
      {renderFilterModal()}
    </View>
  );
};

// ... (keep all the same styles from the original code)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    padding: 8,
  },
  controlButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  productsList: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    margin: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: (width - 30) / 2,
  },
  productListCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  productListImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  productListImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  wishlistButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 5,
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
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productListInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    height: 36,
  },
  productListName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  productListDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#999',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addToCartListButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  productListActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wishlistListButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearAllText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 15,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedSortOption: {
    backgroundColor: '#fff5f5',
  },
  sortOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  selectedSortOptionText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  priceRangeDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  priceRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  ratingFilter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Loading and Empty States
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
  continueShoppingButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductListingScreen;