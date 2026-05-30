import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 70;

/** @deprecated No longer added to bottom offset — kept for older call sites. */
export const TAB_BAR_EDGE_MARGIN = 0;

/** @deprecated No longer added to bottom offset — kept for older call sites. */
export const TAB_BAR_SAFE_GAP = 0;

/** @deprecated Use TAB_BAR_EDGE_MARGIN */
export const TAB_BAR_FLOAT_MARGIN = TAB_BAR_EDGE_MARGIN;

/**
 * Tab bar is docked to the physical bottom; use padding inside the bar for system nav.
 */
export function getTabBarBottomOffset(_insets: Pick<EdgeInsets, 'bottom'>): number {
  return 0;
}

export function getTabBarContentInset(insets: Pick<EdgeInsets, 'bottom'>): number {
  return Math.max(insets.bottom, 0);
}

/** Total tab bar height including the system navigation inset. */
export function getTabBarTotalHeight(insets: Pick<EdgeInsets, 'bottom'>): number {
  return TAB_BAR_HEIGHT + getTabBarContentInset(insets);
}

/** Total vertical space screens should reserve so content clears the tab bar. */
export function getTabBarReserveHeight(insets: Pick<EdgeInsets, 'bottom'>): number {
  return getTabBarTotalHeight(insets);
}

/** Scroll/content padding so lists clear the floating bottom tab bar on any device. */
export function useTabBarBottomPadding(extra = 0): number {
  const insets = useSafeAreaInsets();
  return getTabBarReserveHeight(insets) + extra;
}

export function useTabBarLayout(extraContentPadding = 0) {
  const insets = useSafeAreaInsets();
  const contentInset = getTabBarContentInset(insets);

  return {
    insets,
    bottomOffset: 0,
    tabBarHeight: TAB_BAR_HEIGHT,
    tabBarTotalHeight: getTabBarTotalHeight(insets),
    tabBarContentInset: contentInset,
    contentPaddingBottom: getTabBarReserveHeight(insets) + extraContentPadding,
    hasSystemNavigation: contentInset > 0,
  };
}
