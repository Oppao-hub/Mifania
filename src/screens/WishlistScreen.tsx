import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootState, Category, Product } from '../utils/types';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import CategoriesList from '../components/CategoriesList';
import FloatingToolbar from '../components/FloatingToolbar';
import CatalogOptionsSheet from '../components/CatalogOptionsSheet';
import { useScreenLiveSync } from '../hooks/useLiveSync';
import { LIVE_SYNC_POLL_MS } from '../config/realtime';
import { useTabBarBottomPadding } from '../utils/layout';
import { getCategories } from '../app/reducers/category';
import { getSubCategories } from '../app/reducers/subCategory';
import { getWishlist } from '../app/reducers/wishlist';
import {
  filterProductsByCategory,
  sortProductsByNewest,
  sortProductsByPriceDesc,
} from '../utils/home';
import { showFeedbackToast } from '../utils/feedbackToast';
import { showBlockingInfo } from '../utils/userFeedback';
import { ROUTES } from '../utils';
import { goToHomeTab } from '../utils/navigation';

type SortOption = 'newest' | 'price-asc' | 'price-desc';
type PriceFilter = 'all' | 'under-500' | '500-1000' | 'over-1000';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Recently Added' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const PRICE_FILTER_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-500', label: 'Under ₱500' },
  { value: '500-1000', label: '₱500 - ₱1,000' },
  { value: 'over-1000', label: 'Above ₱1,000' },
];

const ALL_CATEGORY: Category = {
  id: 'all',
  name: 'All',
  slug: 'all',
};

const sortProductsByPriceAsc = (products: Product[]) =>
  [...products].sort(
    (a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'),
  );

const filterByPrice = (products: Product[], filter: PriceFilter): Product[] => {
  if (filter === 'all') return products;

  return products.filter((product) => {
    const price = parseFloat(product.price || '0');
    if (filter === 'under-500') return price < 500;
    if (filter === '500-1000') return price >= 500 && price <= 1000;
    return price > 1000;
  });
};

const WishlistScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<any>>();
  const tabBarBottomPadding = useTabBarBottomPadding();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const authToken = useSelector((state: RootState) => state.authentication.data?.token);
  const { items: categories, isLoading: isCategoriesLoading } = useSelector(
    (state: RootState) => state.category,
  );
  const { items: subCategories } = useSelector((state: RootState) => state.subCategory);

  const [activeCategoryId, setActiveCategoryId] = useState<number | string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const reloadWishlist = useCallback(() => {
    dispatch(getCategories());
    dispatch(getSubCategories());
    if (authToken) {
      dispatch(getWishlist());
    }
  }, [authToken, dispatch]);

  useScreenLiveSync(reloadWishlist, LIVE_SYNC_POLL_MS, Boolean(authToken));

  const onRefresh = async () => {
    setRefreshing(true);
    reloadWishlist();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const categoryFilters = useMemo(() => [ALL_CATEGORY, ...categories], [categories]);

  const displayedItems = useMemo(() => {
    let items = filterProductsByCategory(
      wishlistItems,
      subCategories,
      activeCategoryId,
      null,
      searchQuery,
    );
    items = filterByPrice(items, priceFilter);

    if (sortOption === 'price-asc') return sortProductsByPriceAsc(items);
    if (sortOption === 'price-desc') return sortProductsByPriceDesc(items);
    return sortProductsByNewest(items);
  }, [
    wishlistItems,
    subCategories,
    activeCategoryId,
    searchQuery,
    priceFilter,
    sortOption,
  ]);

  const handleWishlistChange = useCallback((_product: Product, isWishlisted: boolean) => {
    if (!isWishlisted) {
      showFeedbackToast('Removed from Wishlist!');
    }
  }, []);


  const floatingToolbarOffset = tabBarBottomPadding - 52;
  const listBottomPadding = tabBarBottomPadding + 72;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header
        title="Wishlist"
        leftVariant="logo"
        hideNotificationBell
        showSearch={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        rightActions={[
          {
            icon: showSearch ? 'close-outline' : 'search-outline',
            onPress: () => {
              setShowSearch((prev) => {
                if (prev) setSearchQuery('');
                return !prev;
              });
            },
          },
          {
            icon: 'ellipsis-vertical',
            onPress: () =>
              showBlockingInfo({
                title: 'Wishlist Options',
                message: 'More wishlist actions will be available soon.',
              }),
          },
        ]}
      />

      {wishlistItems.length > 0 ? (
        <View className="flex-1">
          <View className="px-4">
            <CategoriesList
              categories={categoryFilters}
              isLoading={isCategoriesLoading}
              activeId={activeCategoryId}
              onCategoryPress={(category) => setActiveCategoryId(category.id ?? 'all')}
            />
          </View>

          <FlatList
            data={displayedItems}
            numColumns={2}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingBottom: listBottomPadding, paddingTop: 4 }}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                variant="wishlist"
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
                onWishlistChange={handleWishlistChange}
              />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#52622E']}
                tintColor="#52622E"
              />
            }
            ListEmptyComponent={
              <EmptyState
                iconName="heart-outline"
                title="No matches found"
                description="Try another category or clear your search and filters."
              />
            }
          />

          <FloatingToolbar
            bottomOffset={floatingToolbarOffset}
            actions={[
              { key: 'sort', label: 'Sort', icon: 'swap-vertical-outline', onPress: () => setShowSortSheet(true) },
              { key: 'filter', label: 'Filter', icon: 'options-outline', onPress: () => setShowFilterSheet(true) },
            ]}
          />
        </View>
      ) : (
        <View className="flex-1 px-4">
          <EmptyState
            iconName="heart-outline"
            title="Your wishlist is empty"
            description="Save items you love here to find them easily later."
            buttonText="Explore Products"
            onButtonPress={() => goToHomeTab(navigation)}
          />
        </View>
      )}

      <CatalogOptionsSheet
        visible={showSortSheet}
        title="Sort By"
        options={SORT_OPTIONS}
        selectedValue={sortOption}
        onSelect={setSortOption}
        onClose={() => setShowSortSheet(false)}
      />

      <CatalogOptionsSheet
        visible={showFilterSheet}
        title="Filter By Price"
        options={PRICE_FILTER_OPTIONS}
        selectedValue={priceFilter}
        onSelect={setPriceFilter}
        onClose={() => setShowFilterSheet(false)}
      />
    </SafeAreaView>
  );
};

export default WishlistScreen;
