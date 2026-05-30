import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../Button';
import { Color, Size } from '../../utils/types';
import {
  COLOR_OPTIONS,
  SIZE_OPTIONS,
} from '../../utils/productVariants';

interface ProductVariantSheetProps {
  visible: boolean;
  onClose: () => void;
  productName: string;
  imageUri?: string | null;
  priceLabel: string;
  stock: number;
  selectedSize: Size;
  selectedColor: Color;
  quantity: number;
  onSizeChange: (size: Size) => void;
  onColorChange: (color: Color) => void;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isOutOfStock: boolean;
  isAddingToCart?: boolean;
  isBuyingNow?: boolean;
}

const ProductVariantSheet: React.FC<ProductVariantSheetProps> = ({
  visible,
  onClose,
  productName,
  imageUri,
  priceLabel,
  stock,
  selectedSize,
  selectedColor,
  quantity,
  onSizeChange,
  onColorChange,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  isOutOfStock,
  isAddingToCart,
  isBuyingNow,
}) => {
  const insets = useSafeAreaInsets();
  const colorMeta = COLOR_OPTIONS.find((c) => c.value === selectedColor);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />

        <View
          className="bg-surface rounded-t-3xl max-h-[85%]"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-border-color" />
          </View>
          <Text className="text-center text-lg font-montserrat-bold text-dark-gray py-2">
            Choose Product Variant
          </Text>

          <View className="flex-row items-center px-5 py-3 border-y border-border-color">
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="w-16 h-16 rounded-xl bg-light-gray" />
            ) : (
              <View className="w-16 h-16 rounded-xl bg-light-gray" />
            )}
            <View className="flex-1 ml-3">
              <Text className="text-sm font-montserrat-bold text-dark-gray" numberOfLines={2}>
                {productName}
              </Text>
              <Text className="text-xs font-montserrat text-gray mt-1">Stock {stock}</Text>
              <Text className="text-base font-montserrat-bold text-brand mt-0.5">{priceLabel}</Text>
            </View>
          </View>

          <View className="px-5 py-4">
            <Text className="text-sm font-montserrat-bold text-dark-gray mb-2">Quantity</Text>
            <View className="flex-row items-center self-start bg-light-gray rounded-full px-1">
              <TouchableOpacity
                onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-10 h-10 items-center justify-center"
              >
                <Icon name="remove" size={20} color="#4B5563" />
              </TouchableOpacity>
              <Text className="w-10 text-center font-montserrat-bold text-dark-gray">{quantity}</Text>
              <TouchableOpacity
                onPress={() => onQuantityChange(Math.min(stock || 99, quantity + 1))}
                className="w-10 h-10 items-center justify-center"
              >
                <Icon name="add" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-montserrat-bold text-dark-gray mt-5 mb-3">Size</Text>
            <View className="flex-row flex-wrap gap-2">
              {SIZE_OPTIONS.filter((s) => s.value !== Size.NA).map((size) => (
                <TouchableOpacity
                  key={size.value}
                  onPress={() => onSizeChange(size.value)}
                  className={`w-11 h-11 rounded-full border items-center justify-center ${
                    selectedSize === size.value ? 'bg-brand border-brand' : 'border-border-color bg-surface'
                  }`}
                >
                  <Text
                    className={`text-sm font-montserrat-bold ${
                      selectedSize === size.value ? 'text-white' : 'text-dark-gray'
                    }`}
                  >
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-montserrat-bold text-dark-gray mt-5 mb-3">Color</Text>
            <View className="flex-row flex-wrap gap-4">
              {COLOR_OPTIONS.map((color) => {
                const selected = selectedColor === color.value;
                return (
                  <TouchableOpacity
                    key={color.value}
                    onPress={() => onColorChange(color.value)}
                    className="items-center"
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                        selected ? 'border-brand' : 'border-transparent'
                      }`}
                    >
                      <View
                        style={{ backgroundColor: color.hex }}
                        className={`w-8 h-8 rounded-full ${
                          color.hex === '#FFFFFF' ? 'border border-border-color' : ''
                        }`}
                      />
                      {selected ? (
                        <View className="absolute">
                          <Icon name="checkmark" size={16} color="#52622E" />
                        </View>
                      ) : null}
                    </View>
                    <Text className="text-[10px] font-montserrat text-gray mt-1">{color.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {colorMeta ? (
              <Text className="text-xs font-montserrat text-brand mt-2">Selected: {colorMeta.label}</Text>
            ) : null}
          </View>

          <View className="gap-3 px-5 pt-3 border-t border-border-color">
            <Button
              label={isOutOfStock ? 'Unavailable' : 'Add to Cart'}
              size="md"
              shape="pill"
              disabled={isOutOfStock}
              onPress={onAddToCart}
              isLoading={isAddingToCart}
            />
            <Button
              label={isOutOfStock ? 'Unavailable' : 'Buy Now'}
              variant="soft"
              size="md"
              shape="pill"
              disabled={isOutOfStock}
              onPress={onBuyNow}
              isLoading={isBuyingNow}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProductVariantSheet;
