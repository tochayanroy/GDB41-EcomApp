import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  ActivityIndicator,
  Switch
} from 'react-native';

const { width, height } = Dimensions.get('window');

const PaymentScreen = ({ navigation, route }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  const [orderSummary] = useState({
    subtotal: 189.97,
    shipping: 5.99,
    tax: 18.65,
    discount: -20.00,
    total: 194.61,
    items: [
      { name: 'Wireless Headphones', price: 99.99, quantity: 1 },
      { name: 'Running Shoes', price: 79.99, quantity: 1 },
      { name: 'Phone Case', price: 9.99, quantity: 1 }
    ]
  });

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'card-outline',
      description: 'Pay with Visa, Mastercard, or Amex'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'logo-paypal',
      description: 'Pay with your PayPal account'
    },
    {
      id: 'applepay',
      name: 'Apple Pay',
      icon: 'logo-apple',
      description: 'Pay with Apple Pay'
    },
    {
      id: 'googlepay',
      name: 'Google Pay',
      icon: 'logo-google',
      description: 'Pay with Google Pay'
    }
  ];

  const savedCards = [
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'Mastercard',
      last4: '8888',
      expiry: '08/24',
      isDefault: false
    }
  ];

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : cleaned;
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').slice(0, 3);
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateForm = () => {
    if (selectedPaymentMethod === 'card') {
      if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('Error', 'Please enter a valid 16-digit card number');
        return false;
      }
      
      if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
        Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
        return false;
      }
      
      if (!cardData.cvv || cardData.cvv.length !== 3) {
        Alert.alert('Error', 'Please enter a valid CVV');
        return false;
      }
      
      if (!cardData.cardHolder) {
        Alert.alert('Error', 'Please enter card holder name');
        return false;
      }
    }
    
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      Alert.alert(
        'Payment Successful!',
        'Your order has been placed successfully. You will receive a confirmation email shortly.',
        [
          {
            text: 'View Order',
            onPress: () => {
              // navigation.navigate('OrderConfirmation');
            }
          },
          {
            text: 'Continue Shopping',
            onPress: () => {
              // navigation.navigate('Home');
            }
          }
        ]
      );
    }, 3000);
  };

  const getCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return 'Card';
  };

  const renderPaymentMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        selectedPaymentMethod === method.id && styles.selectedPaymentMethod
      ]}
      onPress={() => setSelectedPaymentMethod(method.id)}
    >
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodLeft}>
          <Ionicons 
            name={method.icon} 
            size={24} 
            color={selectedPaymentMethod === method.id ? '#FF6B6B' : '#666'} 
          />
          <View style={styles.paymentMethodInfo}>
            <Text style={[
              styles.paymentMethodName,
              selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
            ]}>
              {method.name}
            </Text>
            <Text style={styles.paymentMethodDescription}>
              {method.description}
            </Text>
          </View>
        </View>
        <View style={[
          styles.radioButton,
          selectedPaymentMethod === method.id && styles.radioButtonSelected
        ]}>
          {selectedPaymentMethod === method.id && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSavedCard = (card) => (
    <TouchableOpacity
      key={card.id}
      style={[
        styles.savedCard,
        card.isDefault && styles.defaultCard
      ]}
      onPress={() => setSelectedPaymentMethod('saved_' + card.id)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Ionicons 
            name="card-outline" 
            size={24} 
            color="#FF6B6B" 
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardType}>{card.type}</Text>
            <Text style={styles.cardNumber}>•••• {card.last4}</Text>
            <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
          </View>
        </View>
        <View style={[
          styles.radioButton,
          selectedPaymentMethod === 'saved_' + card.id && styles.radioButtonSelected
        ]}>
          {selectedPaymentMethod === 'saved_' + card.id && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </View>
      {card.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>DEFAULT</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Payment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderItems}>
            {orderSummary.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  ${item.price} × {item.quantity}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.orderTotal}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${orderSummary.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>${orderSummary.shipping.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>${orderSummary.tax.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, styles.discountValue]}>
                ${orderSummary.discount.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>${orderSummary.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Saved Cards */}
        {savedCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            {savedCards.map(renderSavedCard)}
          </View>
        )}

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Card Details Form */}
        {selectedPaymentMethod === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            
            {/* Card Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.cardInputContainer}>
                <TextInput
                  style={styles.cardInput}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#999"
                  value={cardData.cardNumber}
                  onChangeText={(value) => handleInputChange('cardNumber', value)}
                  keyboardType="number-pad"
                  maxLength={19}
                />
                {cardData.cardNumber && (
                  <Text style={styles.cardTypeBadge}>
                    {getCardType(cardData.cardNumber)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.row}>
              {/* Expiry Date */}
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  value={cardData.expiryDate}
                  onChangeText={(value) => handleInputChange('expiryDate', value)}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>

              {/* CVV */}
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="123"
                  placeholderTextColor="#999"
                  value={cardData.cvv}
                  onChangeText={(value) => handleInputChange('cvv', value)}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Card Holder */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Holder Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                placeholderTextColor="#999"
                value={cardData.cardHolder}
                onChangeText={(value) => handleInputChange('cardHolder', value)}
                autoCapitalize="words"
              />
            </View>

            {/* Save Card Toggle */}
            <View style={styles.saveCardContainer}>
              <Text style={styles.saveCardText}>Save card for future payments</Text>
              <Switch
                value={saveCard}
                onValueChange={setSaveCard}
                trackColor={{ false: '#f0f0f0', true: '#FF6B6B' }}
                thumbColor={saveCard ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        )}

        {/* Security Notice */}
        <View style={styles.securityContainer}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity 
          style={[
            styles.payButton,
            isProcessing && styles.payButtonProcessing
          ]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.payButtonText}>
                Pay ${orderSummary.total.toFixed(2)}
              </Text>
              <Ionicons name="lock-closed" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {/* Footer Notice */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By completing this purchase, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  orderTotal: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountValue: {
    color: '#4CAF50',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  paymentMethod: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPaymentMethod: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedPaymentMethodText: {
    color: '#FF6B6B',
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#666',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FF6B6B',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
  },
  savedCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  defaultCard: {
    borderColor: '#FF6B6B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#999',
  },
  defaultBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardInputContainer: {
    position: 'relative',
  },
  cardInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingRight: 80,
  },
  cardTypeBadge: {
    position: 'absolute',
    right: 15,
    top: 15,
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  saveCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  saveCardText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    marginTop: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonProcessing: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  footer: {
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

export default PaymentScreen;