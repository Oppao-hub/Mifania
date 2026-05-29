import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from './Button';
import { CartItem, Color, Product, Size } from '../utils/types';
import { ASSET_URL } from '../app/api/client';
import {
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  getColorHex,
  getProductStock,
  normalizeProductColor,
  normalizeProductSize,
} from '../utils/productVariants';

export interface EditCartItemPayload {
  cartItemId: string | number;
  quantity: number;
  size: Size;
  color: Color;
}

interface EditVariantModalProps {
  isVisible: boolean;
  item: CartItem | null;
  onClose: () => void;
  onConfirm: (payload: EditCartItemPayload) => void;
}

const EditVariantModal: React.FC<EditVariantModalProps> = ({
  isVisible,
  item,
  onClose,
  onConfirm,
}) => {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<Size>(Size.LARGE);
  const [color, setColor] = useState<Color>(Color.BLACK);

  const product: Product | null =
    item && typeof item.product === 'object' ? item.product : null;

  useEffect(() => {
    if (!item || !product) return;
    setQty(item.quantity);
    setSize(normalizeProductSize(product.size) ?? Size.LARGE);
    setColor(normalizeProductColor(product.color) ?? Color.BLACK);
  }, [item, product, isVisible]);

  if (!item || !product) return null;

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const separator = url.startsWith('/') ? '' : '/';
    return `${ASSET_URL}${separator}${url}`;
  };

  const imageSource = product.imageUrl
    ? { uri: getImageUrl(product.imageUrl) }
    : product.image
      ? { uri: getImageUrl(product.image) }
      : require('../assets/logos/logo.png');

  const stock = getProductStock(product);
  const stockLabel =
    stock <= 0 ? 'Out of stock' : stock <= 5 ? `Low stock (${stock})` : `In stock (${stock})`;

  const handleConfirm = () => {
    if (item.id === undefined) return;
    onConfirm({
      cartItemId: item.id,
      quantity: qty,
      size,
      color,
    });
  };

  const currentSize = normalizeProductSize(product.size);
  const currentColor = normalizeProductColor(product.color);
  const variantChanged = size !== currentSize || color !== currentColor;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-[32px] p-6 pb-10 shadow-2xl max-h-[90%]">
          <View className="items-center mb-6">
            <View className="w-12 h-1 bg-gray-200 rounded-full mb-4" />
            <Text className="text-lg font-montserrat-bold text-gray-900">Edit Cart Item</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center mb-8 border-b border-gray-100 pb-6">
              <Image source={imageSource} className="w-20 h-28 rounded-2xl bg-gray-100 mr-4" />
              <View className="flex-1 justify-between h-28 py-1">
                <View>
                  <Text
                    className="text-base font-montserrat-bold text-gray-900 mb-1"
                    numberOfLines={1}
                  >
                    {product.name}
                  </Text>
                  <Text className="text-xs text-gray-500 font-montserrat-medium mb-1">
                    {stockLabel}
                  </Text>
                  <Text className="text-sm font-montserrat-bold text-brand">
                    ₱{parseFloat(item.price).toFixed(2)}
                  </Text>
                </View>

                <View className="flex-row items-center bg-gray-50 rounded-full self-start px-3 py-1.5 mt-2">
                  <TouchableOpacity
                    onPress={() => setQty(Math.max(1, qty - 1))}
                    className="px-2"
                    disabled={qty <= 1}
                  >
                    <Icon name="minus" size={16} color={qty <= 1 ? '#D1D5DB' : '#111827'} />
                  </TouchableOpacity>
                  <Text className="font-montserrat-bold text-gray-900 px-4">{qty}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (stock > 0) {
                        setQty(Math.min(stock, qty + 1));
                      } else {
                        setQty(qty + 1);
                      }
                    }}
                    className="px-2"
                    disabled={stock > 0 && qty >= stock}
                  >
                    <Icon
                      name="plus"
                      size={16}
                      color={stock > 0 && qty >= stock ? '#D1D5DB' : '#111827'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-montserrat-bold text-gray-900 mb-3">Size</Text>
              <View className="flex-row flex-wrap gap-3">
                {SIZE_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s.value}
                    onPress={() => setSize(s.value)}
                    className={`w-12 h-12 rounded-full items-center justify-center border ${
                      size === s.value ? 'bg-brand border-brand' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-montserrat-bold text-sm ${
                        size === s.value ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-montserrat-bold text-gray-900 mb-3">Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {COLOR_OPTIONS.map((c) => (
                  <View key={c.value} className="items-center mr-4">
                    <TouchableOpacity
                      onPress={() => setColor(c.value)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-12 h-12 rounded-full items-center justify-center mb-1 ${
                        c.hex === '#FFFFFF' ? 'border border-gray-200' : ''
                      }`}
                    >
                      {color === c.value && (
                        <Icon
                          name="check"
                          size={24}
                          color={c.hex === '#FFFFFF' ? '#111827' : '#FFFFFF'}
                        />
                      )}
                    </TouchableOpacity>
                    <Text className="text-[10px] text-gray-500 font-montserrat-medium">
                      {c.label}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {variantChanged && (
              <Text className="text-xs text-amber-700 font-montserrat-medium mb-4">
                Changing size or color will swap this item for another product variant when
                available in the catalog.
              </Text>
            )}
          </ScrollView>

          <View className="flex-row mt-4 gap-x-3">
            <Button
              label="Cancel"
              onPress={onClose}
              variant="soft"
              size="md"
              shape="pill"
              fullWidth
              className="flex-1"
            />
            <Button
              label="Confirm"
              onPress={handleConfirm}
              disabled={stock <= 0}
              size="md"
              shape="pill"
              fullWidth
              className={`flex-1 ${stock <= 0 ? 'bg-gray-300' : ''}`}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditVariantModal;
