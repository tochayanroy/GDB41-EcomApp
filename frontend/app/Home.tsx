import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    RefreshControl,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Mock data for banners
  const banners = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
      title: 'Summer Sale',
      subtitle: 'Up to 50% off',
      targetScreen: 'Products'
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      title: 'New Arrivals',
      subtitle: 'Latest fashion trends',
      targetScreen: 'NewArrivals'
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      title: 'Electronics',
      subtitle: 'Smart gadgets',
      targetScreen: 'CategoryProducts'
    }
  ];

  // Categories data
  const categories = [
    { id: '1', name: 'All', icon: 'apps' },
    { id: '2', name: 'Fashion', icon: 'shirt' },
    { id: '3', name: 'Electronics', icon: 'phone-portrait' },
    { id: '4', name: 'Home', icon: 'home' },
    { id: '5', name: 'Beauty', icon: 'color-palette' },
    { id: '6', name: 'Sports', icon: 'basketball' },
  ];

  // Products data
  const products = [
    {
      id: '1',
      name: 'Wireless Headphones',
      price: 99.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      rating: 4.5,
      category: 'Electronics',
      quantity: 10
    },
    {
      id: '2',
      name: 'Running Shoes',
      price: 79.99,
      originalPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      rating: 4.2,
      category: 'Sports',
      quantity: 15
    },
    {
      id: '3',
      name: 'Smart Watch',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      rating: 4.7,
      category: 'Electronics',
      quantity: 8
    },
    {
      id: '4',
      name: 'Perfume',
      price: 49.99,
      originalPrice: 69.99,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300',
      rating: 4.3,
      category: 'Beauty',
      quantity: 20
    },
    {
      id: '5',
      name: 'Coffee Mug',
      price: 14.99,
      originalPrice: 19.99,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300',
      rating: 4.1,
      category: 'Home',
      quantity: 25
    },
    {
      id: '6',
      name: 'Backpack',
      price: 59.99,
      originalPrice: 79.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
      rating: 4.4,
      category: 'Fashion',
      quantity: 12
    },
  ];

  useEffect(() => {
    loadUserData();
    loadCartCount();
  }, []);

  const loadUserData = async () => {
    // Simulate API call to get user data
    setUserData({
      name: 'John Doe',
      email: 'john@example.com'
    });
  };

  const loadCartCount = async () => {
    // Simulate API call to get cart count
    setCartCount(3);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadCartCount()]);
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const handleBannerPress = (banner) => {
    if (banner.targetScreen) {
      navigation.navigate(banner.targetScreen, { 
        bannerId: banner.id,
        title: banner.title 
      });
    }
  };

  const handleCategoryPress = (category) => {
    setActiveCategory(category.name);
    if (category.name !== 'All') {
      navigation.navigate('CategoryProducts', { 
        categoryId: category.id,
        categoryName: category.name 
      });
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { 
      productId: product.id,
      product 
    });
  };

  const addToCart = (product) => {
    // Implement add to cart functionality
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart`,
      [{ text: 'OK' }]
    );
    setCartCount(prev => prev + 1);
  };

  const addToWishlist = (product) => {
    // Implement add to wishlist functionality
    Alert.alert(
      'Added to Wishlist',
      `${product.name} has been added to your wishlist`,
      [{ text: 'OK' }]
    );
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  const renderBannerItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.bannerContainer}
        onPress={() => handleBannerPress(item)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.bannerImage} />
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

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={() => addToWishlist(item)}
        >
          <Ionicons name="heart-outline" size={20} color="#666" />
        </TouchableOpacity>
        {item.originalPrice && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round((1 - item.price / item.originalPrice) * 100)}%
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(item)}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>
              {userData?.name || 'Welcome Back'}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Cart')}
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
            onPress={() => navigation.navigate('Filters')}
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
        <View style={styles.bannerSection}>
          <Carousel
            loop
            width={width - 40}
            height={200}
            autoPlay={true}
            data={banners}
            scrollAnimationDuration={1000}
            autoPlayInterval={3000}
            renderItem={renderBannerItem}
            style={styles.carousel}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productsRow}
            contentContainerStyle={styles.productsList}
          />
        </View>

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
                  onPress={() => navigation.navigate('Offers')}
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

        {/* Recent Viewed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products.slice(0, 2)}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id + '_recent'}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
          />
        </View>
      </ScrollView>
    </View>
  );
};

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
    marginBottom: 5,
    height: 36,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
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
    marginRight: 5,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
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