import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const WishlistScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Enhanced mock wishlist data
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: '1',
      name: 'Wireless Noise Cancelling Headphones',
      price: 99.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      category: 'Electronics',
      inStock: true,
      rating: 4.5,
      reviews: 128,
      addedDate: '2024-01-15',
      isOnSale: true,
      discount: 23,
      brand: 'Sony',
      colors: ['#000000', '#2F4F4F', '#696969'],
    },
    {
      id: '2',
      name: 'Professional Running Shoes',
      price: 79.99,
      originalPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      category: 'Sports',
      inStock: true,
      rating: 4.2,
      reviews: 89,
      addedDate: '2024-01-10',
      isOnSale: false,
      discount: 20,
      brand: 'Nike',
      colors: ['#FF0000', '#0000FF', '#FFFFFF'],
    },
    {
      id: '3',
      name: 'Smart Watch Series 5',
      price: 199.99,
      originalPrice: 249.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      category: 'Electronics',
      inStock: false,
      rating: 4.7,
      reviews: 256,
      addedDate: '2024-01-18',
      isOnSale: true,
      discount: 20,
      brand: 'Apple',
      colors: ['#000000', '#808080', '#C0C0C0'],
    },
    {
      id: '4',
      name: 'Designer Leather Backpack',
      price: 149.99,
      originalPrice: 179.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
      category: 'Fashion',
      inStock: true,
      rating: 4.3,
      reviews: 67,
      addedDate: '2024-01-05',
      isOnSale: true,
      discount: 17,
      brand: 'Samsonite',
      colors: ['#8B4513', '#000000', '#654321'],
    },
    {
      id: '5',
      name: 'Wireless Gaming Mouse',
      price: 59.99,
      originalPrice: 79.99,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
      category: 'Electronics',
      inStock: true,
      rating: 4.6,
      reviews: 342,
      addedDate: '2024-01-20',
      isOnSale: true,
      discount: 25,
      brand: 'Logitech',
      colors: ['#000000', '#FF0000', '#0000FF'],
    },
  ]);

  // Filter and sort items with useMemo for optimization
  const filteredItems = useMemo(() => {
    return wishlistItems
      .filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'discount':
            return (b.discount || 0) - (a.discount || 0);
          case 'name':
            return a.name.localeCompare(b.name);
          case 'recent':
          default:
            return new Date(b.addedDate) - new Date(a.addedDate);
        }
      });
  }, [wishlistItems, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => ({
    totalItems: wishlistItems.length,
    totalValue: wishlistItems.reduce((sum, item) => sum + item.price, 0),
    itemsOnSale: wishlistItems.filter(item => item.isOnSale).length,
    outOfStock: wishlistItems.filter(item => !item.inStock).length,
  }), [wishlistItems]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      // Here you would fetch fresh data
    }, 1500);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const removeSelectedItems = () => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      'Remove Selected Items',
      `Remove ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} from wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setWishlistItems(prev => prev.filter(item => !selectedItems.has(item.id)));
            setSelectedItems(new Set());
          }
        },
      ]
    );
  };

  const removeFromWishlist = (id: string) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setWishlistItems(prev => prev.filter(item => item.id !== id));
            setSelectedItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          }
        },
      ]
    );
  };

  const moveToCart = (item: any) => {
    Alert.alert(
      'Add to Cart',
      `Add "${item.name}" to your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add to Cart', 
          onPress: () => {
            // Here you would add the item to cart
            console.log(`Added ${item.name} to cart`);
            // Optional: remove from wishlist after adding to cart
            // setWishlistItems(prev => prev.filter(wishlistItem => wishlistItem.id !== item.id));
          }
        },
      ]
    );
  };

  const moveSelectedToCart = () => {
    if (selectedItems.size === 0) return;

    const selectedItemsData = wishlistItems.filter(item => selectedItems.has(item.id));
    const inStockItems = selectedItemsData.filter(item => item.inStock);

    if (inStockItems.length === 0) {
      Alert.alert('No items in stock', 'Selected items are currently out of stock.');
      return;
    }

    Alert.alert(
      'Add to Cart',
      `Add ${inStockItems.length} item${inStockItems.length > 1 ? 's' : ''} to cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add to Cart', 
          onPress: () => {
            console.log(`Added ${inStockItems.length} items to cart`);
            // Remove only in-stock items from wishlist
            setWishlistItems(prev => prev.filter(item => !selectedItems.has(item.id) || !item.inStock));
            setSelectedItems(new Set());
          }
        },
      ]
    );
  };

  const clearAllWishlist = () => {
    if (wishlistItems.length === 0) return;
    
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            setWishlistItems([]);
            setSelectedItems(new Set());
          }
        },
      ]
    );
  };

  const renderWishlistItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View 
      style={[
        styles.wishlistItem,
        { opacity: item.inStock ? 1 : 0.7 }
      ]}
    >
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={() => toggleSelectItem(item.id)}
      >
        <Ionicons 
          name={selectedItems.has(item.id) ? "checkbox" : "square-outline"} 
          size={20} 
          color={selectedItems.has(item.id) ? "#FF6B6B" : "#ccc"} 
        />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.brandText}>{item.brand}</Text>
          </View>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeFromWishlist(item.id)}
          >
            <Ionicons name="heart" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.metaContainer}>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
        </View>
        
        <View style={styles.colorContainer}>
          {item.colors?.slice(0, 3).map((color: string, colorIndex: number) => (
            <View 
              key={colorIndex} 
              style={[styles.colorDot, { backgroundColor: color }]} 
            />
          ))}
          {item.colors && item.colors.length > 3 && (
            <Text style={styles.moreColorsText}>+{item.colors.length - 3}</Text>
          )}
        </View>
        
        <View style={styles.priceContainer}>
          <View style={styles.priceInfo}>
            <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
            )}
            {item.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </View>
            )}
          </View>
          
          {!item.inStock && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>Out of Stock</Text>
            </View>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cartButton, !item.inStock && styles.disabledButton]}
            onPress={() => item.inStock && moveToCart(item)}
            disabled={!item.inStock}
          >
            <Ionicons name="cart-outline" size={16} color="#fff" />
            <Text style={styles.cartButtonText}>
              {item.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.shareButton]}>
            <Ionicons name="share-outline" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const SortButton = ({ title, value, icon }: { title: string, value: string, icon: string }) => (
    <TouchableOpacity 
      style={[styles.sortButton, sortBy === value && styles.sortButtonActive]}
      onPress={() => setSortBy(value)}
    >
      <Ionicons 
        name={icon} 
        size={14} 
        color={sortBy === value ? "#fff" : "#666"} 
        style={styles.sortIcon}
      />
      <Text style={[styles.sortButtonText, sortBy === value && styles.sortButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Wishlist</Text>
            <Text style={styles.headerSubtitle}>Your favorite items</Text>
          </View>
          <View style={styles.headerStats}>
            <Text style={styles.statNumber}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
        </View>
      </LinearGradient>

      {wishlistItems.length > 0 ? (
        <>
          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${stats.totalValue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.itemsOnSale}</Text>
              <Text style={styles.statLabel}>On Sale</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.outOfStock}</Text>
              <Text style={styles.statLabel}>Out of Stock</Text>
            </View>
          </View>

          {/* Selection Toolbar */}
          {selectedItems.size > 0 && (
            <View style={styles.selectionToolbar}>
              <Text style={styles.selectionText}>
                {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
              </Text>
              <View style={styles.toolbarActions}>
                <TouchableOpacity 
                  style={styles.toolbarButton}
                  onPress={moveSelectedToCart}
                >
                  <Ionicons name="cart" size={18} color="#fff" />
                  <Text style={styles.toolbarButtonText}>Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolbarButton, styles.removeToolbarButton]}
                  onPress={removeSelectedItems}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Search and Sort */}
          <View style={styles.controlsSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search in wishlist..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity 
                style={styles.selectAllButton}
                onPress={selectAllItems}
              >
                <Ionicons 
                  name={selectedItems.size === filteredItems.length ? "checkbox" : "square-outline"} 
                  size={16} 
                  color="#666" 
                />
                <Text style={styles.selectAllText}>
                  {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearAllButton} onPress={clearAllWishlist}>
                <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.sortSection}
            >
              <SortButton title="Recent" value="recent" icon="time-outline" />
              <SortButton title="Price: Low" value="price-low" icon="arrow-down-outline" />
              <SortButton title="Price: High" value="price-high" icon="arrow-up-outline" />
              <SortButton title="Rating" value="rating" icon="star-outline" />
              <SortButton title="Discount" value="discount" icon="pricetag-outline" />
              <SortButton title="Name" value="name" icon="text-outline" />
            </ScrollView>
          </View>

          {/* Wishlist Items */}
          <FlatList
            data={filteredItems}
            renderItem={renderWishlistItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.wishlistList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#FF6B6B']}
                tintColor={'#FF6B6B'}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={60} color="#ccc" />
                <Text style={styles.emptySearchText}>No items found</Text>
                <Text style={styles.emptySearchSubtext}>
                  {searchQuery ? 'Try adjusting your search' : 'Add some items to your wishlist'}
                </Text>
                {searchQuery && (
                  <TouchableOpacity 
                    style={styles.clearSearchButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Text style={styles.clearSearchText}>Clear Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            ListFooterComponent={<View style={styles.footer} />}
          />
        </>
      ) : (
        /* Empty Wishlist State */
        <View style={styles.emptyWishlist}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={80} color="#e0e0e0" />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite items here for quick access and get notified when prices drop!
          </Text>
          <TouchableOpacity style={styles.shopButton}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.shopButtonGradient}
            >
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  headerStats: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
  },
  selectionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 10,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  removeToolbarButton: {
    paddingHorizontal: 10,
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  controlsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  clearAllText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  sortSection: {
    flexGrow: 0,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f8f9fa',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  sortIcon: {
    marginRight: 4,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  wishlistList: {
    padding: 20,
    paddingTop: 10,
  },
  wishlistItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  selectButton: {
    paddingRight: 10,
    paddingTop: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
    marginBottom: 2,
  },
  brandText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 11,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginLeft: 2,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: '#999',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  moreColorsText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  stockBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  cartButton: {
    backgroundColor: '#FF6B6B',
    flex: 3,
  },
  shareButton: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyWishlist: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 50,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  shopButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '70%',
  },
  shopButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySearchText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearSearchButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  clearSearchText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    height: 40,
  },
});

export default WishlistScreen;