import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
import Button from '../components/Button';
import StickyBottomBar from '../components/StickyBottomBar';
import * as Types from '../app/actions';
import { ROUTES } from '../utils';
import { hasDeliverableAddress } from '../utils/address';
import { useTabBarBottomPadding } from '../utils/layout';
import { showBlockingInfo } from '../utils/userFeedback';

const getCartItemName = (item: CartItem): string => {
  if (typeof item.product === 'string') {
    return item.productName || '';
  }
  return item.product.name || item.productName || '';
};

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const tabBarBottomPadding = useTabBarBottomPadding();
  const scrollBottomPadding = tabBarBottomPadding + 80;
  const { items: cartItems, isLoading, error: cartError } = useSelector((state: RootState) => state.cart);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { data: customerFromSlice, isLoading: isCustomerLoading } = useSelector((state: RootState) => state.customer);
  const savedAddresses = useSelector((state: RootState) => state.address.items);
  const token = authData?.token;
  
  const customerRef = getCustomerRefFromUser(authData?.user);
  const customerData: Customer | null = customerFromSlice || getEmbeddedCustomer(authData?.user?.customer);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      dispatch(getCart());
      dispatch(getProducts());
      if (token) {
        dispatch({ type: Types.GET_ADDRESSES });
      }
    }, [dispatch, token]),
  );

  useEffect(() => {
    if (!customerFromSlice && customerRef && token) {
      dispatch({
        type: Types.GET_CUSTOMER,
        payload: { id: customerRef, token },
      });
      dispatch({
        type: Types.GET_WALLET,
        payload: { id: customerRef, token },
      });
    }
  }, [dispatch, customerRef, token, customerFromSlice]);

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

  const displayedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return cartItems;
    return cartItems.filter((item) =>
      getCartItemName(item).toLowerCase().includes(query),
    );
  }, [cartItems, searchQuery]);

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
    const canDeliver = hasDeliverableAddress(
      savedAddresses,
      customerData?.address,
      customerData?.contactNumber,
    );
    if (!canDeliver) {
      setAlertConfig({
        visible: true,
        type: 'warning',
        message: 'Please add a delivery address and contact number in Manage Addresses before placing an order.',
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
      <Header
        title="Cart"
        leftVariant="logo"
        hideNotificationBell
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        rightActions={[
          {
            icon: showSearch ? 'close-outline' : 'search-outline',
            onPress: () => {
              setShowSearch((prev) => {
                if (prev) setSearchQuery('');
                return !prev;
              });
            },
          },
          {
            icon: 'ellipsis-vertical',
            onPress: () =>
              showBlockingInfo({
                title: 'Cart Options',
                message: 'More cart actions will be available soon.',
              }),
          },
        ]}
      />

      {isLoading && cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#52622E" />
        </View>
      ) : cartItems.length > 0 ? (
        displayedItems.length > 0 ? (
        <ScrollView 
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        >
            {displayedItems.map((item) => (
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
        <View className="flex-1 px-4">
          <EmptyState
            iconName="cart-outline"
            title="No matches found"
            description="Try a different search term or clear your search."
          />
        </View>
        )
      ) : (
        <View className="flex-1 px-4">
          <EmptyState 
              iconName="cart-outline"
              title="Your cart is empty"
              description="Looks like you haven't added anything to your cart yet."
              buttonText="Start Shopping"
              onButtonPress={() => navigation.navigate('HomeTab' as never)}
          />
        </View>
      )}

      {/* FLOATING CHECKOUT BUTTON */}
      {selectedCount > 0 && (
        <StickyBottomBar variant="floating" className="bg-transparent">
          <Button
            label={`Checkout (${selectedCount}) • ₱${displayTotal}`}
            onPress={handleCheckout}
            size="lg"
            shape="pill"
            className="shadow-2xl shadow-brand/40 rounded-3xl"
            textClassName="text-[16px] tracking-wider"
          />
        </StickyBottomBar>
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
