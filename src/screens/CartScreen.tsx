import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState, CartItem, Customer } from '../utils/types';
import { 
    getCart,
    removeFromCart, 
    toggleCartItemSelection, 
    updateCartQty
} from '../app/reducers/cart';
import CartItemComponent from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import AlertMsg from '../components/AlertMsg/AlertMsg';
import Header from '../components/Header';
import EditVariantModal from '../components/EditVariantModal';
import * as Types from '../app/actions';
import { PaymentMethods, PaymentMethodType } from '../constants/Payment';

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items: cartItems, isLoading } = useSelector((state: RootState) => state.cart);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { data: customerFromSlice, isLoading: isCustomerLoading } = useSelector((state: RootState) => state.customer);
  const { isLoading: isOrdering, isError: isOrderError, error: orderError } = useSelector((state: RootState) => state.order);
  
  const token = authData?.token;
  
  // 💡 Fallback to nested customer data in user object if slice is empty
  const customerData: Customer | null = customerFromSlice || (typeof authData?.user?.customer === 'object' ? authData.user.customer : null);

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  
  // Payment State - now using exact strings as required by backend (e.g. "Cash")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(PaymentMethods.CASH);
  
  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>({
    visible: false,
    type: 'info',
    message: '',
  });

  useEffect(() => {
    dispatch(getCart());
    
    // 💡 Fetch customer data if missing but logged in
    if (!customerData && authData?.user?.customer && authData?.token) {
      dispatch({ 
        type: Types.GET_CUSTOMER, 
        payload: { id: authData.user.customer, token: authData.token } 
      });
      dispatch({
        type: Types.GET_WALLET,
        payload: { id: authData.user.customer, token: authData.token }
      });
    }
  }, [dispatch, authData, customerData]);

  // Handle Order Success/Error from Redux
  useEffect(() => {
    if (isOrderError && orderError) {
      setAlertConfig({
        visible: true,
        type: 'error',
        message: orderError,
      });
    }
  }, [isOrderError, orderError]);

  const toggleSelection = (id: string | number) => {
    dispatch(toggleCartItemSelection(id));
  };

  const removeItem = (id: string | number) => {
    dispatch(removeFromCart(id));
  };

  const openEditModal = (item: CartItem) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleEditConfirm = (id: string | number, qty: number) => {
    dispatch(updateCartQty(id, qty));
    setModalVisible(false);
  };

  // Local calculation for selected items
  const { selectedCount, displayTotal } = useMemo(() => {
    const selected = cartItems.filter(item => item.selected);
    const count = selected.reduce((sum, item) => sum + item.quantity, 0);
    const total = selected.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    return {
      selectedCount: count,
      displayTotal: total.toFixed(2)
    };
  }, [cartItems]);

  const handleCheckout = () => {
    if (!token) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        message: 'Please log in to place an order.',
      });
      return;
    }

    if (isCustomerLoading) {
        setAlertConfig({
            visible: true,
            type: 'info',
            message: 'Loading your profile information... Please try again in a moment.',
        });
        return;
    }

    // 💡 Profile Completeness Check (Per Backend Requirements)
    if (!customerData || !customerData?.address || !customerData?.contactNumber) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        message: 'Please complete your profile with an address and contact number in the Profile screen before placing an order.',
      });
      return;
    }

    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) return;

    // Strict JSON body formatting for Symfony backend as per FINAL verified guide
    const orderData = {
        totalAmount: String(displayTotal),      // Numeric string precision
        paymentMethod: paymentMethod,          // Exact case-sensitive Enum
        paymentStatus: "Pending",              // Exact string required
        orderStatus: "Pending",                // Exact string required
        orderItems: selectedItems.map(item => {
            const rawPrice = item.price || '0';
            const price = isNaN(parseFloat(rawPrice)) ? "0.00" : parseFloat(rawPrice).toFixed(2);
            
            const rawQty = String(item.quantity || '1');
            const qty = isNaN(parseInt(rawQty, 10)) ? 1 : parseInt(rawQty, 10);
            
            const subtotal = (parseFloat(price) * qty).toFixed(2);
            
            // Product MUST be an IRI format: "/api/products/ID"
            const productIri = typeof item.product === 'string' 
                ? item.product 
                : (item.product?.['@id'] || `/api/products/${item.product?.id || item.product}`);

            return {
                product: productIri,
                quantity: qty,                 // Integer
                price: String(price),          // Decimal as string
                subtotal: String(subtotal)     // Decimal as string
            };
        }),
    };

    console.log("📤 Verified Checkout Payload:", JSON.stringify(orderData, null, 2));

    dispatch({ 
        type: Types.CREATE_ORDER, 
        payload: { data: orderData, token } 
    });
  };

  useEffect(() => {
    if (alertConfig.visible) {
      if (alertConfig.type === 'error') {
        AlertMsg.customError({ title: 'Checkout Failed', message: alertConfig.message });
      } else if (alertConfig.type === 'warning') {
        AlertMsg.customInfo({ title: 'Notice', message: alertConfig.message });
      } else {
        AlertMsg.customSuccess({ title: 'Success', message: alertConfig.message });
      }
      setAlertConfig({ ...alertConfig, visible: false });
    }
  }, [alertConfig]);

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      {/* HEADER */}
      <Header title="Cart" />

      {isLoading && cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#52622E" />
        </View>
      ) : cartItems.length > 0 ? (
        <ScrollView 
            className="flex-1 px-6 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 220 }}
        >
            {cartItems.map((item) => (
            <CartItemComponent 
                key={item.id}
                item={item}
                onToggleSelection={toggleSelection}
                onRemove={removeItem}
                onUpdateQty={(id, qty) => dispatch(updateCartQty(id, qty))}
                onEdit={openEditModal}
            />
            ))}

            {/* Payment Method Selector */}
            <View className="mt-4 bg-white rounded-3xl p-5 border border-border-color shadow-sm">
              <Text className="text-sm font-montserrat-bold text-dark-gray mb-4">Payment Method</Text>
              
              <View className="flex-row flex-wrap justify-between gap-2">
                {Object.entries(PaymentMethods).map(([key, value]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setPaymentMethod(value as PaymentMethodType)}
                    className={`min-w-[48%] py-3 px-2 rounded-xl border items-center justify-center mb-2 ${paymentMethod === value ? 'bg-brand/5 border-brand' : 'border-gray-100 bg-gray-50'}`}
                  >
                    <Text className={`text-[10px] font-montserrat-bold ${paymentMethod === value ? 'text-brand' : 'text-gray-400'}`}>
                      {value}
                    </Text>
                    {paymentMethod === value && (
                      <View className="absolute -top-1 -right-1 bg-brand rounded-full w-4 h-4 items-center justify-center">
                        <Icon name="checkmark" size={10} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
        </ScrollView>
      ) : (
        <EmptyState 
            iconName="cart-outline"
            title="Your cart is empty"
            description="Looks like you haven't added anything to your cart yet."
            buttonText="Start Shopping"
            onButtonPress={() => navigation.navigate('HomeTab' as never)}
        />
      )}

      {/* FLOATING CHECKOUT BUTTON */}
      {selectedCount > 0 && (
        <View className="absolute bottom-28 left-6 right-6 z-50">
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={handleCheckout}
            disabled={isOrdering}
            className={`w-full ${isOrdering ? 'bg-gray-400' : 'bg-brand'} h-16 rounded-3xl flex-row items-center justify-center shadow-2xl shadow-brand/40`}
          >
            {isOrdering ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white font-montserrat-bold text-[16px] tracking-wider">
                    Checkout ({selectedCount}) • ₱{displayTotal}
                </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <EditVariantModal 
        isVisible={isModalVisible}
        item={editingItem}
        onClose={() => setModalVisible(false)}
        onConfirm={handleEditConfirm}
      />
    </SafeAreaView>
  );
};

export default CartScreen;
