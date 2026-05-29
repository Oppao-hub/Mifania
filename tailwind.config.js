/** Shared palette — single source for Tailwind classes and RN style objects */
const colors = {
  /* --- 🌿 Core Brand Palette --- */
  brand: {
    DEFAULT: '#52622E',
    light: '#6A7B42',
    dark: '#3F4C23',
  },
  'light-brown': '#8A7363',

  /* --- 🩶 UI Neutrals & Shades --- */
  'app-bg': '#FBFBFA',
  surface: '#FFFFFF',
  'light-gray': '#F3F4F6',
  gray: '#6A7282',
  'dark-gray': '#4B5563',
  'border-color': '#EAE8E3',
  'row-hover': '#F9F9F8',

  /* --- ✅ Status Colors --- */
  success: '#52622E',
  danger: '#DC3545',
  warning: '#D97706',
  terracotta: '#B45239',
};

/** React Native shadow tokens (Android elevation + iOS shadow) */
const nativeShadows = {
  card: {
    color: colors['dark-gray'],
    offsetY: 1,
    opacity: 0.05,
    radius: 4,
    elevation: 2,
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors,
      boxShadow: {
        card: `0px ${nativeShadows.card.offsetY}px ${nativeShadows.card.radius}px rgba(75, 85, 99, ${nativeShadows.card.opacity})`,
      },
      borderRadius: {
        /** Elevated list/content cards — sharper than rounded-2xl/3xl */
        card: '12px',
      },
      fontSize: {
        xxs: '8px',
      },
      fontFamily: {
        montserrat: ['Montserrat-Regular'],
        'montserrat-bold': ['Montserrat-Bold'],
      },
    },
  },
  presets: [require('nativewind/preset')],
  plugins: [],
  colors,
  nativeShadows,
};
