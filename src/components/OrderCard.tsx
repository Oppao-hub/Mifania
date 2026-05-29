import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from './Button';
import { Order, OrderStatus } from '../utils/types';
import { ASSET_URL } from '../app/api/client';
import { mergeSurfaceCardStyle } from '../utils/cardStyles';
import {
  formatOrderListDate,
  getOtherProductsLabel,
  normalizeOrderStatus,
} from '../utils/orderPresentation';
import type { MenuAnchor } from './AnchorActionMenu';

interface OrderCardProps {
  item: Order;
  onPress: (order: Order) => void;
  onActionPress?: (order: Order) => void;
  onMenuPress?: (order: Order, anchor: MenuAnchor) => void;
  hideActionButton?: boolean;
  showMenu?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  item,
  onPress,
  onActionPress,
  onMenuPress,
  hideActionButton = false,
  showMenu = false,
}) => {
  const menuButtonRef = useRef<View>(null);

  const mainItem = item.orderItems?.[0];
  const mainItemObj = typeof mainItem === 'object' ? mainItem : null;
  const product =
    typeof mainItemObj?.product === 'object' && mainItemObj.product !== null
      ? mainItemObj.product
      : null;

  const itemCount = item.orderItems?.length ?? 0;
  const otherProductsLabel = getOtherProductsLabel(itemCount);

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const separator = url.startsWith('/') ? '' : '/';
    return `${ASSET_URL}${separator}${url}`;
  };

  const imageSource = product?.imageUrl
    ? { uri: getImageUrl(product.imageUrl) ?? undefined }
    : product?.image
      ? { uri: getImageUrl(product.image) ?? undefined }
      : require('../assets/logos/logo.png');

  const getActionText = (status: OrderStatus | string) => {
    const normalized = normalizeOrderStatus(String(status));
    if (normalized === 'cancelled') return 'Reorder';
    if (normalized === 'delivered') return 'Leave Review';
    return 'Track Order';
  };

  const displayPrice = () => {
    try {
      const val = parseFloat(item.totalAmount);
      return isNaN(val) ? '0.00' : val.toFixed(2);
    } catch {
      return '0.00';
    }
  };

  const openMenu = () => {
    if (!onMenuPress || !menuButtonRef.current) return;

    menuButtonRef.current.measureInWindow((x, y, width, height) => {
      onMenuPress(item, { x, y, width, height });
    });
  };

  return (
    <View
      className="bg-surface rounded-card p-4 mb-5 border border-border-color"
      style={mergeSurfaceCardStyle()}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center flex-1 pr-2">
          <Icon name="bag-handle-outline" size={18} color="#52622E" />
          <Text className="font-montserrat-bold text-dark-gray text-sm ml-2" numberOfLines={1}>
            {formatOrderListDate(item.createdAt)}
          </Text>
        </View>

        {showMenu ? (
          <View ref={menuButtonRef} collapsable={false}>
            <TouchableOpacity
              onPress={openMenu}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1"
            >
              <Icon name="ellipsis-vertical" size={18} color="#6A7282" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(item)} className="flex-row mb-4">
        <View className="w-[88px] h-[104px] rounded-2xl bg-light-gray overflow-hidden mr-4">
          <Image source={imageSource} className="w-full h-full" resizeMode="cover" />
        </View>

        <View className="flex-1 justify-center">
          <Text className="font-montserrat-bold text-dark-gray text-sm mb-1" numberOfLines={2}>
            {product?.name || 'Product'}
          </Text>
          {otherProductsLabel ? (
            <Text className="text-xs text-gray font-montserrat mb-3">{otherProductsLabel}</Text>
          ) : (
            <View className="mb-3" />
          )}

          <Text className="text-[11px] text-gray font-montserrat mb-0.5">Total Shopping</Text>
          <Text className="font-montserrat-bold text-brand text-lg">₱{displayPrice()}</Text>
        </View>
      </TouchableOpacity>

      {!hideActionButton ? (
        <Button
          label={getActionText(item.orderStatus)}
          onPress={() => onActionPress?.(item)}
          variant="outline"
          size="sm"
          shape="pill"
        />
      ) : null}
    </View>
  );
};

export default OrderCard;
