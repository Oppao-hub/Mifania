import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../utils/types';
import { 
    getCart,
    removeFromCart, 
    toggleCartItemSelection, 
    updateCartQty 
} from '../app/reducers/cart';
import CartItemComponent from '../components/CartItem';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items: cartItems, isLoading, totalPrice, totalQuantity } = useSelector((state: RootState) => state.cart);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const toggleSelection = (id: string | number) => {
    dispatch(toggleCartItemSelection(id));
  };

  const removeItem = (id: string | number) => {
    dispatch(removeFromCart(id));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const updateQty = (id: string | number, qty: number) => {
    dispatch(updateCartQty(id, qty));
  };

  const selectedCount = cartItems.filter(item => item.selected).length;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="Cart"/>

      {isLoading && cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#52622E" />
        </View>
      ) : cartItems.length > 0 ? (
        <ScrollView 
            className="flex-1 px-6 pt-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
        >
            {cartItems.map((item) => (
            <CartItemComponent 
                key={item.id}
                item={item}
                onToggleSelection={toggleSelection}
                onRemove={removeItem}
                onUpdateQty={updateQty}
                onEdit={(item) => console.log('Edit item:', item.id)}
            />
            ))}
        </ScrollView>
      ) : (
        <EmptyState 
            iconName="cart-outline"
            title="Your cart is empty"
            description="Looks like you haven't added anything to your cart yet."
            buttonText="Start Shopping"
            onButtonPress={() => navigation.navigate('Home' as never)}
        />
      )}

      {/* CHECKOUT SECTION */}
      {cartItems.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-6 border-t border-border-color rounded-t-[40px] shadow-2xl">
            <View className="flex-row items-center justify-between mb-4">
                <View>
                    <Text className="text-gray text-xs font-medium">Selected Items ({selectedCount})</Text>
                    <Text className="text-2xl font-bold text-dark-gray">${parseFloat(totalPrice).toFixed(2)}</Text>
                </View>
                <TouchableOpacity 
                    className="bg-brand px-10 py-4 rounded-full"
                    onPress={() => console.log('Checkout clicked')}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text className="text-white font-bold text-base">Checkout</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
      )}

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <View className="absolute bottom-32 self-center bg-brand px-6 py-3 rounded-full flex-row items-center shadow-lg">
          <Icon name="check-circle" size={20} color="#FFFFFF"/>
          <Text className="text-white font-bold text-sm ml-2 tracking-wide">
            Removed from Cart!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;
