import type { ViewStyle } from 'react-native';

type ThemeColors = {
    brand: { DEFAULT: string; light: string; dark: string };
    'light-brown': string;
    'app-bg': string;
    surface: string;
    'light-gray': string;
    gray: string;
    'dark-gray': string;
    'border-color': string;
    'row-hover': string;
    success: string;
    danger: string;
    warning: string;
    terracotta: string;
};

type NativeShadowToken = {
    color: string;
    offsetY: number;
    opacity: number;
    radius: number;
    elevation: number;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwind = require('../../tailwind.config.js') as {
    colors: ThemeColors;
    nativeShadows: { card: NativeShadowToken };
};

export const themeColors: ThemeColors = tailwind.colors;

export const themeNativeShadows = tailwind.nativeShadows;

export const surfaceCardShadowStyle: ViewStyle = {
    shadowColor: themeNativeShadows.card.color,
    shadowOffset: { width: 0, height: themeNativeShadows.card.offsetY },
    shadowOpacity: themeNativeShadows.card.opacity,
    shadowRadius: themeNativeShadows.card.radius,
    elevation: themeNativeShadows.card.elevation,
};

/** Resolve nested tokens like brand.DEFAULT for Icon color props, etc. */
export const getThemeColor = (token: string): string => {
    const parts = token.split('.');
    let value: unknown = themeColors;
    for (const part of parts) {
        if (value == null || typeof value !== 'object') return token;
        value = (value as Record<string, unknown>)[part];
    }
    return typeof value === 'string' ? value : token;
};
