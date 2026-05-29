import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { getProductReviews } from '../../utils/productReviews';
import { RootState, ProductReview } from '../../utils/types';

interface ProductReviewsSectionProps {
  productId?: number;
  onViewAll?: () => void;
}

const formatReviewDate = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ productId, onViewAll }) => {
  const token = useSelector((state: RootState) => state.authentication.data?.token);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!productId) {
        setReviews([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getProductReviews(productId, token);
        if (!cancelled) setReviews(data);
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [productId, token]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <View className="mt-8 px-4">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-base font-montserrat-bold text-dark-gray">Rating & Reviews</Text>
          {averageRating ? (
            <View className="flex-row items-center mt-1">
              <Icon name="star" size={14} color="#F59E0B" />
              <Text className="text-sm font-montserrat-bold text-dark-gray ml-1">
                {averageRating}
              </Text>
              <Text className="text-xs font-montserrat text-gray ml-1">
                ({reviews.length} review{reviews.length === 1 ? '' : 's'})
              </Text>
            </View>
          ) : null}
        </View>
        {onViewAll && reviews.length > 0 ? (
          <TouchableOpacity onPress={onViewAll}>
            <Text className="text-sm font-montserrat-bold text-brand">View All →</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoading ? (
        <View className="bg-light-gray rounded-2xl p-5 items-center">
          <Text className="text-sm font-montserrat text-gray">Loading reviews...</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View className="bg-light-gray rounded-2xl p-5 items-center">
          <Icon name="chatbubbles-outline" size={40} color="#9CA3AF" />
          <Text className="text-base font-montserrat-bold text-dark-gray mt-3">No reviews yet</Text>
          <Text className="text-sm font-montserrat text-gray text-center mt-2 leading-5">
            Be the first to share your experience with this sustainable piece.
          </Text>
        </View>
      ) : (
        <View className="bg-light-gray rounded-2xl p-5">
          {reviews.slice(0, 2).map((review) => (
            <View key={review.id ?? review['@id']} className="mb-4 last:mb-0">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name={star <= review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color="#F59E0B"
                    />
                  ))}
                </View>
                <Text className="text-[11px] font-montserrat text-gray ml-2">
                  {formatReviewDate(review.createdAt)}
                </Text>
              </View>
              {review.reviewerName ? (
                <Text className="text-[11px] font-montserrat-bold text-dark-gray mb-1">
                  {review.reviewerName}
                </Text>
              ) : null}
              {review.comment ? (
                <Text className="text-sm font-montserrat text-dark-gray leading-5">
                  {review.comment}
                </Text>
              ) : (
                <Text className="text-sm font-montserrat text-gray italic">No written comment.</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default ProductReviewsSection;
