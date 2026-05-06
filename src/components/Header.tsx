import React from 'react';
import { View, TouchableOpacity, Image, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState, Category, SubCategory } from '../utils/types';
import { IMG } from '../utils';
import CategoriesList from './CategoriesList';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  // Home header specific props
  isHome?: boolean;
  categories?: Category[];
  isCategoriesLoading?: boolean;
  activeCategoryId?: number | string | null;
  onCategoryPress?: (category: Category) => void;
  subCategories?: SubCategory[];
  isSubCategoriesLoading?: boolean;
  activeSubCategoryId?: number | string | null;
  onSubCategoryPress?: (subCategory: SubCategory) => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack,
  showSearch = false,
  searchQuery = '',
  setSearchQuery,
  isHome = false,
  categories = [],
  isCategoriesLoading = false,
  activeCategoryId,
  onCategoryPress,
  subCategories = [],
  isSubCategoriesLoading = false,
  activeSubCategoryId,
  onSubCategoryPress,
}) => {
  const navigation = useNavigation();
  
  // Get counts for specific screens
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

  const displayTitle = isHome ? "Mifania" : title;
  const countToDisplay = title === 'Cart' ? cartCount : title === 'Wishlist' ? wishlistCount : null;
  const finalTitle = countToDisplay !== null ? `${displayTitle} (${countToDisplay})` : displayTitle;

  return (
    <View className="bg-app-bg">
      {/* --- Top Row --- */}
      <View className="px-4 py-3 flex-row justify-between items-center relative h-14">
        <View className="z-10 w-10">
          {isHome ? (
            <Image 
              source={IMG.LOGO} 
              className="w-10 h-10" 
              resizeMode="contain" 
            />
          ) : (
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
              <Icon name="arrow-back" size={24} color="#4B5563" />
            </TouchableOpacity>
          )}
        </View>

        <View className="absolute left-0 right-0 items-center justify-center">
          <Text className="text-xl font-bold text-dark-gray">{finalTitle}</Text>
        </View>

        <View className="z-10 flex-row items-center w-10 justify-end">
          <TouchableOpacity className="p-1">
            <Icon name="notifications-outline" size={24} color="#4B5563" />
            <View className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full border border-white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Search Bar (Optional) --- */}
      {showSearch && (
        <View className="px-4 pb-2">
          <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-12 shadow-sm">
            <Icon name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for fashion..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-sm font-montserrat text-dark-gray"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery?.('')}>
                <Icon name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* --- Categories (Home only) --- */}
      {isHome && (
        <View className="px-4">
          <CategoriesList 
            categories={categories}
            isLoading={isCategoriesLoading}
            activeId={activeCategoryId}
            onCategoryPress={onCategoryPress}
          />
          
          {subCategories.length > 0 && (
            <View className="mt-1">
              <CategoriesList 
                categories={subCategories}
                isLoading={isSubCategoriesLoading}
                activeId={activeSubCategoryId}
                onCategoryPress={onSubCategoryPress}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Header;