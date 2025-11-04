import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

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
  Share
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.0.102:5000';

const ProductDetailsScreen = () => {
  const router = useRouter();

  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

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
  const fetchProductDetails = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/product/getProduct/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/product/allProduct`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Filter related products by category (first 4 products from same category)
      if (product && response.data) {
        const related = response.data
          .filter(p => p._id !== product._id && p.categorie?._id === product.categorie?._id)
          .slice(0, 4);
        return related;
      }
      return response.data?.slice(0, 4) || [];
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  };


  const addToCart = async () => {
    if (!product) return;

    try {
      const token = await getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/cart/add/${product._id}`,
        {
          quantity: quantity
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
          `${quantity} × ${product.name} has been added to your cart`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add product to cart');
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add product to cart');
    }
  };

  const addToWishlist = async () => {
    if (!product) return;

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

  const shareProduct = async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Check out this amazing product: ${product.name} - $${product.price}`,
        url: product.image ? `${API_BASE_URL}/${product.image}` : ''
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share product');
    }
  };








  const buyNow = () => {
    if (!product) return;

    Alert.alert(
      'Proceed to Checkout',
      `You are about to purchase ${quantity} × ${product.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue', style: 'default', onPress: () => {
            router.push({
              pathname: '../checkout/CheckoutScreen',
              params: {
                productId: product._id,
                quantity: quantity
              }
            });
          }
        }
      ]
    );
  };


  const loadProductData = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [productData, reviewsData] = await Promise.all([
        fetchProductDetails(),
      ]);

      setProduct(productData);
      setReviews(reviewsData);

      // Load related products after product data is set
      const relatedData = await fetchRelatedProducts();
      setRelatedProducts(relatedData);
    } catch (error) {
      console.error('Error loading product data:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <Text style={styles.reviewUserName}>{item.user?.username || 'Anonymous'}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.reviewRating}>
        {[...Array(5)].map((_, index) => (
          <Ionicons
            key={index}
            name={index < item.rating ? "star" : "star-outline"}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  const renderRelatedProduct = ({ item }) => (
    <TouchableOpacity style={styles.relatedProduct}>
      <Image
        source={{ uri: item.image ? `${API_BASE_URL}/${item.image}` : 'https://via.placeholder.com/300' }}
        style={styles.relatedProductImage}
      />
      <View style={styles.relatedProductInfo}>
        <Text style={styles.relatedProductName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.relatedProductRating}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.relatedProductRatingText}>
            {item.rating || 0}
          </Text>
        </View>
        <View style={styles.relatedProductPrice}>
          <Text style={styles.relatedProductCurrentPrice}>${item.price}</Text>
          {item.discount > 0 && (
            <Text style={styles.relatedProductOriginalPrice}>
              ${(item.price / (1 - item.discount / 100)).toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStars = (rating) => {
    const actualRating = rating || 0;
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => (
          <Ionicons
            key={index}
            name={index < Math.floor(actualRating) ? "star" : "star-outline"}
            size={16}
            color="#FFD700"
          />
        ))}
        <Text style={styles.ratingText}>({actualRating})</Text>
      </View>
    );
  };

  // Calculate average rating

  // Render product details content
  const renderProductContent = () => {
    if (!product) return null;

    const productImages = product.image ? [product.image] : [];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: productImages[selectedImage] ? `${API_BASE_URL}/${productImages[selectedImage]}` : 'https://via.placeholder.com/400' }}
            style={styles.mainImage}
          />
          {productImages.length > 1 && (
            <View style={styles.imageThumbnails}>
              {productImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.selectedThumbnail
                  ]}
                  onPress={() => setSelectedImage(index)}
                >
                  <Image
                    source={{ uri: `${API_BASE_URL}/${image}` }}
                    style={styles.thumbnailImage}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.brandContainer}>
              <Text style={styles.brand}>{product.categorie?.name || 'Uncategorized'}</Text>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={shareProduct}>
              <Ionicons name="share-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.productName}>{product.name}</Text>


          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${product.price}</Text>
            {product.discount > 0 && (
              <>
                <Text style={styles.originalPrice}>
                  ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{product.discount}% OFF</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.availability}>
            <Ionicons
              name={product.quantity > 0 ? "checkmark-circle" : "close-circle"}
              size={20}
              color={product.quantity > 0 ? "#4CAF50" : "#FF6B6B"}
            />
            <Text style={[
              styles.availabilityText,
              { color: product.quantity > 0 ? "#4CAF50" : "#FF6B6B" }
            ]}>
              {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          {product.description && (
            <Text style={styles.productDescription} numberOfLines={3}>
              {product.description}
            </Text>
          )}
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#333"} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={increaseQuantity}
              disabled={product.quantity === 0}
            >
              <Ionicons name="add" size={20} color={product.quantity === 0 ? "#ccc" : "#333"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={addToWishlist}
          >
            <Ionicons name="heart-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              (product.quantity === 0) && styles.disabledButton
            ]}
            onPress={addToCart}
            disabled={product.quantity === 0}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.addToCartText}>
              {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buyNowButton,
              (product.quantity === 0) && styles.disabledButton
            ]}
            onPress={buyNow}
            disabled={product.quantity === 0}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'description' && styles.activeTab]}
              onPress={() => setActiveTab('description')}
            >
              <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>
                Description
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'description' && (
            <View style={styles.tabSection}>
              <Text style={styles.descriptionText}>
                {product.description || 'No description available.'}
              </Text>
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.tabSection}>
              {reviews.length > 0 ? (
                <>
                  <View style={styles.reviewsSummary}>
                    <View style={styles.overallRating}>
                      <Text style={styles.overallRatingNumber}>{averageRating}</Text>
                      {renderStars(parseFloat(averageRating))}
                      <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
                    </View>
                    <View style={styles.ratingBreakdown}>
                      {[5, 4, 3, 2, 1].map(rating => {
                        const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
                        const percentage = (count / reviews.length) * 100;
                        return (
                          <View key={rating} style={styles.ratingBar}>
                            <Text style={styles.ratingNumber}>{rating}</Text>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <View style={styles.ratingProgressBar}>
                              <View
                                style={[styles.ratingProgress, { width: `${percentage}%` }]}
                              />
                            </View>
                            <Text style={styles.ratingCount}>({count})</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={item => item._id}
                    scrollEnabled={false}
                  />
                </>
              ) : (
                <View style={styles.noReviews}>
                  <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                  <Text style={styles.noReviewsText}>No reviews yet</Text>
                  <Text style={styles.noReviewsSubtext}>Be the first to review this product</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>You may also like</Text>
            <FlatList
              data={relatedProducts}
              renderItem={renderRelatedProduct}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedProductsList}
            />
          </View>
        )}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadProductData}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderProductContent()}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSection: {
    backgroundColor: '#fff',
    paddingBottom: 15,
  },
  mainImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  imageThumbnails: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#FF6B6B',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  shareButton: {
    padding: 5,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    lineHeight: 24,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  quantitySection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  quantityText: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actionButtons: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wishlistButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#fff',
    padding: 20,
    minHeight: 200,
  },
  tabSection: {
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  reviewsSummary: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  overallRating: {
    alignItems: 'center',
    marginRight: 30,
  },
  overallRatingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  totalReviews: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  ratingBreakdown: {
    flex: 1,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingNumber: {
    fontSize: 12,
    color: '#666',
    width: 10,
    marginRight: 4,
  },
  ratingProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingProgress: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    width: 30,
  },
  reviewItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 10,
    color: '#4CAF50',
    marginLeft: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noReviews: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noReviewsText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  relatedSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  relatedProductsList: {
    paddingRight: 20,
  },
  relatedProduct: {
    width: 150,
    marginRight: 15,
  },
  relatedProductImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedProductInfo: {
    flex: 1,
  },
  relatedProductName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    height: 32,
  },
  relatedProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  relatedProductRatingText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  relatedProductPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relatedProductCurrentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 4,
  },
  relatedProductOriginalPrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
});

export default ProductDetailsScreen;