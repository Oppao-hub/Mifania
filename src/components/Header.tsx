import React from 'react';
import { View, TouchableOpacity, Image, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState, Category, SubCategory } from '../utils/types';
import { IMG, ROUTES } from '../utils';
import CategoriesList from './CategoriesList';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  /** When set, replaces the default back button on non-home screens */
  leftVariant?: 'back' | 'logo' | 'empty';
  rightIcon?: string;
  onRightPress?: () => void;
  rightActions?: Array<{ icon: string; onPress: () => void }>;
  /** When true, hides the default notification bell if no rightIcon is passed */
  hideNotificationBell?: boolean;
  showSearch?: boolean;
  /** When set, the search bar opens the search screen instead of inline typing */
  onSearchPress?: () => void;
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
  /** When false, category chips are not rendered in the header (e.g. home renders them in scroll content) */
  showCategoryFilters?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftVariant,
  rightIcon,
  onRightPress,
  rightActions,
  hideNotificationBell = false,
  showSearch = false,
  onSearchPress,
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
  showCategoryFilters = true,
}) => {
  const navigation = useNavigation<any>();
  
  // Get counts for specific screens
  const { items: notifications } = useSelector((state: RootState) => state.notification);
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const displayTitle = isHome ? "Mifania" : title;
  const countToDisplay = title === 'Cart' ? cartCount : title === 'Wishlist' ? wishlistCount : null;
  const finalTitle = countToDisplay !== null ? `${displayTitle} (${countToDisplay})` : displayTitle;

  const handleNotification = () => {
    navigation.navigate(ROUTES.NOTIFICATION);
  };

  return (
    <View className="bg-app-bg">
      {/* --- Top Row --- */}
      <View className="px-4 py-3 flex-row justify-between items-center relative h-14">
        <View className="z-10 w-10">
          {isHome || leftVariant === 'logo' ? (
            <Image 
              source={IMG.LOGO} 
              className="w-10 h-10" 
              resizeMode="contain" 
            />
          ) : leftVariant === 'empty' ? (
            <View className="w-10 h-10" />
          ) : (
            <TouchableOpacity 
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('HomeTab');
                }
              }} 
              className="p-1"
            >
              <Icon name="arrow-back" size={24} color="#4B5563" />
            </TouchableOpacity>
          )}
        </View>

        <View className="absolute left-0 right-0 items-center justify-center">
          <Text className="text-xl font-bold text-dark-gray">{finalTitle}</Text>
        </View>

        <View className="z-10 flex-row items-center min-w-10 justify-end">
          {rightActions && rightActions.length > 0 ? (
            rightActions.map((action) => (
              <TouchableOpacity key={action.icon} className="p-1 ml-1" onPress={action.onPress}>
                <Icon name={action.icon} size={22} color="#4B5563" />
              </TouchableOpacity>
            ))
          ) : rightIcon && onRightPress ? (
            <TouchableOpacity className="p-1" onPress={onRightPress}>
              <Icon name={rightIcon} size={24} color="#4B5563" />
            </TouchableOpacity>
          ) : hideNotificationBell ? (
            <View className="w-6 h-6" />
          ) : (
            <TouchableOpacity
              className={`p-1 relative ${isHome ? 'w-10 h-10 rounded-full border border-border-color items-center justify-center' : ''}`}
              onPress={handleNotification}
            >
              <Icon name="notifications-outline" size={22} color="#4B5563" />
              {unreadCount > 0 && (
                <View className="absolute top-0 right-0 bg-danger w-4 h-4 rounded-full items-center justify-center border border-white">
                  <Text className="text-white text-[9px] font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- Search Bar (Optional) --- */}
      {showSearch && (
        <View className="px-4 pb-2">
          {onSearchPress ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onSearchPress}
              className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-12 shadow-sm"
            >
              <Icon name="search-outline" size={20} color="#9CA3AF" />
              <Text className="flex-1 ml-3 text-sm font-montserrat text-gray">
                Search products...
              </Text>
              <Icon name="camera-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-12 shadow-sm">
              <Icon name="search-outline" size={20} color="#9CA3AF" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search products..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-sm font-montserrat text-dark-gray"
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery?.('')}>
                  <Icon name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {/* --- Categories (Home only) --- */}
      {isHome && showCategoryFilters && (
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