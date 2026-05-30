import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { showBlockingError, showFeedbackToast } from '../utils/userFeedback';
import { ASSET_URL } from '../app/api/client';
import Button from '../components/Button';
import StickyBottomBar from '../components/StickyBottomBar';
import HorizontalProductList from '../components/HorizontalProductList';
import SectionHeader from '../components/SectionHeader';
import ProductVouchersSection from '../components/product/ProductVouchersSection';
import ProductShareSheet from '../components/product/ProductShareSheet';
import ProductVariantSheet from '../components/product/ProductVariantSheet';
import ProductReviewsSection from '../components/product/ProductReviewsSection';
import ActionOptionsSheet from '../components/ActionOptionsSheet';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setCartItemsSelection } from '../app/reducers/cart';
import { getProducts } from '../app/reducers/product';
import { toggleWishlist } from '../app/reducers/wishlist';
import { CartItem, Color, Product, RootState, Size } from '../utils/types';
import { ROUTES } from '../utils';
import {
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  findProductVariant,
  getProductStock,
  getSizeLabel,
  normalizeProductColor,
  normalizeProductSize,
} from '../utils/productVariants';
import { getProductQrTagInfo, openProductSustainability } from '../utils/productQrTag';
import EmbeddedQrTag from '../components/EmbeddedQrTag';
import { buildProductSpecs, getRelatedProducts } from '../utils/productDetails';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 1.05;

export default function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const catalogProducts = useSelector((state: RootState) => state.product.items);
  const {
    items: cartItems,
    isLoading: isCartLoading,
    error: cartError,
  } = useSelector((state: RootState) => state.cart);

  const { product: routeProduct }: { product?: Product } = route.params || {};
  const catalogMatch = useMemo(
    () => catalogProducts.find((item) => item.id === routeProduct?.id),
    [catalogProducts, routeProduct?.id],
  );
  const product = catalogMatch ?? routeProduct;
  const isWishlisted = wishlistItems.some((item) => item.id === product?.id);

  const [selectedSize, setSelectedSize] = useState<Size>(Size.LARGE);
  const [selectedColor, setSelectedColor] = useState<Color>(Color.BLACK);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [variantSheetVisible, setVariantSheetVisible] = useState(false);
  const [showMoreOptionsSheet, setShowMoreOptionsSheet] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cart' | 'buy' | null>(null);
  const prevWishlisted = useRef(isWishlisted);
  const buyNowProductIdRef = useRef<string | number | null>(null);

  const getCartLineProductId = (item: CartItem): string | number | null => {
    const productRef = item.product;
    if (typeof productRef === 'object' && productRef?.id != null) {
      return productRef.id;
    }
    return null;
  };

  useEffect(() => {
    if (catalogProducts.length === 0) {
      dispatch(getProducts());
    }
  }, [dispatch, catalogProducts.length]);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(normalizeProductSize(product.size) ?? Size.LARGE);
    setSelectedColor(normalizeProductColor(product.color) ?? Color.BLACK);
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    if (!prevWishlisted.current && isWishlisted) {
      showFeedbackToast('Added to Wishlist!');
    }
    prevWishlisted.current = isWishlisted;
  }, [isWishlisted]);

  const resolvedProduct = useMemo((): Product | null => {
    if (!product) return null;
    if (product.size === selectedSize && product.color === selectedColor) {
      return product;
    }
    return findProductVariant(catalogProducts, product, selectedSize, selectedColor) ?? null;
  }, [product, catalogProducts, selectedSize, selectedColor]);

  const variantUnavailable = !resolvedProduct;
  const activeProduct = resolvedProduct ?? product;

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const separator = url.startsWith('/') ? '' : '/';
    return `${ASSET_URL}${separator}${url}`;
  };

  const qrTagInfo = useMemo(() => {
    const fromActive = getProductQrTagInfo(activeProduct ?? null);
    if (fromActive.hasQrCode) return fromActive;
    return getProductQrTagInfo(product ?? null);
  }, [activeProduct, product]);
  const hasQrCode = qrTagInfo.hasQrCode;

  const displayProduct = {
    id: activeProduct?.id,
    name: activeProduct?.name || product?.name || 'Loading...',
    price: activeProduct?.price || product?.price || '0',
    description: activeProduct?.description || product?.description || '',
    image: activeProduct?.imageUrl
      ? getImageUrl(activeProduct.imageUrl)
      : getImageUrl(activeProduct?.image || product?.image),
    stock: getProductStock(activeProduct ?? product ?? null),
    qrLink: qrTagInfo.linkUrl,
    qrImage: qrTagInfo.imageUrl,
    material: activeProduct?.material || product?.material || 'Not specified',
    slug: activeProduct?.slug || product?.slug,
  };

  const productImages = useMemo(() => {
    const urls = [displayProduct.image].filter(Boolean) as string[];
    return urls.length > 0 ? urls : [null];
  }, [displayProduct.image]);

  const relatedProducts = useMemo(
    () => (product ? getRelatedProducts(catalogProducts, product) : []),
    [catalogProducts, product],
  );

  const specs = useMemo(
    () =>
      buildProductSpecs({
        material: displayProduct.material,
        size: getSizeLabel(selectedSize),
        color: selectedColor,
        slug: displayProduct.slug,
        sku: displayProduct.id,
      }),
    [displayProduct, selectedSize, selectedColor],
  );

  const isOutOfStock = variantUnavailable || displayProduct.stock <= 0;
  const isLowStock = !variantUnavailable && displayProduct.stock > 0 && displayProduct.stock <= 5;

  useEffect(() => {
    if ((isAddingToCart || isBuyingNow) && !isCartLoading) {
      if (cartError) {
        showBlockingError({ title: 'Oops!', message: cartError });
      } else if (isBuyingNow) {
        const productId = buyNowProductIdRef.current;
        if (productId != null) {
          const matchingLineIds = cartItems
            .filter((item) => String(getCartLineProductId(item)) === String(productId))
            .map((item) => item.id)
            .filter((id): id is string | number => id != null);

          if (matchingLineIds.length > 0) {
            dispatch(setCartItemsSelection(false));
            dispatch(setCartItemsSelection(true, matchingLineIds));
          }
        }
        buyNowProductIdRef.current = null;
        setVariantSheetVisible(false);
        navigation.navigate(ROUTES.CHECKOUT);
      } else {
        showFeedbackToast(`${displayProduct.name} has been added to your cart.`);
        setVariantSheetVisible(false);
      }
      setIsAddingToCart(false);
      setIsBuyingNow(false);
      setPendingAction(null);
    }
  }, [
    isCartLoading,
    cartError,
    isAddingToCart,
    isBuyingNow,
    displayProduct.name,
    navigation,
    cartItems,
    dispatch,
  ]);

  const formattedPrice = !isNaN(Number(displayProduct.price))
    ? Number(displayProduct.price).toFixed(2)
    : '0.00';

  const shareMessage = `Check out ${displayProduct.name} on Mifania — ₱${formattedPrice}`;

  const addResolvedToCart = () => {
    if (!resolvedProduct?.id) {
      showBlockingError({
        title: 'Unavailable',
        message: 'This size and color combination is not available.',
      });
      return false;
    }
    if (getProductStock(resolvedProduct) <= 0) {
      showBlockingError({
        title: 'Out of stock',
        message: 'This variant is currently out of stock.',
      });
      return false;
    }
    dispatch(addToCart(resolvedProduct.id, quantity));
    return true;
  };

  const openVariantSheet = (action: 'cart' | 'buy') => {
    if (isOutOfStock) return;
    setPendingAction(action);
    setVariantSheetVisible(true);
  };

  const handleAddToCart = () => {
    if (!addResolvedToCart()) return;
    setIsAddingToCart(true);
  };

  const handleBuyNow = () => {
    if (!addResolvedToCart()) return;
    buyNowProductIdRef.current = resolvedProduct?.id ?? null;
    setIsBuyingNow(true);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(toggleWishlist(product));
  };

  const handleViewSustainabilityJourney = async () => {
    const opened = await openProductSustainability(product, navigation);
    if (!opened) {
      showBlockingError({
        title: 'Unavailable',
        message: 'Sustainability story is not available for this product yet.',
      });
    }
  };

  const moreMenuOptions = [
    {
      key: 'variant',
      label: 'Choose variant',
      icon: 'options-outline',
      onPress: () => setVariantSheetVisible(true),
    },
    ...(hasQrCode
      ? [
          {
            key: 'sustainability',
            label: 'Sustainability story',
            icon: 'leaf-outline',
            onPress: handleViewSustainabilityJourney,
          },
        ]
      : []),
    {
      key: 'share',
      label: 'Share product',
      icon: 'share-outline',
      onPress: () => setShareVisible(true),
    },
  ];

  const onImageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setImageIndex(index);
  };

  const DESCRIPTION_LIMIT = 150;
  const shouldTruncate = displayProduct.description.length > DESCRIPTION_LIMIT;
  const displayDescription =
    isExpanded || !shouldTruncate
      ? displayProduct.description
      : `${displayProduct.description.slice(0, DESCRIPTION_LIMIT)}...`;

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg items-center justify-center">
        <Text className="font-montserrat text-gray">Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View className="flex-row items-center justify-between px-4 h-14">
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('HomeTab');
          }}
          className="p-2"
        >
          <Icon name="arrow-back" color="#4B5563" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-montserrat-bold text-dark-gray">Product</Text>
        <View className="flex-row">
          <TouchableOpacity className="p-2" onPress={() => setShareVisible(true)}>
            <Icon name="share-social-outline" color="#4B5563" size={22} />
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={() => setShowMoreOptionsSheet(true)}>
            <Icon name="ellipsis-vertical" color="#4B5563" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <View className="px-4">
          <View
            style={{ width: width - 32, height: IMAGE_HEIGHT }}
            className="bg-light-gray rounded-2xl overflow-hidden self-center"
          >
            <FlatList
              data={productImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onImageScroll}
              keyExtractor={(_, i) => `img-${i}`}
              renderItem={({ item }) =>
                item ? (
                  <Image
                    source={{ uri: item }}
                    style={{ width: width - 32, height: IMAGE_HEIGHT }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: width - 32, height: IMAGE_HEIGHT }} className="bg-light-gray" />
                )
              }
            />
            <View className="absolute bottom-4 self-center bg-black/50 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-montserrat-bold">
                {imageIndex + 1}/{productImages.length}
              </Text>
            </View>
            {hasQrCode && displayProduct.qrLink ? (
              <EmbeddedQrTag
                value={displayProduct.qrLink}
                imageUrl={displayProduct.qrImage}
                size={56}
                onPress={handleViewSustainabilityJourney}
              />
            ) : null}
          </View>
        </View>

        <View className="px-4 mt-5">
          <Text className="text-xl font-montserrat-bold text-dark-gray leading-7">
            {displayProduct.name}
          </Text>
          <View className="flex-row items-center flex-wrap mt-3 gap-2">
            <Text className="text-2xl font-montserrat-bold text-brand">₱{formattedPrice}</Text>
            {!variantUnavailable && displayProduct.stock > 0 ? (
              <View className="bg-light-gray px-3 py-1 rounded-full">
                <Text className="text-xs font-montserrat text-gray">
                  {displayProduct.stock} in stock
                </Text>
              </View>
            ) : null}
            {hasQrCode ? (
              <View className="bg-brand/10 px-3 py-1 rounded-full flex-row items-center">
                <Icon name="leaf-outline" size={12} color="#52622E" />
                <Text className="text-xs font-montserrat-bold text-brand ml-1">Eco item</Text>
              </View>
            ) : null}
          </View>

          {variantUnavailable ? (
            <Text className="text-sm font-montserrat-bold text-danger mt-2">
              This size and color combination is not available
            </Text>
          ) : isOutOfStock ? (
            <Text className="text-sm font-montserrat-bold text-danger mt-2">Out of Stock</Text>
          ) : isLowStock ? (
            <Text className="text-sm font-montserrat-bold text-warning mt-2">
              Low stock — only {displayProduct.stock} left
            </Text>
          ) : null}
        </View>

        <ProductVouchersSection
          onViewAll={() => navigation.navigate(ROUTES.PROMOS_VOUCHERS)}
        />

        <View className="px-4 mt-6">
          <Text className="text-base font-montserrat-bold text-dark-gray mb-3">Size</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {SIZE_OPTIONS.filter((s) => s.value !== Size.NA).map((size) => (
                <TouchableOpacity
                  key={size.value}
                  onPress={() => setSelectedSize(size.value)}
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
          </ScrollView>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-base font-montserrat-bold text-dark-gray mb-3">Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-4">
              {COLOR_OPTIONS.map((color) => {
                const selected = selectedColor === color.value;
                return (
                  <TouchableOpacity
                    key={color.value}
                    onPress={() => setSelectedColor(color.value)}
                    className="items-center"
                  >
                    <View
                      className={`w-11 h-11 rounded-full items-center justify-center border-2 ${
                        selected ? 'border-brand' : 'border-transparent'
                      }`}
                    >
                      <View
                        style={{ backgroundColor: color.hex }}
                        className={`w-9 h-9 rounded-full ${
                          color.hex === '#FFFFFF' ? 'border border-border-color' : ''
                        }`}
                      />
                      {selected ? (
                        <View className="absolute">
                          <Icon name="checkmark" size={18} color="#52622E" />
                        </View>
                      ) : null}
                    </View>
                    <Text className="text-[10px] font-montserrat text-gray mt-1.5">{color.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View className="px-4 mt-8">
          <Text className="text-base font-montserrat-bold text-dark-gray mb-3">Product Information</Text>
          <View className="bg-surface rounded-xl border border-border-color overflow-hidden mb-4">
            {specs.map((row, index) => (
              <View
                key={row.label}
                className={`flex-row justify-between px-4 py-3 ${
                  index < specs.length - 1 ? 'border-b border-border-color' : ''
                }`}
              >
                <Text className="text-sm font-montserrat text-gray">{row.label}</Text>
                <Text className="text-sm font-montserrat-bold text-dark-gray flex-1 text-right ml-4">
                  {row.value}
                </Text>
              </View>
            ))}
          </View>

          {displayProduct.description ? (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.7}>
              <Text className="text-sm font-montserrat text-gray leading-5">
                {displayDescription}{' '}
                {shouldTruncate && (
                  <Text className="text-brand font-montserrat-bold">
                    {isExpanded ? 'read less' : 'read more...'}
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          ) : null}

          {hasQrCode ? (
            <TouchableOpacity
              onPress={handleViewSustainabilityJourney}
              className="mt-4 bg-brand/5 border border-brand/15 rounded-xl px-4 py-3 flex-row items-center"
            >
              <Icon name="leaf-outline" size={20} color="#52622E" />
              <Text className="flex-1 ml-3 text-sm font-montserrat text-gray">
                View this item&apos;s sustainability story via QR
              </Text>
              <Icon name="chevron-forward" size={18} color="#52622E" />
            </TouchableOpacity>
          ) : null}
        </View>

        <ProductReviewsSection productId={product?.id} />

        {relatedProducts.length > 0 ? (
          <View className="mt-6 mb-4">
            <View className="px-4">
              <SectionHeader title="You May Also Like" />
            </View>
            <HorizontalProductList products={relatedProducts} />
          </View>
        ) : null}
      </ScrollView>

      <StickyBottomBar variant="sticky" withBorder className="bg-surface flex-row gap-3 items-center">
        <TouchableOpacity
          className="w-12 h-12 rounded-full border border-border-color items-center justify-center bg-surface"
          onPress={handleToggleWishlist}
        >
          <Icon
            name={isWishlisted ? 'heart' : 'heart-outline'}
            color={isWishlisted ? '#52622E' : '#4B5563'}
            size={24}
          />
        </TouchableOpacity>

        <View className="flex-[1.05] min-w-0">
          <Button
            label={isOutOfStock ? 'Unavailable' : 'Buy Now'}
            variant="soft"
            size="sm"
            shape="pill"
            disabled={isOutOfStock}
            onPress={() => openVariantSheet('buy')}
            className="border border-border-color px-3"
            textClassName="text-xs"
          />
        </View>

        <View className="flex-[1.15] min-w-0">
          <Button
            label={isOutOfStock ? 'Unavailable' : 'Add to Cart'}
            onPress={() => openVariantSheet('cart')}
            disabled={isOutOfStock}
            size="sm"
            shape="pill"
            className="px-3"
            textClassName="text-xs"
          />
        </View>
      </StickyBottomBar>

      <ProductShareSheet
        visible={shareVisible}
        productName={displayProduct.name}
        shareMessage={shareMessage}
        onClose={() => setShareVisible(false)}
      />

      <ProductVariantSheet
        visible={variantSheetVisible}
        onClose={() => {
          setVariantSheetVisible(false);
          setPendingAction(null);
        }}
        productName={displayProduct.name}
        imageUri={displayProduct.image}
        priceLabel={`₱${formattedPrice}`}
        stock={displayProduct.stock}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
        onSizeChange={setSelectedSize}
        onColorChange={setSelectedColor}
        onQuantityChange={setQuantity}
        isOutOfStock={isOutOfStock}
        isAddingToCart={isAddingToCart && pendingAction === 'cart'}
        isBuyingNow={isBuyingNow && pendingAction === 'buy'}
        onAddToCart={() => {
          setPendingAction('cart');
          handleAddToCart();
        }}
        onBuyNow={() => {
          setPendingAction('buy');
          handleBuyNow();
        }}
      />

      <ActionOptionsSheet
        visible={showMoreOptionsSheet}
        title={displayProduct.name}
        options={moreMenuOptions}
        onClose={() => setShowMoreOptionsSheet(false)}
      />
    </SafeAreaView>
  );
}
