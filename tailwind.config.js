/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* --- 🌿 Core Brand Palette --- */
        brand: {
          DEFAULT: "#52622E",
          light: "#6A7B42",
          dark: "#3F4C23",
        },
        "light-brown": "#8A7363",

        /* --- 🩶 UI Neutrals & Shades --- */
        "app-bg": "#FBFBFA",
        "light-gray": "#F3F4F6",
        gray: "#6A7282",
        "dark-gray": "#4B5563",
        "border-color": "#EAE8E3",
        "row-hover": "#F9F9F8",

        /* --- ✅ Status Colors --- */
        success: "#52622E",
        danger: "#DC3545",
        warning: "#D97706",
        terracotta: "#B45239",
      },
      fontSize: {
        /* --- 📏 Custom Sizes --- */
        xxs: "8px",
      },
      fontFamily: {
        montserrat: ["Montserrat-Regular"], 
        "montserrat-bold": ["Montserrat-Bold"],
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
};