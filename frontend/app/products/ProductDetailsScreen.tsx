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
    Share
} from 'react-native';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = () => {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Static product data
  const staticProduct = {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 99.99,
    originalPrice: 129.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
      'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=400',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
    ],
    rating: 4.5,
    reviewCount: 128,
    category: 'Electronics',
    brand: 'SoundMax',
    isNew: true,
    isFeatured: true,
    description: 'Experience premium sound quality with our latest wireless headphones. Featuring advanced noise cancellation technology, these headphones provide crystal-clear audio and exceptional comfort for extended listening sessions.',
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Quick charge (3 hours in 15 minutes)',
      'Bluetooth 5.0 connectivity',
      'Comfortable over-ear design',
      'Built-in microphone for calls'
    ],
    specifications: {
      'Battery Life': '30 hours',
      'Charging Time': '2 hours',
      'Connectivity': 'Bluetooth 5.0',
      'Weight': '250g',
      'Color': 'Matte Black',
      'Warranty': '1 year'
    },
    inStock: true,
    discount: 23,
    sku: 'SM-BT001',
    tags: ['wireless', 'headphones', 'bluetooth', 'noise-cancellation']
  };

  // Static related products
  const staticRelatedProducts = [
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
      id: '8',
      name: 'Fitness Tracker Watch',
      price: 89.99,
      originalPrice: 119.99,
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300',
      rating: 4.0,
      category: 'Sports',
      discount: 25
    },
    {
      id: '9',
      name: 'Portable Speaker',
      price: 69.99,
      originalPrice: 89.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
      rating: 4.3,
      category: 'Electronics',
      discount: 22
    }
  ];

  // Static reviews
  const staticReviews = [
    {
      id: '1',
      user: 'John Smith',
      rating: 5,
      date: '2024-01-15',
      comment: 'Amazing sound quality! The noise cancellation works perfectly. Very comfortable for long listening sessions.',
      verified: true
    },
    {
      id: '2',
      user: 'Sarah Johnson',
      rating: 4,
      date: '2024-01-10',
      comment: 'Great headphones, battery life is impressive. Only wish the case was included.',
      verified: true
    },
    {
      id: '3',
      user: 'Mike Chen',
      rating: 5,
      date: '2024-01-08',
      comment: 'Best headphones I have ever owned. Worth every penny!',
      verified: false
    },
    {
      id: '4',
      user: 'Emily Davis',
      rating: 4,
      date: '2024-01-05',
      comment: 'Comfortable and great sound. The quick charge feature is very convenient.',
      verified: true
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setProduct(staticProduct);
      setRelatedProducts(staticRelatedProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const addToCart = () => {
    if (!product) return;
    
    Alert.alert(
      'Added to Cart',
      `${quantity} × ${product.name} has been added to your cart`,
      [{ text: 'OK' }]
    );
  };

  const addToWishlist = () => {
    if (!product) return;
    
    Alert.alert(
      'Added to Wishlist',
      `${product.name} has been added to your wishlist`,
      [{ text: 'OK' }]
    );
  };

  const shareProduct = async () => {
    if (!product) return;
    
    try {
      await Share.share({
        message: `Check out this amazing product: ${product.name} - $${product.price}`,
        url: product.images[0]
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
        { text: 'Continue', style: 'default' }
      ]
    );
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <Text style={styles.reviewUserName}>{item.user}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        <Text style={styles.reviewDate}>{item.date}</Text>
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
      <Image source={{ uri: item.image }} style={styles.relatedProductImage} />
      <View style={styles.relatedProductInfo}>
        <Text style={styles.relatedProductName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.relatedProductRating}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.relatedProductRatingText}>{item.rating}</Text>
        </View>
        <View style={styles.relatedProductPrice}>
          <Text style={styles.relatedProductCurrentPrice}>${item.price}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.relatedProductOriginalPrice}>${item.originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, index) => (
          <Ionicons
            key={index}
            name={index < Math.floor(rating) ? "star" : "star-outline"}
            size={16}
            color="#FFD700"
          />
        ))}
        <Text style={styles.ratingText}>({rating})</Text>
      </View>
    );
  };

  // Render product details content
  const renderProductContent = () => {
    if (!product) return null;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: product.images[selectedImage] }} 
            style={styles.mainImage} 
          />
          <View style={styles.imageThumbnails}>
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.selectedThumbnail
                ]}
                onPress={() => setSelectedImage(index)}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.brandContainer}>
              <Text style={styles.brand}>{product.brand}</Text>
              {product.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={shareProduct}>
              <Ionicons name="share-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.ratingContainer}>
            {renderStars(product.rating)}
            <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${product.price}</Text>
            {product.originalPrice > product.price && (
              <>
                <Text style={styles.originalPrice}>${product.originalPrice}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{product.discount}% OFF</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.availability}>
            <Ionicons 
              name={product.inStock ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={product.inStock ? "#4CAF50" : "#FF6B6B"} 
            />
            <Text style={[
              styles.availabilityText,
              { color: product.inStock ? "#4CAF50" : "#FF6B6B" }
            ]}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
            <Text style={styles.sku}>SKU: {product.sku}</Text>
          </View>
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
            >
              <Ionicons name="add" size={20} color="#333" />
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
              !product.inStock && styles.disabledButton
            ]}
            onPress={addToCart}
            disabled={!product.inStock}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.addToCartText}>
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.buyNowButton,
              !product.inStock && styles.disabledButton
            ]}
            onPress={buyNow}
            disabled={!product.inStock}
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
            <TouchableOpacity
              style={[styles.tab, activeTab === 'features' && styles.activeTab]}
              onPress={() => setActiveTab('features')}
            >
              <Text style={[styles.tabText, activeTab === 'features' && styles.activeTabText]}>
                Features
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'specifications' && styles.activeTab]}
              onPress={() => setActiveTab('specifications')}
            >
              <Text style={[styles.tabText, activeTab === 'specifications' && styles.activeTabText]}>
                Specifications
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                Reviews ({staticReviews.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'description' && (
            <View style={styles.tabSection}>
              <Text style={styles.descriptionText}>{product.description}</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'features' && (
            <View style={styles.tabSection}>
              {product.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'specifications' && (
            <View style={styles.tabSection}>
              {Object.entries(product.specifications).map(([key, value], index) => (
                <View key={index} style={styles.specItem}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.tabSection}>
              <View style={styles.reviewsSummary}>
                <View style={styles.overallRating}>
                  <Text style={styles.overallRatingNumber}>{product.rating}</Text>
                  {renderStars(product.rating)}
                  <Text style={styles.totalReviews}>{product.reviewCount} reviews</Text>
                </View>
                <View style={styles.ratingBreakdown}>
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = staticReviews.filter(r => Math.floor(r.rating) === rating).length;
                    const percentage = (count / staticReviews.length) * 100;
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
                data={staticReviews}
                renderItem={renderReviewItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* Related Products */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>You may also like</Text>
          <FlatList
            data={relatedProducts}
            renderItem={renderRelatedProduct}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedProductsList}
          />
        </View>
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
          onPress={() => {
            setLoading(true);
            setTimeout(() => {
              setProduct(staticProduct);
              setRelatedProducts(staticRelatedProducts);
              setLoading(false);
            }, 1000);
          }}
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
  newBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  sku: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#999',
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
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specKey: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
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