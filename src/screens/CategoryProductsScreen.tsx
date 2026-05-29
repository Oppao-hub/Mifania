import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import ProductCard from '../components/ProductCard';
import CategorySortFilterBar from '../components/CategorySortFilterBar';
import CatalogOptionsSheet, { CatalogOption } from '../components/CatalogOptionsSheet';
import { getProducts } from '../app/reducers/product';
import { getSubCategories } from '../app/reducers/subCategory';
import { RootState, Category, Product } from '../utils/types';
import { ROUTES } from '../utils';
import { filterProductsByCategory } from '../utils/home';
import {
  applyCatalogSort,
  CatalogSortOption,
  CATALOG_SORT_OPTIONS,
} from '../utils/catalog';

export type CategoryProductsParams = {
  category: Category;
  subCategoryId?: number | string | null;
};

type CategoryProductsRoute = RouteProp<
  { CategoryProducts: CategoryProductsParams },
  'CategoryProducts'
>;

const ALL_SUB_FILTER = 'all';

const CategoryProductsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<CategoryProductsRoute>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const { category, subCategoryId: initialSubCategoryId } = route.params;
  const categoryId = category.id!;

  const { items: products, isLoading } = useSelector((state: RootState) => state.product);
  const { items: subCategories } = useSelector((state: RootState) => state.subCategory);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortOption, setSortOption] = useState<CatalogSortOption>('newest');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string | number | null>(
    initialSubCategoryId ?? null,
  );
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (products.length === 0) dispatch(getProducts());
    dispatch(getSubCategories());
  }, [dispatch, products.length]);

  const categorySubCategories = useMemo(
    () =>
      subCategories.filter((sub) => {
        const cat = typeof sub.category === 'object' ? sub.category : null;
        return cat?.id === categoryId;
      }),
    [subCategories, categoryId],
  );

  const baseProducts = useMemo(
    () =>
      filterProductsByCategory(
        products,
        subCategories,
        categoryId,
        subCategoryFilter,
        searchQuery,
      ),
    [products, subCategories, categoryId, subCategoryFilter, searchQuery],
  );

  const displayProducts = useMemo(
    () => applyCatalogSort(baseProducts, sortOption),
    [baseProducts, sortOption],
  );

  const filterOptions: CatalogOption<string>[] = useMemo(
    () => [
      { value: ALL_SUB_FILTER, label: 'All types' },
      ...categorySubCategories.map((sub) => ({
        value: String(sub.id),
        label: sub.name,
      })),
    ],
    [categorySubCategories],
  );

  const selectedFilterValue =
    subCategoryFilter == null ? ALL_SUB_FILTER : String(subCategoryFilter);

  const handleFilterSelect = (value: string) => {
    if (value === ALL_SUB_FILTER) {
      setSubCategoryFilter(null);
      return;
    }
    const match = categorySubCategories.find((sub) => String(sub.id) === value);
    setSubCategoryFilter(match?.id ?? value);
  };

  const sortActive = sortOption !== 'newest';
  const filterActive = subCategoryFilter != null;

  const bottomBarOffset = Math.max(insets.bottom, 16) + 72;

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      variant="grid"
      onPress={() => navigation.navigate(ROUTES.PRODUCT_DETAILS, { product: item })}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
        >
          <Icon name="arrow-back" size={24} color="#4B5563" />
        </TouchableOpacity>

        <Text className="text-lg font-montserrat-bold text-dark-gray flex-1 text-center mx-2">
          {category.name}
        </Text>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setShowSearch((v) => !v)}
            className="w-10 h-10 items-center justify-center"
            hitSlop={8}
          >
            <Icon
              name={showSearch ? 'close' : 'search-outline'}
              size={22}
              color={showSearch ? '#52622E' : '#4B5563'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="w-10 h-10 items-center justify-center"
            hitSlop={8}
          >
            <Icon name="ellipsis-vertical" size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch ? (
        <View className="px-4 pb-3">
          <View className="flex-row items-center bg-surface border border-border-color rounded-2xl px-4 h-11">
            <Icon name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search in ${category.name}...`}
              placeholderTextColor="#9CA3AF"
              autoFocus
              className="flex-1 ml-2 text-sm font-montserrat text-dark-gray"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}

      {isLoading && products.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#52622E" />
        </View>
      ) : (
        <FlatList
          data={displayProducts}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          contentContainerStyle={{
            paddingBottom: bottomBarOffset + 24,
            paddingTop: 8,
            flexGrow: displayProducts.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={renderProduct}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16 px-6">
              <Icon name="shirt-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray font-montserrat text-center mt-4">
                No products found in {category.name}. Try adjusting filters or search.
              </Text>
            </View>
          }
        />
      )}

      <View
        className="absolute left-0 right-0 items-center"
        style={{ bottom: Math.max(insets.bottom, 16) }}
        pointerEvents="box-none"
      >
        <CategorySortFilterBar
          onSortPress={() => setSortSheetVisible(true)}
          onFilterPress={() => setFilterSheetVisible(true)}
          sortActive={sortActive}
          filterActive={filterActive}
        />
      </View>

      <CatalogOptionsSheet
        visible={sortSheetVisible}
        title="Sort by"
        options={CATALOG_SORT_OPTIONS}
        selectedValue={sortOption}
        onSelect={setSortOption}
        onClose={() => setSortSheetVisible(false)}
      />

      <CatalogOptionsSheet
        visible={filterSheetVisible}
        title="Filter by type"
        options={filterOptions}
        selectedValue={selectedFilterValue}
        onSelect={handleFilterSelect}
        onClose={() => setFilterSheetVisible(false)}
      />

      <CatalogOptionsSheet
        visible={menuVisible}
        title="Quick actions"
        options={[
          { value: 'reset', label: 'Reset sort & filters' },
          { value: 'home', label: 'Back to home' },
        ]}
        selectedValue={null}
        onSelect={(value) => {
          if (value === 'reset') {
            setSortOption('newest');
            setSubCategoryFilter(null);
            setSearchQuery('');
            setShowSearch(false);
          }
          if (value === 'home') {
            navigation.navigate('BottomTab', { screen: 'HomeTab' });
          }
        }}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

export default CategoryProductsScreen;
