import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LoadingState from '../components/LoadingState';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import SearchScreenHeader from '../components/SearchScreenHeader';
import RecentSearchesSection from '../components/RecentSearchesSection';
import SectionHeader from '../components/SectionHeader';
import HorizontalProductList from '../components/HorizontalProductList';
import CategoriesList from '../components/CategoriesList';
import ProductCard from '../components/ProductCard';
import CategorySortFilterBar from '../components/CategorySortFilterBar';
import CatalogOptionsSheet, { CatalogOption } from '../components/CatalogOptionsSheet';
import EmptyState from '../components/EmptyState';
import { getProducts } from '../app/reducers/product';
import { getCategories } from '../app/reducers/category';
import { getSubCategories } from '../app/reducers/subCategory';
import { RootState, Product } from '../utils/types';
import { ROUTES } from '../utils';
import {
  DISCOVER_CATEGORY,
  filterProductsByCategory,
  sortProductsByPriceDesc,
} from '../utils/home';
import {
  applyCatalogSort,
  CatalogSortOption,
  CATALOG_SORT_OPTIONS,
} from '../utils/catalog';
import { searchProducts } from '../utils/search';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from '../utils/recentSearch';

export type SearchScreenParams = {
  initialQuery?: string;
};

type SearchRoute = RouteProp<{ Search: SearchScreenParams }, 'Search'>;

const HOT_DEALS_LIMIT = 8;
const ALL_SUB_FILTER = 'all';
const MIN_QUERY_LENGTH = 1;

type SearchView = 'idle' | 'empty' | 'results';

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<SearchRoute>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState<number | string | null>(null);
  const [sortOption, setSortOption] = useState<CatalogSortOption>('newest');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const { items: products, isLoading } = useSelector((state: RootState) => state.product);
  const { items: categories } = useSelector((state: RootState) => state.category);
  const { items: subCategories } = useSelector((state: RootState) => state.subCategory);

  const loadRecent = useCallback(async () => {
    setRecentSearches(await getRecentSearches());
  }, []);

  useEffect(() => {
    loadRecent();
    if (products.length === 0) dispatch(getProducts());
    dispatch(getCategories());
    dispatch(getSubCategories());
  }, [dispatch, loadRecent, products.length]);

  const trimmedQuery = query.trim();
  const categoryFilters = useMemo(() => [DISCOVER_CATEGORY, ...categories], [categories]);

  const textMatches = useMemo(
    () => searchProducts(products, trimmedQuery),
    [products, trimmedQuery],
  );

  const categoryFiltered = useMemo(
    () =>
      filterProductsByCategory(
        textMatches,
        subCategories,
        selectedCategoryId,
        subCategoryFilter,
        '',
      ),
    [textMatches, subCategories, selectedCategoryId, subCategoryFilter],
  );

  const displayProducts = useMemo(
    () => applyCatalogSort(categoryFiltered, sortOption),
    [categoryFiltered, sortOption],
  );

  const hotDeals = useMemo(
    () => sortProductsByPriceDesc(products).slice(0, HOT_DEALS_LIMIT),
    [products],
  );

  const view: SearchView = useMemo(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) return 'idle';
    if (displayProducts.length === 0) return 'empty';
    return 'results';
  }, [trimmedQuery, displayProducts.length]);

  const filterSubCategories = useMemo(() => {
    if (!selectedCategoryId || selectedCategoryId === 'all') return subCategories;
    return subCategories.filter((sub) => {
      const cat = typeof sub.category === 'object' ? sub.category : null;
      return cat?.id === selectedCategoryId;
    });
  }, [subCategories, selectedCategoryId]);

  const filterOptions: CatalogOption<string>[] = useMemo(
    () => [
      { value: ALL_SUB_FILTER, label: 'All types' },
      ...filterSubCategories.map((sub) => ({
        value: String(sub.id),
        label: sub.name,
      })),
    ],
    [filterSubCategories],
  );

  const selectedFilterValue =
    subCategoryFilter == null ? ALL_SUB_FILTER : String(subCategoryFilter);

  const persistSearch = async (term: string) => {
    const next = await addRecentSearch(term);
    setRecentSearches(next);
  };

  const handleSubmit = async () => {
    if (trimmedQuery.length >= MIN_QUERY_LENGTH) {
      await persistSearch(trimmedQuery);
    }
  };

  const handleSelectRecent = async (term: string) => {
    setQuery(term);
    await persistSearch(term);
  };

  const handleCategoryPress = (category: { id?: number | string }) => {
    setSelectedCategoryId(category.id ?? 'all');
    setSubCategoryFilter(null);
  };

  const handleFilterSelect = (value: string) => {
    if (value === ALL_SUB_FILTER) {
      setSubCategoryFilter(null);
      return;
    }
    const match = filterSubCategories.find((sub) => String(sub.id) === value);
    setSubCategoryFilter(match?.id ?? value);
  };

  const bottomBarOffset = Math.max(insets.bottom, 16) + 72;
  const sortActive = sortOption !== 'newest';
  const filterActive = subCategoryFilter != null;

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      variant="grid"
      onPress={() => navigation.navigate(ROUTES.PRODUCT_DETAILS, { product: item })}
    />
  );

  const resultsHeader = (
    <View className="px-4 pb-2">
      <CategoriesList
        categories={categoryFilters}
        isLoading={false}
        activeId={selectedCategoryId}
        onCategoryPress={handleCategoryPress}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <SearchScreenHeader
        query={query}
        onChangeQuery={setQuery}
        onSubmit={handleSubmit}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        {isLoading && products.length === 0 ? (
          <LoadingState message="Searching products..." />
        ) : view === 'idle' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          >
            <RecentSearchesSection
              items={recentSearches}
              onSelect={handleSelectRecent}
              onRemove={async (term) => setRecentSearches(await removeRecentSearch(term))}
              onClearAll={async () => {
                await clearRecentSearches();
                setRecentSearches([]);
              }}
            />

            {hotDeals.length > 0 ? (
              <View className="mt-4">
                <View className="px-4">
                  <SectionHeader title="Hot Deals This Week" />
                </View>
                <HorizontalProductList products={hotDeals} />
              </View>
            ) : null}
          </ScrollView>
        ) : view === 'empty' ? (
          <EmptyState
            iconName="clipboard-text-search-outline"
            title="Products Not Found"
            description="Did you mistype something? Double-check your spelling and try a different keyword."
            buttonText="Clear search"
            onButtonPress={() => setQuery('')}
          />
        ) : (
          <View className="flex-1">
            <FlatList
              data={displayProducts}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              ListHeaderComponent={resultsHeader}
              columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
              contentContainerStyle={{ paddingBottom: bottomBarOffset + 16, paddingTop: 8 }}
              showsVerticalScrollIndicator={false}
              renderItem={renderProduct}
              keyboardShouldPersistTaps="handled"
            />

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
          </View>
        )}
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  );
};

export default SearchScreen;
