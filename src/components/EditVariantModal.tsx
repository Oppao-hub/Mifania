import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Image, 
  ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CartItem } from '../utils/types';
import { ASSET_URL } from '../app/api/client';

interface EditVariantModalProps {
  isVisible: boolean;
  item: CartItem | null;
  onClose: () => void;
  onConfirm: (id: string | number, qty: number, size: string, color: string) => void;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const AVAILABLE_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Brown', hex: '#785A46' },
  { name: 'Blue Grey', hex: '#607D8B' },
  { name: 'Indigo', hex: '#3F51B5' },
  { name: 'Deep Purple', hex: '#673AB7' },
];

const EditVariantModal: React.FC<EditVariantModalProps> = ({ 
  isVisible, 
  item, 
  onClose, 
  onConfirm 
}) => {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('L');
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    if (item) {
      setQty(item.quantity);
      // setSize(item.size || 'L'); // Placeholder until backend supports
      // setColor(item.colorHex || '#000000'); // Placeholder until backend supports
    }
  }, [item, isVisible]);

  if (!item || typeof item.product !== 'object') return null;

  const product = item.product;

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

  const handleConfirm = () => {
    if (item.id !== undefined) {
      onConfirm(item.id, qty, size, color);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-[32px] p-6 pb-10 shadow-2xl">
          <View className="items-center mb-6">
            <View className="w-12 h-1 bg-gray-200 rounded-full mb-4" />
            <Text className="text-lg font-montserrat-bold text-gray-900">Edit Product Variant</Text>
          </View>

          <View className="flex-row items-center mb-8 border-b border-gray-100 pb-6">
            <Image 
              source={imageSource} 
              className="w-20 h-28 rounded-2xl bg-gray-100 mr-4"
            />
            <View className="flex-1 justify-between h-28 py-1">
              <View>
                <Text className="text-base font-montserrat-bold text-gray-900 mb-1" numberOfLines={1}>
                  {product.name}
                </Text>
                <Text className="text-xs text-gray-500 font-montserrat-medium mb-1">
                  Stock : Available
                </Text>
                <Text className="text-sm font-montserrat-bold text-brand">
                  ₱{parseFloat(item.price).toFixed(2)}
                </Text>
              </View>
              
              <View className="flex-row items-center bg-gray-50 rounded-full self-start px-3 py-1.5 mt-2">
                <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} className="px-2">
                  <Icon name="minus" size={16} color="#111827" />
                </TouchableOpacity>
                <Text className="font-montserrat-bold text-gray-900 px-4">{qty}</Text>
                <TouchableOpacity onPress={() => setQty(qty + 1)} className="px-2">
                  <Icon name="plus" size={16} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-montserrat-bold text-gray-900 mb-3">Size</Text>
            <View className="flex-row flex-wrap gap-3">
              {AVAILABLE_SIZES.map(s => (
                <TouchableOpacity 
                  key={s}
                  onPress={() => setSize(s)}
                  className={`w-12 h-12 rounded-full items-center justify-center border ${
                    size === s 
                      ? 'bg-brand border-brand' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`font-montserrat-bold text-sm ${size === s ? 'text-white' : 'text-gray-900'}`}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-sm font-montserrat-bold text-gray-900 mb-3">Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {AVAILABLE_COLORS.map(c => (
                <View key={c.name} className="items-center mr-4">
                  <TouchableOpacity 
                    onPress={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-12 h-12 rounded-full items-center justify-center mb-1 ${
                      c.hex === '#FFFFFF' ? 'border border-gray-200' : ''
                    }`}
                  >
                    {color === c.hex && (
                      <Icon name="check" size={24} color={c.hex === '#FFFFFF' ? '#111827' : '#FFFFFF'} />
                    )}
                  </TouchableOpacity>
                  <Text className="text-[10px] text-gray-500 font-montserrat-medium">{c.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View className="flex-row">
            <TouchableOpacity 
              onPress={onClose}
              className="flex-1 bg-brand/10 h-14 rounded-full items-center justify-center mr-2"
            >
              <Text className="font-montserrat-bold text-brand">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleConfirm}
              className="flex-1 bg-brand h-14 rounded-full items-center justify-center ml-2"
            >
              <Text className="font-montserrat-bold text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditVariantModal;
