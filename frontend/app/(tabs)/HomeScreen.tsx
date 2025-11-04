import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
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
  RefreshControl,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.102:5000';

const HomeScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState(new Set()); // Track wishlisted product IDs

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
      'Travel': 'airplane'
    };
    return iconMap[categoryName] || 'cube';
  };

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
  const fetchUserProfile = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.existUser;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

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

      // Extract totalItems from the cart response
      if (response.data && response.data.totalItems) {
        return response.data.totalItems;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching cart count:', error);
      return 0;
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/watchlist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Extract product IDs from watchlist response
      if (response.data && Array.isArray(response.data)) {
        const productIds = response.data.map(item => item.product?._id || item.product);
        return new Set(productIds.filter(id => id)); // Filter out any undefined/null values
      }
      return new Set();
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return new Set();
    }
  };

  const toggleWishlist = async (product) => {

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

      // Update local wishlist state based on response
      if (response.data.inWishlist) {
        // Product was added to wishlist
        setWishlistItems(prev => new Set([...prev, product._id]));
        Alert.alert(
          'Added to Wishlist',
          `${product.name} has been added to your wishlist`,
          [{ text: 'OK' }]
        );
      } else {
        // Product was removed from wishlist
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(product._id);
          return newSet;
        });
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

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [userData, bannersData, categoriesData, productsData, cartCountData, wishlistData] = await Promise.all([
        fetchUserProfile(),
        fetchBanners(),
        fetchCategories(),
        fetchProducts(),
        fetchCartCount(),
        fetchWishlist()
      ]);

      setUserData(userData);
      setBanners(bannersData);
      setCategories(categoriesData);
      setProducts(productsData);
      setCartCount(cartCountData);
      setWishlistItems(wishlistData);
    } catch (error) {
      console.error('Error loading home data:', error);
      Alert.alert('Error', 'Failed to load home data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // navigation.navigate('Search', { query: searchQuery });
    }
  };

  const handleBannerPress = (banner) => {
    if (banner.link) {
      // navigation.navigate(banner.link, { 
      //   bannerId: banner._id,
      //   title: banner.title 
      // });
    }
  };

  const handleCategoryPress = (category) => {
    setActiveCategory(category.name);
    if (category.name !== 'All') {
      router.push('../products/ProductListingScreen', {
        categoryId: category._id,
        categoryName: category.name
      });
    }
  };


  const handleProductPress = (product) => {
    router.push({
      pathname: '../products/ProductDetailsScreen',
      params: {
        productId: product._id,
      }
    });
  };

  // Format categories for display
  const formattedCategories = [
    { _id: 'all', name: 'All', icon: 'apps' },
    ...categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      icon: getCategoryIcon(cat.name)
    }))
  ];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(product => product.categorie?.name === activeCategory);

  const renderBannerItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => handleBannerPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} style={styles.bannerImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>{item.title}</Text>
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        activeCategory === item.name && styles.activeCategoryItem
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={activeCategory === item.name ? '#fff' : '#666'}
      />
      <Text style={[
        styles.categoryText,
        activeCategory === item.name && styles.activeCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => {
    const discountPercentage = item.discount > 0
      ? Math.round(item.discount)
      : null;

    const isInWishlist = wishlistItems.has(item._id);

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
            style={[styles.wishlistButton, isInWishlist && styles.wishlistButtonActive]}
            onPress={() => toggleWishlist(item)}
          >
            <Ionicons
              name={isInWishlist ? "heart" : "heart-outline"}
              size={20}
              color={isInWishlist ? '#FF6B6B' : '#666'}
            />
          </TouchableOpacity>
          {discountPercentage && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {discountPercentage}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

          <Text style={styles.productCategory}>
            {item.categorie?.name || 'Uncategorized'}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${item.price}</Text>
            {item.discount > 0 && (
              <Text style={styles.originalPrice}>
                ${(item.price / (1 - item.discount / 100)).toFixed(2)}
              </Text>
            )}
          </View>

          <View style={styles.stockInfo}>
            <Text style={[
              styles.stockText,
              { color: item.quantity > 0 ? '#4CAF50' : '#FF6B6B' }
            ]}>
              {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              item.quantity === 0 && styles.addToCartButtonDisabled
            ]}
            onPress={() => addToCart(item)}
            disabled={item.quantity === 0}
          >
            <Text style={styles.addToCartText}>
              {item.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="cube" size={64} color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>
              {userData?.username || 'Welcome Back'}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('../user/WatchlistScreen')}
            >
              <Ionicons name="heart-outline" size={24} color="#333" />
              {wishlistItems.size > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{wishlistItems.size}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('../user/CartScreen')}
            >
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
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.filterButton}
          // onPress={() => navigation.navigate('Filters')}
          >
            <Ionicons name="filter" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner Slider with Carousel */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <Carousel
              loop
              width={width - 40}
              height={200}
              autoPlay={true}
              data={banners.filter(banner => banner.isActive)}
              scrollAnimationDuration={1000}
              autoPlayInterval={3000}
              renderItem={renderBannerItem}
              style={styles.carousel}
            />
          </View>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity
                onPress={() => router.push('../user/CategoriesScreen')}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={formattedCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        {/* Featured Products */}
        {products.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity
              onPress={() => router.push('../products/ProductListingScreen')}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredProducts.slice(0, 6)} // Show only 6 products
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productsRow}
              contentContainerStyle={styles.productsList}
            />
          </View>
        )}

        {/* Special Offer */}
        <View style={styles.specialOffer}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.specialOfferGradient}
          >
            <View style={styles.specialOfferContent}>
              <View>
                <Text style={styles.offerTitle}>Special Offer</Text>
                <Text style={styles.offerSubtitle}>Get 30% off on first order</Text>
                <TouchableOpacity
                  style={styles.offerButton}
                // onPress={() => navigation.navigate('Offers')}
                >
                  <Text style={styles.offerButtonText}>Shop Now</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=200' }}
                style={styles.offerImage}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Recent Products */}
        {products.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Products</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={products.slice(0, 4)}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id + '_popular'}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            />
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
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
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
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
  filterButton: {
    padding: 5,
  },
  bannerSection: {
    height: 220,
    alignItems: 'center',
    marginVertical: 20,
  },
  carousel: {
    borderRadius: 15,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
  },
  bannerTextContainer: {
    padding: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  categoriesList: {
    paddingVertical: 5,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    minWidth: 70,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  activeCategoryItem: {
    backgroundColor: '#FF6B6B',
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  productsList: {
    paddingBottom: 20,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  recentList: {
    paddingBottom: 10,
  },
  productCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 10,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  wishlistButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 5,
  },
  wishlistButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    height: 36,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 5,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  stockInfo: {
    marginBottom: 8,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  specialOffer: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  specialOfferGradient: {
    padding: 20,
  },
  specialOfferContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  offerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 15,
  },
  offerButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  offerButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  offerImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
});

export default HomeScreen;