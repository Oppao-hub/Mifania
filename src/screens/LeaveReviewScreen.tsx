import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Button from '../components/Button';
import StarRatingInput from '../components/StarRatingInput';
import LoadingState from '../components/LoadingState';
import SuccessBottomSheet from '../components/SuccessBottomSheet';
import { ASSET_URL } from '../app/api/client';
import * as Types from '../app/actions';
import { RootState, Product } from '../utils/types';
import { getOrderItemProductIds, resolveProductFromOrderItem } from '../utils/orderActions';
import { getOrderProductReviews, saveProductReview } from '../utils/productReviews';
import { formatFetchErrorMessage } from '../utils/fetchError';
import { showBlockingError } from '../utils/userFeedback';

type ReviewDraft = {
  productId: number;
  productName: string;
  rating: number;
  comment: string;
};

const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const separator = url.startsWith('/') ? '' : '/';
  return `${ASSET_URL}${separator}${url}`;
};

const LeaveReviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();

  const orderId = Number(route.params?.orderId);
  const orderIri = route.params?.orderIri as string | undefined;

  const { currentOrder, isLoading: isOrderLoading } = useSelector((state: RootState) => state.order);
  const catalogProducts = useSelector((state: RootState) => state.product.items);
  const token = useSelector((state: RootState) => state.authentication.data?.token);

  const [drafts, setDrafts] = useState<ReviewDraft[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchOrder = useCallback(() => {
    if (!token) return;
    dispatch({
      type: Types.GET_ORDER_DETAILS,
      payload: { id: orderIri || orderId, token },
    });
  }, [dispatch, orderId, orderIri, token]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (catalogProducts.length === 0) {
      dispatch({ type: Types.GET_PRODUCTS });
    }
  }, [catalogProducts.length, dispatch]);

  const order = useMemo(() => {
    if (currentOrder && Number(currentOrder.id) === orderId) return currentOrder;
    return currentOrder;
  }, [currentOrder, orderId]);

  const reviewProducts = useMemo(() => {
    const productIds = getOrderItemProductIds(order);
    const fromCatalog = productIds
      .map((id) => catalogProducts.find((item) => item.id === id))
      .filter((item): item is Product => Boolean(item));

    if (fromCatalog.length > 0) return fromCatalog;

    const embedded: Product[] = [];
    const seen = new Set<number>();

    for (const rawItem of order?.orderItems ?? []) {
      if (typeof rawItem === 'string') continue;
      const product = resolveProductFromOrderItem(rawItem);
      if (!product?.id || seen.has(product.id)) continue;
      seen.add(product.id);
      embedded.push(product);
    }

    return embedded;
  }, [order, catalogProducts]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!order?.id || reviewProducts.length === 0 || !token) {
        if (!isOrderLoading) setIsHydrating(false);
        return;
      }

      setIsHydrating(true);

      try {
        const existingReviews = await getOrderProductReviews(Number(order.id), token);
        const reviewByProductId = new Map(
          existingReviews
            .filter((review) => review.productId != null)
            .map((review) => [review.productId as number, review]),
        );

        const nextDrafts: ReviewDraft[] = reviewProducts
          .filter((product) => product.id != null)
          .map((product) => {
            const existing = reviewByProductId.get(product.id as number);
            return {
              productId: product.id as number,
              productName: product.name,
              rating: existing?.rating ?? 0,
              comment: existing?.comment ?? '',
            };
          });

        if (!cancelled) {
          setDrafts(nextDrafts);
        }
      } catch {
        if (!cancelled) {
          showBlockingError({
            title: 'Could not load reviews',
            message: 'Please check your connection and try again.',
          });
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [order, reviewProducts, isOrderLoading]);

  const updateDraft = (productId: number, patch: Partial<Pick<ReviewDraft, 'rating' | 'comment'>>) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.productId === productId ? { ...draft, ...patch } : draft)),
    );
  };

  const handleSubmit = async () => {
    if (!order?.id || !token) return;

    const invalid = drafts.find((draft) => draft.rating < 1);
    if (invalid) {
      showBlockingError({
        title: 'Rating required',
        message: `Please rate ${invalid.productName} before submitting.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        drafts.map((draft) =>
          saveProductReview({
            orderId: Number(order.id),
            productId: draft.productId,
            rating: draft.rating,
            comment: draft.comment,
            token,
          }),
        ),
      );
      setShowSuccess(true);
    } catch (error: unknown) {
      showBlockingError({
        title: 'Could not save review',
        message: formatFetchErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((isOrderLoading || isHydrating) && drafts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <Header title="Leave a Review" showBack hideNotificationBell />
        <LoadingState message="Loading review..." />
      </SafeAreaView>
    );
  }

  if (!isOrderLoading && reviewProducts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <Header title="Leave a Review" showBack hideNotificationBell />
        <View className="flex-1 justify-center px-8">
          <Text className="text-center text-base font-montserrat-bold text-dark-gray">
            We could not load products from this order.
          </Text>
          <View className="mt-6">
            <Button label="Try Again" onPress={fetchOrder} shape="pill" fullWidth />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="Leave a Review" showBack hideNotificationBell />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-6 pt-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-sm font-montserrat text-gray mb-5 leading-5">
            Share how your sustainable pieces worked out. Your feedback helps other shoppers choose
            with confidence.
          </Text>

          {drafts.map((draft) => {
            const product = reviewProducts.find((item) => item.id === draft.productId);
            const imagePath = product?.imageUrl || product?.image;
            const imageSource = imagePath
              ? { uri: getImageUrl(imagePath) ?? undefined }
              : require('../assets/logos/logo.png');

            return (
              <View
                key={draft.productId}
                className="bg-surface rounded-card p-5 mb-4 border border-border-color"
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-16 h-20 rounded-xl bg-light-gray overflow-hidden mr-4">
                    <Image source={imageSource} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <Text className="flex-1 font-montserrat-bold text-dark-gray text-sm" numberOfLines={2}>
                    {draft.productName}
                  </Text>
                </View>

                <Text className="text-xs font-montserrat text-gray mb-2">Your rating</Text>
                <StarRatingInput
                  value={draft.rating}
                  onChange={(rating) => updateDraft(draft.productId, { rating })}
                />

                <Text className="text-xs font-montserrat text-gray mt-4 mb-2">
                  Comments (optional)
                </Text>
                <TextInput
                  value={draft.comment}
                  onChangeText={(comment) => updateDraft(draft.productId, { comment })}
                  placeholder="What did you like about fit, quality, or sustainability?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  className="min-h-[96px] rounded-2xl border border-border-color bg-white px-4 py-3 text-sm font-montserrat text-dark-gray"
                />
              </View>
            );
          })}
        </ScrollView>

        <View className="px-6 pb-6 pt-2">
          <Button
            label="Submit Review"
            onPress={handleSubmit}
            shape="pill"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting || drafts.length === 0}
          />
        </View>
      </KeyboardAvoidingView>

      <SuccessBottomSheet
        visible={showSuccess}
        message="Thanks for your review!"
        onDismiss={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

export default LeaveReviewScreen;
