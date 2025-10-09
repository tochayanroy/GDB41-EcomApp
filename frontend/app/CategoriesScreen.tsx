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
    TextInput
} from 'react-native';

const { width } = Dimensions.get('window');

const CategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);

  // Static categories data
  const staticCategories = [
    {
      id: '1',
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300',
      description: 'Latest gadgets and electronic devices',
      productCount: 156,
      icon: 'phone-portrait',
      color: '#FF6B6B',
      subcategories: ['Smartphones', 'Laptops', 'Headphones', 'Smart Watches', 'Cameras']
    },
    {
      id: '2',
      name: 'Fashion',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300',
      description: 'Trendy clothing and accessories',
      productCount: 289,
      icon: 'shirt',
      color: '#4ECDC4',
      subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories']
    },
    {
      id: '3',
      name: 'Home & Garden',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
      description: 'Furniture and home decor items',
      productCount: 178,
      icon: 'home',
      color: '#45B7D1',
      subcategories: ['Furniture', 'Decor', 'Kitchen', 'Garden', 'Lighting']
    },
    {
      id: '4',
      name: 'Beauty & Health',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300',
      description: 'Cosmetics and wellness products',
      productCount: 234,
      icon: 'color-palette',
      color: '#96CEB4',
      subcategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Wellness']
    },
    {
      id: '5',
      name: 'Sports & Outdoors',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
      description: 'Sports equipment and outdoor gear',
      productCount: 167,
      icon: 'basketball',
      color: '#FFEAA7',
      subcategories: ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports', 'Cycling']
    },
    {
      id: '6',
      name: 'Books & Media',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
      description: 'Books, movies, and music',
      productCount: 312,
      icon: 'book',
      color: '#DDA0DD',
      subcategories: ['Fiction', 'Non-Fiction', 'Educational', 'Movies', 'Music']
    },
    {
      id: '7',
      name: 'Toys & Games',
      image: 'https://images.unsplash.com/photo-1550747534-8aec95df0f61?w=300',
      description: 'Toys and entertainment for all ages',
      productCount: 198,
      icon: 'game-controller',
      color: '#FFA07A',
      subcategories: ['Educational', 'Action Figures', 'Board Games', 'Puzzles', 'Outdoor Toys']
    },
    {
      id: '8',
      name: 'Automotive',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300',
      description: 'Car accessories and parts',
      productCount: 145,
      icon: 'car',
      color: '#778899',
      subcategories: ['Car Care', 'Accessories', 'Tools', 'Electronics', 'Parts']
    },
    {
      id: '9',
      name: 'Food & Grocery',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
      description: 'Fresh food and grocery items',
      productCount: 423,
      icon: 'fast-food',
      color: '#F08080',
      subcategories: ['Fresh Produce', 'Beverages', 'Snacks', 'Dairy', 'Bakery']
    },
    {
      id: '10',
      name: 'Jewelry',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300',
      description: 'Fine jewelry and accessories',
      productCount: 89,
      icon: 'diamond',
      color: '#FFD700',
      subcategories: ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Watches']
    }
  ];

  // Static products for category details
  const staticProducts = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 99.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      rating: 4.5,
      category: 'Electronics',
      discount: 23
    },
    {
      id: '3',
      name: 'Smart Watch Series 5',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      rating: 4.7,
      category: 'Electronics',
      discount: 20
    },
    {
      id: '7',
      name: 'Wireless Earbuds Pro',
      price: 129.99,
      originalPrice: 159.99,
      image: 'https://images.unsplash.com/photo-1590658165737-15a047b8b5e0?w=300',
      rating: 4.6,
      category: 'Electronics',
      discount: 19
    },
    {
      id: '11',
      name: 'Gaming Laptop',
      price: 1299.99,
      originalPrice: 1499.99,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300',
      rating: 4.8,
      category: 'Electronics',
      discount: 13
    },
    {
      id: '12',
      name: 'DSLR Camera',
      price: 899.99,
      originalPrice: 1099.99,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300',
      rating: 4.4,
      category: 'Electronics',
      discount: 18
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setCategories(staticCategories);
      setFilteredCategories(staticCategories);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    // Filter products by category
    const products = staticProducts.filter(product => 
      product.category === category.name
    );
    setCategoryProducts(products);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryProducts([]);
  };

  const handleProductPress = (product) => {
    // Handle product press - could show product details
    console.log('Product pressed:', product.name);
  };

  const renderCategoryGrid = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={32} color="#fff" />
      </View>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.productCount}>{item.productCount} products</Text>
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
          <Text style={styles.listProductCount}>{item.productCount} products</Text>
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
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
        </View>
      </View>
      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}% OFF</Text>
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

        {/* Category Banner */}
        <View style={styles.categoryBanner}>
          <Image 
            source={{ uri: selectedCategory.image }} 
            style={styles.bannerImage} 
          />
          <View style={styles.bannerOverlay}>
            <View style={[styles.bannerIcon, { backgroundColor: selectedCategory.color }]}>
              <Ionicons name={selectedCategory.icon} size={40} color="#fff" />
            </View>
            <Text style={styles.bannerTitle}>{selectedCategory.name}</Text>
            <Text style={styles.bannerDescription}>{selectedCategory.description}</Text>
            <Text style={styles.bannerProductCount}>
              {selectedCategory.productCount} products available
            </Text>
          </View>
        </View>

        {/* Subcategories */}
        <View style={styles.subcategoriesSection}>
          <Text style={styles.sectionTitle}>Subcategories</Text>
          <View style={styles.subcategoriesGrid}>
            {selectedCategory.subcategories.map((subcategory, index) => (
              <TouchableOpacity key={index} style={styles.subcategoryCard}>
                <Text style={styles.subcategoryCardText}>{subcategory}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categoryProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        </View>

        {/* All Products Grid */}
        <View style={styles.allProductsSection}>
          <Text style={styles.sectionTitle}>All Products</Text>
          <FlatList
            data={categoryProducts}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.gridProductCard}>
                <Image source={{ uri: item.image }} style={styles.gridProductImage} />
                <View style={styles.gridProductInfo}>
                  <Text style={styles.gridProductName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.gridPriceContainer}>
                    <Text style={styles.gridCurrentPrice}>${item.price}</Text>
                    {item.originalPrice > item.price && (
                      <Text style={styles.gridOriginalPrice}>${item.originalPrice}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productsGrid}
            contentContainerStyle={styles.gridProductsList}
          />
        </View>
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
          keyExtractor={item => item.id}
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