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
import { RootState, CartItem, Customer } from '../utils/types';
import { getEmbeddedCustomer, getCustomerRefFromUser } from '../utils/apiResource';
import { 
    getCart,
    removeFromCart, 
    toggleCartItemSelection, 
    updateCartQty,
    editCartItem,
} from '../app/reducers/cart';
import { getProducts } from '../app/reducers/product';
import EditVariantModal, { EditCartItemPayload } from '../components/EditVariantModal';
import CartItemComponent from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import AlertMsg from '../components/AlertMsg/AlertMsg';
import Header from '../components/Header';
import * as Types from '../app/actions';
import { ROUTES } from '../utils';

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items: cartItems, isLoading, error: cartError } = useSelector((state: RootState) => state.cart);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { data: customerFromSlice, isLoading: isCustomerLoading } = useSelector((state: RootState) => state.customer);
  const token = authData?.token;
  
  const customerRef = getCustomerRefFromUser(authData?.user);
  const customerData: Customer | null = customerFromSlice || getEmbeddedCustomer(authData?.user?.customer);

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  
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
    dispatch(getProducts());

    if (!customerData && customerRef && authData?.token) {
      dispatch({ 
        type: Types.GET_CUSTOMER, 
        payload: { id: customerRef, token: authData.token } 
      });
      dispatch({
        type: Types.GET_WALLET,
        payload: { id: customerRef, token: authData.token }
      });
    }
  }, [dispatch, authData, customerData, customerRef]);

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

  const handleEditConfirm = (payload: EditCartItemPayload) => {
    dispatch(editCartItem(payload));
    setModalVisible(false);
  };

  useEffect(() => {
    if (cartError) {
      setAlertConfig({
        visible: true,
        type: 'error',
        message: cartError,
      });
    }
  }, [cartError]);

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

    navigation.navigate(ROUTES.CHECKOUT as never);
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
            className="w-full bg-brand h-16 rounded-3xl flex-row items-center justify-center shadow-2xl shadow-brand/40"
          >
            <Text className="text-white font-montserrat-bold text-[16px] tracking-wider">
                Checkout ({selectedCount}) • ₱{displayTotal}
            </Text>
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
