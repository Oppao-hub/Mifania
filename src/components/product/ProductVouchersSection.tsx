import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FEATURED_PRODUCT_VOUCHERS, ProductVoucher } from '../../utils/productDetails';

interface ProductVouchersSectionProps {
  onViewAll: () => void;
  vouchers?: ProductVoucher[];
}

const ProductVouchersSection: React.FC<ProductVouchersSectionProps> = ({
  onViewAll,
  vouchers = FEATURED_PRODUCT_VOUCHERS,
}) => (
  <View className="mt-6 px-4">
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-base font-montserrat-bold text-dark-gray">Vouchers Available</Text>
      <TouchableOpacity onPress={onViewAll}>
        <Text className="text-sm font-montserrat-bold text-brand">View All →</Text>
      </TouchableOpacity>
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {vouchers.map((voucher) => (
        <View
          key={voucher.id}
          className="mr-3 w-52 rounded-xl border border-dashed border-brand/40 bg-brand/5 px-4 py-3"
        >
          <Text className="text-sm font-montserrat-bold text-brand">{voucher.title}</Text>
          <Text className="text-xs font-montserrat-bold text-dark-gray mt-2 tracking-wide">
            {voucher.code}
          </Text>
          <Text className="text-xs font-montserrat text-gray mt-1">
            Min. spend ₱{voucher.minSpend.toLocaleString()}
          </Text>
          <Text className="text-xs font-montserrat text-gray mt-0.5">{voucher.expiresLabel}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

export default ProductVouchersSection;
