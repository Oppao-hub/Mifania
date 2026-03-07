/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6B7C57",
          dark: "#556345",
        },
        mocha: "#3D3D3D",
        cream: "#F7F7F7",
        "light-brown": "#A49C91",
        "light-gray": "#EAEAEA",
        terracotta: "#B45239",
        success: "#626F3A",
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