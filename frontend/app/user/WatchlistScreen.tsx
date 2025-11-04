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
    Alert,
    Modal,
    TextInput,
    RefreshControl
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.102:5000';

const WatchlistScreen = () => {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [refreshing, setRefreshing] = useState(false);

  // Sort options
  const sortOptions = [
    { id: 'recent', label: 'Recently Added', icon: 'time' },
    { id: 'price_low', label: 'Price: Low to High', icon: 'arrow-up' },
    { id: 'price_high', label: 'Price: High to Low', icon: 'arrow-down' },
    { id: 'name', label: 'Name: A to Z', icon: 'text' },
    { id: 'rating', label: 'Highest Rated', icon: 'star' },
    { id: 'discount', label: 'Biggest Discount', icon: 'pricetag' }
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

  // API Functions - Updated to match your watchlist routes
  const fetchWatchlist = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/watchlist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  };

  const removeFromWatchlistAPI = async (productId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/watchlist/deleteWatchlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  };

  const toggleWatchlistAPI = async (productId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/watchlist/toggle/${productId}`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      throw error;
    }
  };

  const addToCartAPI = async (productId) => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/cart/add/${productId}`, 
        { quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const clearWatchlistAPI = async () => {
    try {
      const token = await getAuthToken();
      // Since there's no clear all endpoint, we'll remove items one by one
      const watchlist = await fetchWatchlist();
      if (watchlist && watchlist.length > 0) {
        const deletePromises = watchlist.map(item => 
          removeFromWatchlistAPI(item.product?._id || item.product)
        );
        await Promise.all(deletePromises);
      }
      return { success: true };
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const watchlistData = await fetchWatchlist();
      console.log('Watchlist API Response:', watchlistData);
      
      if (watchlistData && Array.isArray(watchlistData)) {
        // Transform API response to match our component structure
        const transformedItems = watchlistData.map(item => {
          const product = item.product || item;
          return {
            id: item._id || product._id,
            productId: product._id,
            name: product.name,
            price: product.price,
            originalPrice: product.price / (1 - (product.discount || 0) / 100),
            image: product.image,
            rating: product.rating || 4.0,
            reviewCount: product.reviewCount || 0,
            category: product.categorie?.name || product.category || 'Uncategorized',
            inStock: product.quantity > 0,
            discount: product.discount || 0,
            addedDate: item.addedAt || new Date().toISOString(),
            color: 'Default',
            size: 'Standard',
            isOnSale: product.discount > 0
          };
        });
        setWatchlistItems(transformedItems);
        setFilteredItems(transformedItems);
      } else {
        setWatchlistItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
      Alert.alert('Error', 'Failed to load watchlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWatchlist();
  };

  useEffect(() => {
    // Apply search filter
    let filtered = [...watchlistItems];
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const discountA = ((a.originalPrice - a.price) / a.originalPrice) * 100;
          const discountB = ((b.originalPrice - b.price) / b.originalPrice) * 100;
          return discountB - discountA;
        });
        break;
      default: // recent
        filtered.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedSort, watchlistItems]);

  const removeFromWatchlist = async (itemId, productId) => {
    Alert.alert(
      'Remove from Watchlist',
      'Are you sure you want to remove this item from your watchlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromWatchlistAPI(productId);
              setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
              Alert.alert('Removed', 'Item removed from watchlist');
            } catch (error) {
              console.error('Error removing from watchlist:', error);
              Alert.alert('Error', 'Failed to remove item from watchlist');
            }
          }
        }
      ]
    );
  };

  // Updated to use toggle endpoint for quick removal
  const quickRemoveFromWatchlist = async (itemId, productId) => {
    try {
      const result = await toggleWatchlistAPI(productId);
      if (!result.inWishlist) {
        setWatchlistItems(prev => prev.filter(item => item.id !== itemId));
        Alert.alert('Removed', 'Item removed from watchlist');
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      Alert.alert('Error', 'Failed to remove item from watchlist');
    }
  };

  const moveToCart = async (item) => {
    if (!item.inStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }

    Alert.alert(
      'Add to Cart',
      `Add "${item.name}" to your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: async () => {
            try {
              await addToCartAPI(item.productId);
              // Remove from watchlist after adding to cart
              await removeFromWatchlistAPI(item.productId);
              setWatchlistItems(prev => prev.filter(watchlistItem => watchlistItem.id !== item.id));
              Alert.alert('Success', 'Item added to cart');
            } catch (error) {
              console.error('Error moving to cart:', error);
              Alert.alert('Error', 'Failed to add item to cart');
            }
          }
        }
      ]
    );
  };

  const clearWatchlist = async () => {
    if (watchlistItems.length === 0) return;

    Alert.alert(
      'Clear Watchlist',
      'Are you sure you want to remove all items from your watchlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearWatchlistAPI();
              setWatchlistItems([]);
              setFilteredItems([]);
              Alert.alert('Success', 'Watchlist cleared successfully');
            } catch (error) {
              console.error('Error clearing watchlist:', error);
              Alert.alert('Error', 'Failed to clear watchlist');
            }
          }
        }
      ]
    );
  };

  const shareItem = (item) => {
    Alert.alert(
      'Share Product',
      `Share "${item.name}" with friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', style: 'default' }
      ]
    );
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const renderGridItem = ({ item }) => (
    <View style={styles.gridItem}>
      <View style={styles.itemImageContainer}>
        <Image 
          source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
          style={styles.gridItemImage} 
        />
        
        {/* Badges */}
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{Math.round(item.discount)}% OFF</Text>
          </View>
        )}
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => moveToCart(item)}
            disabled={!item.inStock}
          >
            <Ionicons 
              name="cart-outline" 
              size={16} 
              color={item.inStock ? "#fff" : "#ccc"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => quickRemoveFromWatchlist(item.id, item.productId)}
          >
            <Ionicons name="heart" size={16} color="#FF6B6B" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => shareItem(item)}
          >
            <Ionicons name="share-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.price}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
          )}
        </View>

        <View style={styles.itemMeta}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.addedDate}>{getTimeAgo(item.addedDate)}</Text>
        </View>

        {!item.inStock && (
          <TouchableOpacity style={styles.notifyButton}>
            <Text style={styles.notifyText}>Notify When Available</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderListItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listImageContainer}>
        <Image 
          source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }} 
          style={styles.listItemImage} 
        />
        
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{Math.round(item.discount)}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.listItemInfo}>
        <Text style={styles.listItemName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.listRatingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.listRatingText}>{item.rating}</Text>
          <Text style={styles.listReviewCount}>({item.reviewCount})</Text>
        </View>

        <View style={styles.listPriceContainer}>
          <Text style={styles.listCurrentPrice}>${item.price}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.listOriginalPrice}>${item.originalPrice.toFixed(2)}</Text>
          )}
        </View>

        <View style={styles.listItemMeta}>
          <Text style={styles.listCategory}>{item.category}</Text>
          <Text style={styles.listAddedDate}>{getTimeAgo(item.addedDate)}</Text>
        </View>

        <View style={styles.listItemActions}>
          <TouchableOpacity 
            style={[
              styles.listAddToCartButton,
              !item.inStock && styles.disabledButton
            ]}
            onPress={() => moveToCart(item)}
            disabled={!item.inStock}
          >
            <Ionicons name="cart-outline" size={16} color="#fff" />
            <Text style={styles.listAddToCartText}>
              {item.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.listRemoveButton}
            onPress={() => quickRemoveFromWatchlist(item.id, item.productId)}
          >
            <Ionicons name="heart" size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading your watchlist...</Text>
      </View>
    );
  }

  if (watchlistItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="heart-outline" size={80} color="#ccc" />
        </View>
        <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
        <Text style={styles.emptySubtitle}>
          Save items you love here for easy access later
        </Text>
        <TouchableOpacity style={styles.startShoppingButton}>
          <Text style={styles.startShoppingText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Watchlist</Text>
          <Text style={styles.itemCount}>{watchlistItems.length} items</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your watchlist..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Controls Bar */}
      <View style={styles.controlsBar}>
        <Text style={styles.resultsText}>
          {filteredItems.length} items found
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
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list' : 'grid'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={clearWatchlist}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Watchlist Items */}
      <FlatList
        data={filteredItems}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        contentContainerStyle={styles.watchlistList}
        showsVerticalScrollIndicator={false}
        key={viewMode}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Quick Actions Footer */}
      {filteredItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.addAllToCartButton}
            onPress={() => {
              const availableItems = filteredItems.filter(item => item.inStock);
              if (availableItems.length === 0) {
                Alert.alert('No Items Available', 'All items in your watchlist are out of stock.');
                return;
              }
              Alert.alert(
                'Add All to Cart', 
                `Add ${availableItems.length} available items to cart?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Add All',
                    onPress: async () => {
                      try {
                        const addPromises = availableItems.map(item => addToCartAPI(item.productId));
                        await Promise.all(addPromises);
                        const removePromises = availableItems.map(item => removeFromWatchlistAPI(item.productId));
                        await Promise.all(removePromises);
                        setWatchlistItems(prev => prev.filter(item => !item.inStock));
                        Alert.alert('Success', `${availableItems.length} items added to cart`);
                      } catch (error) {
                        console.error('Error adding all to cart:', error);
                        Alert.alert('Error', 'Failed to add items to cart');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.addAllToCartText}>Add All to Cart</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sort Modal */}
      {renderSortModal()}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  startShoppingButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  startShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  watchlistList: {
    padding: 10,
    paddingBottom: 80, // Space for footer
  },
  // Grid View Styles
  gridItem: {
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
  itemImageContainer: {
    position: 'relative',
  },
  gridItemImage: {
    width: '100%',
    height: 120,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 6,
    marginLeft: 5,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    height: 36,
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
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addedDate: {
    fontSize: 10,
    color: '#999',
  },
  notifyButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  notifyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  // List View Styles
  listItem: {
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
  listImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  listItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  listRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listReviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#999',
  },
  listPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listCurrentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 8,
  },
  listOriginalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  listItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  listAddedDate: {
    fontSize: 12,
    color: '#999',
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listAddToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  listAddToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  listRemoveButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addAllToCartButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
  },
  addAllToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WatchlistScreen;