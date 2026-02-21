/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx", 
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/**/*.{js,jsx,ts,tsx}",
    "./src/**/**/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#6B7C57",
        brandDark: "#556345",
        brandLight: "#6b703d",
        green500: "#626F3A",
        green550: "#586334",
        mocha: "#3D3D3D",
        lightGray: "#EAEAEA",
        dashboardBG: "#f1f8ed",
        red: "#FFFF00",
      },
    }
  },
  plugins: [],
}