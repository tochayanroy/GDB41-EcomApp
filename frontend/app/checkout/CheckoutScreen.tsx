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
    TextInput,
    Alert,
    ActivityIndicator,
    Switch
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.0.102:5000';

const CheckoutScreen = () => {
    const { productId, quantity } = useLocalSearchParams();
    const router = useRouter();
  
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [saveShippingInfo, setSaveShippingInfo] = useState(true);
    const [sameAsShipping, setSameAsShipping] = useState(true);

    // Form states
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh'
    });

    const [billingInfo, setBillingInfo] = useState({
        firstName: '',
        lastName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh'
    });

    const [paymentInfo, setPaymentInfo] = useState({
        paymentMethod: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    });

    // API data
    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedShipping, setSelectedShipping] = useState('standard');

    // Shipping options
    const shippingOptions = [
        { id: 'standard', name: 'Standard Shipping', price: 50, days: '5-7 business days' },
        { id: 'express', name: 'Express Shipping', price: 100, days: '2-3 business days' },
        { id: 'free', name: 'Free Shipping', price: 0, days: '7-10 business days', minOrder: 500 }
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
    const fetchCartItems = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/cart/getCart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.items || [];
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
    };

    const fetchAddresses = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/addresses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data || [];
        } catch (error) {
            console.error('Error fetching addresses:', error);
            return [];
        }
    };

    const createOrder = async (orderData) => {
        try {
            const token = await getAuthToken();
            const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    };

    const createAddress = async (addressData) => {
        try {
            const token = await getAuthToken();
            const response = await axios.post(`${API_BASE_URL}/addresses`, addressData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating address:', error);
            throw error;
        }
    };

    useEffect(() => {
        loadCheckoutData();
    }, []);

    const loadCheckoutData = async () => {
        setLoading(true);
        try {
            const [cartData, addressesData] = await Promise.all([
                fetchCartItems(),
                fetchAddresses()
            ]);

            setCartItems(cartData);
            setAddresses(addressesData);

            // Set default address if available
            const defaultAddress = addressesData.find(addr => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress._id);
                setShippingInfo({
                    firstName: defaultAddress.fullName.split(' ')[0] || '',
                    lastName: defaultAddress.fullName.split(' ').slice(1).join(' ') || '',
                    email: '',
                    phone: defaultAddress.phone,
                    addressLine1: defaultAddress.addressLine1,
                    addressLine2: defaultAddress.addressLine2 || '',
                    city: defaultAddress.city,
                    state: defaultAddress.state,
                    postalCode: defaultAddress.postalCode,
                    country: defaultAddress.country
                });
            }

        } catch (error) {
            console.error('Error loading checkout data:', error);
            Alert.alert('Error', 'Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sameAsShipping) {
            setBillingInfo(shippingInfo);
        }
    }, [sameAsShipping, shippingInfo]);

    // Calculate order totals
    const calculateTotals = () => {
        const subtotal = cartItems.reduce((total, item) => {
            const price = item.product?.discount > 0 
                ? item.product.price * (1 - item.product.discount / 100)
                : item.product?.price || 0;
            return total + (price * item.quantity);
        }, 0);

        const shippingOption = shippingOptions.find(option => option.id === selectedShipping);
        const shipping = shippingOption ? shippingOption.price : 0;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        return {
            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2)
        };
    };

    const handleShippingInfoChange = (field, value) => {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleBillingInfoChange = (field, value) => {
        setBillingInfo(prev => ({ ...prev, [field]: value }));
    };

    const handlePaymentInfoChange = (field, value) => {
        setPaymentInfo(prev => ({ ...prev, [field]: value }));
    };

    const validateShippingInfo = () => {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'addressLine1', 'city', 'state', 'postalCode'];
        const missingFields = requiredFields.filter(field => !shippingInfo[field].trim());
        
        if (missingFields.length > 0) {
            Alert.alert('Missing Information', 'Please fill in all required shipping fields.');
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return false;
        }

        return true;
    };

    const validatePaymentInfo = () => {
        if (paymentInfo.paymentMethod === 'card') {
            const requiredFields = ['cardNumber', 'expiryDate', 'cvv', 'nameOnCard'];
            const missingFields = requiredFields.filter(field => !paymentInfo[field].trim());
            
            if (missingFields.length > 0) {
                Alert.alert('Missing Information', 'Please fill in all payment details.');
                return false;
            }

            if (paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) {
                Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
                return false;
            }

            if (paymentInfo.cvv.length !== 3) {
                Alert.alert('Invalid CVV', 'Please enter a valid 3-digit CVV.');
                return false;
            }
        }

        return true;
    };

    const goToNextStep = () => {
        if (activeStep === 1) {
            if (validateShippingInfo()) {
                setActiveStep(2);
            }
        } else if (activeStep === 2) {
            if (validatePaymentInfo()) {
                setActiveStep(3);
            }
        }
    };

    const goToPreviousStep = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
        }
    };

    const placeOrder = async () => {
        if (cartItems.length === 0) {
            Alert.alert('Error', 'Your cart is empty');
            return;
        }

        setProcessing(true);
        try {
            // Create shipping address if not using existing one
            let shippingAddressId = selectedAddress;
            if (!selectedAddress && saveShippingInfo) {
                const newAddress = await createAddress({
                    fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                    phone: shippingInfo.phone,
                    addressLine1: shippingInfo.addressLine1,
                    addressLine2: shippingInfo.addressLine2,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    postalCode: shippingInfo.postalCode,
                    country: shippingInfo.country,
                    isDefault: true
                });
                shippingAddressId = newAddress._id;
            }

            const orderData = {
                shippingAddress: shippingAddressId,
                paymentMethod: paymentInfo.paymentMethod
            };

            const order = await createOrder(orderData);
            
            Alert.alert(
                'Order Placed Successfully!',
                `Your order #${order.orderNumber} has been confirmed.`,
                [
                    { 
                        text: 'OK', 
                        onPress: () => router.replace('/orders') 
                    }
                ]
            );

        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert(
                'Order Failed', 
                error.response?.data?.message || 'Failed to place order. Please try again.'
            );
        } finally {
            setProcessing(false);
        }
    };

    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\D/g, '');
        const match = cleaned.match(/.{1,4}/g);
        return match ? match.join(' ') : '';
    };

    const formatExpiryDate = (text) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 3) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            <View style={styles.stepsContainer}>
                {/* Step 1: Shipping */}
                <View style={styles.step}>
                    <View style={[styles.stepCircle, activeStep >= 1 && styles.activeStep]}>
                        {activeStep > 1 ? (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        ) : (
                            <Text style={[styles.stepNumber, activeStep >= 1 && styles.activeStepText]}>1</Text>
                        )}
                    </View>
                    <Text style={[styles.stepLabel, activeStep >= 1 && styles.activeStepLabel]}>Shipping</Text>
                </View>

                {/* Step 2: Payment */}
                <View style={styles.step}>
                    <View style={[styles.stepCircle, activeStep >= 2 && styles.activeStep]}>
                        {activeStep > 2 ? (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        ) : (
                            <Text style={[styles.stepNumber, activeStep >= 2 && styles.activeStepText]}>2</Text>
                        )}
                    </View>
                    <Text style={[styles.stepLabel, activeStep >= 2 && styles.activeStepLabel]}>Payment</Text>
                </View>

                {/* Step 3: Review */}
                <View style={styles.step}>
                    <View style={[styles.stepCircle, activeStep >= 3 && styles.activeStep]}>
                        <Text style={[styles.stepNumber, activeStep >= 3 && styles.activeStepText]}>3</Text>
                    </View>
                    <Text style={[styles.stepLabel, activeStep >= 3 && styles.activeStepLabel]}>Review</Text>
                </View>
            </View>
        </View>
    );

    const renderShippingStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>
            
            {/* Existing Addresses */}
            {addresses.length > 0 && (
                <View style={styles.addressesSection}>
                    <Text style={styles.subSectionTitle}>Saved Addresses</Text>
                    {addresses.map(address => (
                        <TouchableOpacity
                            key={address._id}
                            style={[
                                styles.addressOption,
                                selectedAddress === address._id && styles.selectedAddress
                            ]}
                            onPress={() => {
                                setSelectedAddress(address._id);
                                setShippingInfo({
                                    firstName: address.fullName.split(' ')[0] || '',
                                    lastName: address.fullName.split(' ').slice(1).join(' ') || '',
                                    email: '',
                                    phone: address.phone,
                                    addressLine1: address.addressLine1,
                                    addressLine2: address.addressLine2 || '',
                                    city: address.city,
                                    state: address.state,
                                    postalCode: address.postalCode,
                                    country: address.country
                                });
                            }}
                        >
                            <View style={styles.radioContainer}>
                                <View style={[
                                    styles.radio,
                                    selectedAddress === address._id && styles.radioSelected
                                ]}>
                                    {selectedAddress === address._id && <View style={styles.radioInner} />}
                                </View>
                            </View>
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressName}>{address.fullName}</Text>
                                <Text style={styles.addressText}>{address.addressLine1}</Text>
                                {address.addressLine2 && (
                                    <Text style={styles.addressText}>{address.addressLine2}</Text>
                                )}
                                <Text style={styles.addressText}>
                                    {address.city}, {address.state} {address.postalCode}
                                </Text>
                                <Text style={styles.addressText}>{address.phone}</Text>
                                {address.isDefault && (
                                    <Text style={styles.defaultBadge}>Default</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={styles.subSectionTitle}>
                {addresses.length > 0 ? 'Or Add New Address' : 'Add Shipping Address'}
            </Text>
            
            <View style={styles.formRow}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>First Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={shippingInfo.firstName}
                        onChangeText={(text) => handleShippingInfoChange('firstName', text)}
                        placeholder="Enter first name"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Last Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={shippingInfo.lastName}
                        onChangeText={(text) => handleShippingInfoChange('lastName', text)}
                        placeholder="Enter last name"
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                    style={styles.input}
                    value={shippingInfo.email}
                    onChangeText={(text) => handleShippingInfoChange('email', text)}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                    style={styles.input}
                    value={shippingInfo.phone}
                    onChangeText={(text) => handleShippingInfoChange('phone', text)}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line 1 *</Text>
                <TextInput
                    style={styles.input}
                    value={shippingInfo.addressLine1}
                    onChangeText={(text) => handleShippingInfoChange('addressLine1', text)}
                    placeholder="Enter street address"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Address Line 2</Text>
                <TextInput
                    style={styles.input}
                    value={shippingInfo.addressLine2}
                    onChangeText={(text) => handleShippingInfoChange('addressLine2', text)}
                    placeholder="Apartment, suite, etc. (optional)"
                />
            </View>

            <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 2 }]}>
                    <Text style={styles.label}>City *</Text>
                    <TextInput
                        style={styles.input}
                        value={shippingInfo.city}
                        onChangeText={(text) => handleShippingInfoChange('city', text)}
                        placeholder="Enter city"
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.label}>State *</Text>
                    <TextInput
                        style={styles.input}
                        value={shippingInfo.state}
                        onChangeText={(text) => handleShippingInfoChange('state', text)}
                        placeholder="State"
                    />
                </View>
            </View>

            <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Postal Code *</Text>
                    <TextInput
                        style={styles.input}
                        value={shippingInfo.postalCode}
                        onChangeText={(text) => handleShippingInfoChange('postalCode', text)}
                        placeholder="Postal code"
                        keyboardType="number-pad"
                    />
                </View>
                <View style={[styles.formGroup, { flex: 2, marginLeft: 10 }]}>
                    <Text style={styles.label}>Country</Text>
                    <TextInput
                        style={styles.input}
                        value={shippingInfo.country}
                        onChangeText={(text) => handleShippingInfoChange('country', text)}
                        placeholder="Country"
                    />
                </View>
            </View>

            <View style={styles.saveInfo}>
                <Switch
                    value={saveShippingInfo}
                    onValueChange={setSaveShippingInfo}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={saveShippingInfo ? '#FF6B6B' : '#f4f3f4'}
                />
                <Text style={styles.saveInfoText}>Save shipping information for future orders</Text>
            </View>

            <Text style={styles.sectionTitle}>Shipping Method</Text>
            <View style={styles.shippingOptions}>
                {shippingOptions.map(option => {
                    const isAvailable = !option.minOrder || calculateTotals().subtotal >= option.minOrder;
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.shippingOption,
                                selectedShipping === option.id && styles.selectedShippingOption,
                                !isAvailable && styles.shippingOptionDisabled
                            ]}
                            onPress={() => isAvailable && setSelectedShipping(option.id)}
                            disabled={!isAvailable}
                        >
                            <View style={styles.radioContainer}>
                                <View style={[
                                    styles.radio,
                                    selectedShipping === option.id && styles.radioSelected
                                ]}>
                                    {selectedShipping === option.id && <View style={styles.radioInner} />}
                                </View>
                            </View>
                            <View style={styles.shippingInfo}>
                                <Text style={styles.shippingName}>{option.name}</Text>
                                <Text style={styles.shippingDays}>{option.days}</Text>
                                {option.minOrder && (
                                    <Text style={styles.minOrderText}>
                                        Min. order: ${option.minOrder}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.shippingPrice}>
                                {option.price === 0 ? 'FREE' : `৳${option.price}`}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderPaymentStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity
                style={[
                    styles.paymentMethod,
                    paymentInfo.paymentMethod === 'card' && styles.selectedPaymentMethod
                ]}
                onPress={() => handlePaymentInfoChange('paymentMethod', 'card')}
            >
                <View style={styles.radioContainer}>
                    <View style={[
                        styles.radio,
                        paymentInfo.paymentMethod === 'card' && styles.radioSelected
                    ]}>
                        {paymentInfo.paymentMethod === 'card' && <View style={styles.radioInner} />}
                    </View>
                </View>
                <Ionicons name="card" size={24} color="#666" />
                <Text style={styles.paymentMethodName}>Credit/Debit Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.paymentMethod,
                    paymentInfo.paymentMethod === 'cash' && styles.selectedPaymentMethod
                ]}
                onPress={() => handlePaymentInfoChange('paymentMethod', 'cash')}
            >
                <View style={styles.radioContainer}>
                    <View style={[
                        styles.radio,
                        paymentInfo.paymentMethod === 'cash' && styles.radioSelected
                    ]}>
                        {paymentInfo.paymentMethod === 'cash' && <View style={styles.radioInner} />}
                    </View>
                </View>
                <Ionicons name="cash" size={24} color="#666" />
                <Text style={styles.paymentMethodName}>Cash on Delivery</Text>
            </TouchableOpacity>

            {paymentInfo.paymentMethod === 'card' && (
                <View style={styles.cardForm}>
                    <Text style={styles.sectionTitle}>Card Details</Text>
                    
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Name on Card *</Text>
                        <TextInput
                            style={styles.input}
                            value={paymentInfo.nameOnCard}
                            onChangeText={(text) => handlePaymentInfoChange('nameOnCard', text)}
                            placeholder="Enter name as on card"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Card Number *</Text>
                        <TextInput
                            style={styles.input}
                            value={paymentInfo.cardNumber}
                            onChangeText={(text) => handlePaymentInfoChange('cardNumber', formatCardNumber(text))}
                            placeholder="1234 5678 9012 3456"
                            keyboardType="number-pad"
                            maxLength={19}
                        />
                    </View>

                    <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Expiry Date *</Text>
                            <TextInput
                                style={styles.input}
                                value={paymentInfo.expiryDate}
                                onChangeText={(text) => handlePaymentInfoChange('expiryDate', formatExpiryDate(text))}
                                placeholder="MM/YY"
                                keyboardType="number-pad"
                                maxLength={5}
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                            <Text style={styles.label}>CVV *</Text>
                            <TextInput
                                style={styles.input}
                                value={paymentInfo.cvv}
                                onChangeText={(text) => handlePaymentInfoChange('cvv', text.replace(/\D/g, ''))}
                                placeholder="123"
                                keyboardType="number-pad"
                                maxLength={3}
                                secureTextEntry
                            />
                        </View>
                    </View>
                </View>
            )}

            <Text style={styles.sectionTitle}>Billing Address</Text>
            <View style={styles.sameAsShipping}>
                <Switch
                    value={sameAsShipping}
                    onValueChange={setSameAsShipping}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={sameAsShipping ? '#FF6B6B' : '#f4f3f4'}
                />
                <Text style={styles.saveInfoText}>Same as shipping address</Text>
            </View>

            {!sameAsShipping && (
                <View style={styles.billingForm}>
                    <View style={styles.formRow}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>First Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={billingInfo.firstName}
                                onChangeText={(text) => handleBillingInfoChange('firstName', text)}
                                placeholder="Enter first name"
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Last Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={billingInfo.lastName}
                                onChangeText={(text) => handleBillingInfoChange('lastName', text)}
                                placeholder="Enter last name"
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Address Line 1 *</Text>
                        <TextInput
                            style={styles.input}
                            value={billingInfo.addressLine1}
                            onChangeText={(text) => handleBillingInfoChange('addressLine1', text)}
                            placeholder="Enter street address"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Address Line 2</Text>
                        <TextInput
                            style={styles.input}
                            value={billingInfo.addressLine2}
                            onChangeText={(text) => handleBillingInfoChange('addressLine2', text)}
                            placeholder="Apartment, suite, etc. (optional)"
                        />
                    </View>

                    <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 2 }]}>
                            <Text style={styles.label}>City *</Text>
                            <TextInput
                                style={styles.input}
                                value={billingInfo.city}
                                onChangeText={(text) => handleBillingInfoChange('city', text)}
                                placeholder="Enter city"
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                            <Text style={styles.label}>State *</Text>
                            <TextInput
                                style={styles.input}
                                value={billingInfo.state}
                                onChangeText={(text) => handleBillingInfoChange('state', text)}
                                placeholder="State"
                            />
                        </View>
                    </View>

                    <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Postal Code *</Text>
                            <TextInput
                                style={styles.input}
                                value={billingInfo.postalCode}
                                onChangeText={(text) => handleBillingInfoChange('postalCode', text)}
                                placeholder="Postal code"
                                keyboardType="number-pad"
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 2, marginLeft: 10 }]}>
                            <Text style={styles.label}>Country</Text>
                            <TextInput
                                style={styles.input}
                                value={billingInfo.country}
                                onChangeText={(text) => handleBillingInfoChange('country', text)}
                                placeholder="Country"
                            />
                        </View>
                    </View>
                </View>
            )}
        </View>
    );

    const renderReviewStep = () => {
        const totals = calculateTotals();

        return (
            <View style={styles.stepContent}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                
                <View style={styles.orderItems}>
                    {cartItems.map(item => {
                        const price = item.product?.discount > 0 
                            ? item.product.price * (1 - item.product.discount / 100)
                            : item.product?.price || 0;
                        const total = price * item.quantity;

                        return (
                            <View key={item._id} style={styles.orderItem}>
                                <Image 
                                    source={{ uri: item.product?.image ? `${API_BASE_URL}/${item.product.image}` : 'https://via.placeholder.com/300' }} 
                                    style={styles.orderItemImage} 
                                />
                                <View style={styles.orderItemDetails}>
                                    <Text style={styles.orderItemName}>{item.product?.name || 'Product'}</Text>
                                    <Text style={styles.orderItemPrice}>৳{price.toFixed(2)} × {item.quantity}</Text>
                                </View>
                                <Text style={styles.orderItemTotal}>৳{total.toFixed(2)}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>৳{totals.subtotal}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>
                            {totals.shipping === '0.00' ? 'FREE' : `৳${totals.shipping}`}
                        </Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax</Text>
                        <Text style={styles.summaryValue}>৳{totals.tax}</Text>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>৳{totals.total}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Shipping Information</Text>
                <View style={styles.infoCard}>
                    <Text style={styles.infoName}>{shippingInfo.firstName} {shippingInfo.lastName}</Text>
                    <Text style={styles.infoText}>{shippingInfo.addressLine1}</Text>
                    {shippingInfo.addressLine2 && (
                        <Text style={styles.infoText}>{shippingInfo.addressLine2}</Text>
                    )}
                    <Text style={styles.infoText}>
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                    </Text>
                    <Text style={styles.infoText}>{shippingInfo.country}</Text>
                    <Text style={styles.infoText}>{shippingInfo.phone}</Text>
                    <Text style={styles.infoText}>{shippingInfo.email}</Text>
                </View>

                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.infoCard}>
                    <Text style={styles.infoName}>
                        {paymentInfo.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                    </Text>
                    {paymentInfo.paymentMethod === 'card' && paymentInfo.cardNumber && (
                        <Text style={styles.infoText}>
                            Card ending in {paymentInfo.cardNumber.slice(-4)}
                        </Text>
                    )}
                </View>

                <View style={styles.agreement}>
                    <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                    <Text style={styles.agreementText}>
                        By placing your order, you agree to our Terms of Service and Privacy Policy.
                        Your payment is secure and encrypted.
                    </Text>
                </View>
            </View>
        );
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return renderShippingStep();
            case 2:
                return renderPaymentStep();
            case 3:
                return renderReviewStep();
            default:
                return renderShippingStep();
        }
    };

    const totals = calculateTotals();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>Loading checkout...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Checkout</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* Step Content */}
                {renderStepContent()}

                {/* Order Summary Sidebar */}
                <View style={styles.orderSummary}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>
                    
                    <View style={styles.summaryItems}>
                        {cartItems.map(item => {
                            const price = item.product?.discount > 0 
                                ? item.product.price * (1 - item.product.discount / 100)
                                : item.product?.price || 0;

                            return (
                                <View key={item._id} style={styles.summaryItem}>
                                    <Image 
                                        source={{ uri: item.product?.image ? `${API_BASE_URL}/${item.product.image}` : 'https://via.placeholder.com/300' }} 
                                        style={styles.summaryImage} 
                                    />
                                    <View style={styles.summaryItemDetails}>
                                        <Text style={styles.summaryItemName} numberOfLines={1}>
                                            {item.product?.name || 'Product'}
                                        </Text>
                                        <Text style={styles.summaryItemPrice}>
                                            ৳{price.toFixed(2)} × {item.quantity}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.summaryTotals}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>৳{totals.subtotal}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={styles.summaryValue}>
                                {totals.shipping === '0.00' ? 'FREE' : `৳${totals.shipping}`}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>৳{totals.tax}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>৳{totals.total}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Navigation */}
            <View style={styles.footer}>
                <View style={styles.footerContent}>
                    {activeStep > 1 && (
                        <TouchableOpacity style={styles.backButton} onPress={goToPreviousStep}>
                            <Ionicons name="arrow-back" size={20} color="#333" />
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                    )}
                    
                    <View style={styles.footerRight}>
                        <View style={styles.footerTotal}>
                            <Text style={styles.footerTotalLabel}>Total</Text>
                            <Text style={styles.footerTotalValue}>৳{totals.total}</Text>
                        </View>
                        
                        <TouchableOpacity
                            style={[styles.continueButton, processing && styles.continueButtonDisabled]}
                            onPress={activeStep === 3 ? placeOrder : goToNextStep}
                            disabled={processing || cartItems.length === 0}
                        >
                            {processing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.continueButtonText}>
                                        {activeStep === 3 ? 'Place Order' : 'Continue'}
                                    </Text>
                                    <Ionicons 
                                        name={activeStep === 3 ? "lock-closed" : "arrow-forward"} 
                                        size={20} 
                                        color="#fff" 
                                    />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

// ... (keep all the existing styles, they remain the same)

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
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    // Step Indicator
    stepIndicator: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    step: {
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    activeStep: {
        backgroundColor: '#FF6B6B',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeStepText: {
        color: '#fff',
    },
    stepLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    activeStepLabel: {
        color: '#FF6B6B',
        fontWeight: '600',
    },
    // Step Content
    stepContent: {
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
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    // Form Styles
    formRow: {
        flexDirection: 'row',
        marginHorizontal: -5,
    },
    formGroup: {
        flex: 1,
        marginHorizontal: 5,
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    saveInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    saveInfoText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#666',
    },
    sameAsShipping: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    // Addresses Section
    addressesSection: {
        marginBottom: 20,
    },
    addressOption: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 10,
    },
    selectedAddress: {
        borderColor: '#FF6B6B',
        backgroundColor: '#fff5f5',
    },
    addressInfo: {
        flex: 1,
        marginLeft: 12,
    },
    addressName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    defaultBadge: {
        fontSize: 12,
        color: '#FF6B6B',
        fontWeight: '500',
        marginTop: 4,
    },
    // Shipping Options
    shippingOptions: {
        marginTop: 10,
    },
    shippingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 10,
    },
    selectedShippingOption: {
        borderColor: '#FF6B6B',
        backgroundColor: '#fff5f5',
    },
    shippingOptionDisabled: {
        opacity: 0.5,
    },
    radioContainer: {
        marginRight: 12,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: '#FF6B6B',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF6B6B',
    },
    shippingInfo: {
        flex: 1,
    },
    shippingName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    shippingDays: {
        fontSize: 12,
        color: '#666',
    },
    minOrderText: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    shippingPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    // Payment Methods
    paymentMethods: {
        marginBottom: 20,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 10,
    },
    selectedPaymentMethod: {
        borderColor: '#FF6B6B',
        backgroundColor: '#fff5f5',
    },
    paymentMethodName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 12,
    },
    cardForm: {
        marginTop: 20,
    },
    // Review Step
    orderItems: {
        marginBottom: 20,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    orderItemDetails: {
        flex: 1,
    },
    orderItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    orderItemPrice: {
        fontSize: 12,
        color: '#666',
    },
    orderItemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    infoCard: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    infoName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    agreement: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 15,
        backgroundColor: '#f0f9f0',
        borderRadius: 8,
        marginTop: 20,
    },
    agreementText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    // Order Summary
    orderSummary: {
        backgroundColor: '#fff',
        marginTop: 10,
        padding: 20,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    summaryItems: {
        marginBottom: 15,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryImage: {
        width: 40,
        height: 40,
        borderRadius: 6,
        marginRight: 10,
    },
    summaryItemDetails: {
        flex: 1,
    },
    summaryItemName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    summaryItemPrice: {
        fontSize: 11,
        color: '#666',
    },
    summaryTotals: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 10,
    },
    // Footer
    footer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    backButtonText: {
        marginLeft: 5,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerTotal: {
        marginRight: 15,
    },
    footerTotalLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    footerTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    continueButton: {
        backgroundColor: '#FF6B6B',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    continueButtonDisabled: {
        backgroundColor: '#ccc',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
});

export default CheckoutScreen;