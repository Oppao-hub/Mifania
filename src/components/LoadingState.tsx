import React from 'react';
import { View, Text, ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { themeColors } from '../theme';

/** Brand spinner color — use for ActivityIndicator when not inside Button */
export const LOADING_INDICATOR_COLOR = themeColors.brand.DEFAULT;

/** Matches CustomModal / sign-in loading message typography */
export const LOADING_MESSAGE_CLASS =
  'mt-4 text-brand-dark font-montserrat-bold text-base text-center px-6';

/** White card shell used by sign-in CustomModal loading */
export const LOADING_CARD_CLASS =
  'w-full bg-white rounded-[35px] p-8 shadow-2xl items-center';

export interface LoadingStateProps {
  message?: string;
  size?: ActivityIndicatorProps['size'];
  /** Fills available space and centers content (default: true) */
  fill?: boolean;
  /**
   * Wrap spinner in the sign-in modal card. Defaults to `fill` (false when nested in CustomModal).
   */
  card?: boolean;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
  fill = true,
  card,
  className = '',
}) => {
  const useCard = card ?? fill;

  const spinner = (
    <>
      <ActivityIndicator size={size} color={LOADING_INDICATOR_COLOR} />
      {message ? (
        <Text className={LOADING_MESSAGE_CLASS}>{message}</Text>
      ) : null}
    </>
  );

  if (useCard) {
    return (
      <View
        className={[
          fill ? 'flex-1 justify-center items-center px-6' : 'items-center justify-center px-6',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <View className={LOADING_CARD_CLASS}>
          <View className="items-center py-4">{spinner}</View>
        </View>
      </View>
    );
  }

  return (
    <View
      className={[
        fill ? 'flex-1 justify-center items-center' : 'items-center justify-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {spinner}
    </View>
  );
};

export default LoadingState;
