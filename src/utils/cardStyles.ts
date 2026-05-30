import type { StyleProp, ViewStyle } from 'react-native';
import { surfaceCardShadowStyle } from '../theme';

/** Tailwind classes for elevated white cards on app-bg */
export const SURFACE_CARD_CLASS =
    'bg-surface border border-border-color shadow-card rounded-card';

export const surfaceCardShadow = surfaceCardShadowStyle;

export const mergeSurfaceCardStyle = (
    style?: StyleProp<ViewStyle>,
): StyleProp<ViewStyle> => [surfaceCardShadow, style];
