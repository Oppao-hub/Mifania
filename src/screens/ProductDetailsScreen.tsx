import React from 'react';
import { View, Text } from 'react-native';

export default function ProductDetailScreen({ route }: any) {
  const { product } = route.params || {};

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{product?.title || 'Product Details'}</Text>
      <Text style={{ marginTop: 10 }}>{product?.description || 'Description'}</Text>
    </View>
  );
}