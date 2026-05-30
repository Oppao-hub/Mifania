import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import LoadingState from '../components/LoadingState';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, Category } from '../utils/types';
import Header from '../components/Header';
import SectionHeader from '../components/SectionHeader';
import HorizontalProductList from '../components/HorizontalProductList';
import CategoriesList from '../components/CategoriesList';
import HomePromoBanner from '../components/HomePromoBanner';
import CategoryTile from '../components/CategoryTile';
import ErrorState from '../components/ErrorState';
import { getProducts } from '../app/reducers/product';
import { getCategories } from '../app/reducers/category';
import { getSubCategories } from '../app/reducers/subCategory';
import { ROUTES } from '../utils';
import { useScreenLiveSync } from '../hooks/useLiveSync';
import { LIVE_SYNC_POLL_MS } from '../config/realtime';
import { useTabBarBottomPadding } from '../utils/layout';
import { pickPrimaryFetchError, shouldShowFetchError } from '../utils/fetchError';
import {
  DISCOVER_CATEGORY,
  filterProductsByCategory,
  getCategoryPreviewImage,
  sortProductsByNewest,
  sortProductsByPriceDesc,
} from '../utils/home';
import { ASSET_URL } from '../app/api/client';

const SECTION_LIMIT = 8;
const GRID_CATEGORY_LIMIT = 10;

const resolveAssetUri = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const separator = url.startsWith('/') ? '' : '/';
  return `${ASSET_URL}${separator}${url}`;
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch();
  const tabBarBottomPadding = useTabBarBottomPadding();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>('all');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { items, isLoading: isProductsLoading, error: productsError } = useSelector(
    (state: RootState) => state.product,
  );
  const {
    items: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.category);
  const { items: subCategories, error: subCategoriesError } = useSelector(
    (state: RootState) => state.subCategory,
  );

  const reloadCatalog = useCallback(() => {
    dispatch(getProducts());
    dispatch(getCategories());
    dispatch(getSubCategories());
  }, [dispatch]);

  useScreenLiveSync(reloadCatalog, LIVE_SYNC_POLL_MS, true);

  const onRefresh = async () => {
    setRefreshing(true);
    reloadCatalog();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const catalogError = pickPrimaryFetchError(productsError, categoriesError, subCategoriesError);
  const hasCatalogData = items.length > 0 || categories.length > 0;
  const isCatalogLoading =
    (isProductsLoading || isCategoriesLoading) && !hasCatalogData;
  const showCatalogError = shouldShowFetchError({
    isLoading: isCatalogLoading,
    error: catalogError,
    hasData: hasCatalogData,
  });

  const categoryFilters = useMemo(
    () => [DISCOVER_CATEGORY, ...categories],
    [categories],
  );

  const activeSubCategories = useMemo(
    () =>
      selectedCategoryId && selectedCategoryId !== 'all'
        ? subCategories.filter((sub) => {
            const cat = typeof sub.category === 'object' ? sub.category : null;
            return cat?.id === selectedCategoryId;
          })
        : [],
    [subCategories, selectedCategoryId],
  );

  const filteredProducts = useMemo(
    () =>
      filterProductsByCategory(
        items,
        subCategories,
        selectedCategoryId,
        selectedSubCategoryId,
        '',
      ),
    [items, subCategories, selectedCategoryId, selectedSubCategoryId],
  );

  const featuredProducts = useMemo(
    () => filteredProducts.slice(0, SECTION_LIMIT),
    [filteredProducts],
  );

  const newArrivals = useMemo(
    () => sortProductsByNewest(filteredProducts).slice(0, SECTION_LIMIT),
    [filteredProducts],
  );

  const hotDeals = useMemo(
    () => sortProductsByPriceDesc(filteredProducts).slice(0, SECTION_LIMIT),
    [filteredProducts],
  );

  const gridCategories = useMemo(
    () => categories.slice(0, GRID_CATEGORY_LIMIT),
    [categories],
  );

  const promoImageUri = useMemo(() => {
    const hero = featuredProducts[0] || items[0];
    return hero ? resolveAssetUri(hero.imageUrl || hero.image) : null;
  }, [featuredProducts, items]);

  const handleCategoryPress = (category: Category) => {
    setSelectedCategoryId(category.id ?? 'all');
    setSelectedSubCategoryId(null);
  };

  const openCategoryCatalog = (category: Category) => {
    navigation.navigate(ROUTES.CATEGORY_PRODUCTS, { category });
  };

  const isInitialLoad = isCatalogLoading;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header
        isHome
        showSearch
        showCategoryFilters={false}
        onSearchPress={() => navigation.navigate(ROUTES.SEARCH)}
      />

      {showCatalogError ? (
        <ErrorState error={catalogError} context="store" onRetry={reloadCatalog} />
      ) : isInitialLoad ? (
        <LoadingState message="Loading store..." />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarBottomPadding }}
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#52622E']}
              tintColor="#52622E"
            />
          }
        >
          <View className="px-4 pt-2">
            <HomePromoBanner
              imageUri={promoImageUri}
              onPress={() => navigation.navigate(ROUTES.PROMOS_VOUCHERS)}
            />
          </View>

          <View className="px-4 mt-1">
            <CategoriesList
              categories={categoryFilters}
              isLoading={isCategoriesLoading}
              activeId={selectedCategoryId}
              onCategoryPress={handleCategoryPress}
            />
            {activeSubCategories.length > 0 ? (
              <CategoriesList
                categories={activeSubCategories}
                isLoading={false}
                activeId={selectedSubCategoryId}
                onCategoryPress={(sub) => {
                  const parent = categories.find((c) => c.id === selectedCategoryId);
                  if (parent) {
                    navigation.navigate(ROUTES.CATEGORY_PRODUCTS, {
                      category: parent,
                      subCategoryId: sub.id,
                    });
                  } else {
                    setSelectedSubCategoryId(sub.id ?? null);
                  }
                }}
              />
            ) : null}
          </View>

          {featuredProducts.length > 0 ? (
            <View className="px-4 mt-2">
              <SectionHeader title="Featured" />
              <HorizontalProductList products={featuredProducts} />
            </View>
          ) : null}

          {gridCategories.length > 0 ? (
            <View className="px-4 mt-4">
              <SectionHeader title="Shop by Category" />
              <View className="flex-row flex-wrap justify-between">
                {gridCategories.map((category) => (
                  <CategoryTile
                    key={category.id}
                    category={category}
                    imageUri={getCategoryPreviewImage(category.id!, items, subCategories)}
                    onPress={openCategoryCatalog}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {newArrivals.length > 0 ? (
            <View className="px-4">
              <SectionHeader title="New Arrival" />
              <HorizontalProductList products={newArrivals} />
            </View>
          ) : null}

          {hotDeals.length > 0 ? (
            <View className="px-4">
              <SectionHeader title="Hot Deals This Week" />
              <HorizontalProductList products={hotDeals} />
            </View>
          ) : null}

          {filteredProducts.length === 0 && !isProductsLoading ? (
            <View className="items-center py-12 px-4">
              <Text className="text-gray font-montserrat text-center">
                No products match this filter. Try another category.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
