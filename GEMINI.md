# Mifania - Project Overview

Mifania is a modern **React Native** mobile application designed for fashion and e-commerce. It leverages a robust architecture with Redux for state management, Redux-Saga for asynchronous side effects, and NativeWind for utility-first styling.

## 🚀 Core Technologies

- **Framework:** React Native (v0.84+)
- **Language:** TypeScript
- **State Management:** Redux with Redux-Saga and Redux Persist (AsyncStorage)
- **Navigation:** React Navigation (Stack and Bottom Tabs)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Icons:** Lucide-React-Native and React-Native-Vector-Icons
- **API Client:** Fetch-based custom client with Pexels API integration

## 📂 Project Structure

- `App.tsx`: Main entry point, sets up Redux Provider, PersistGate, and Navigation.
- `src/app/`:
    - `actions.js`: Redux action creators.
    - `reducers/`: Redux slices (auth, product).
    - `sagas/`: Redux-Saga middleware for API calls and side effects.
    - `store/`: Redux store configuration and persistence setup.
    - `api/`: API client configuration and request helpers.
- `src/navigations/`:
    - `AppNavigator.js`: Root navigator (switches between Auth and Main based on login state).
    - `AuthNavigator.js`: Login and Register flows.
    - `MainNavigator.js`: Main app flow, typically housing the BottomTabNavigator.
    - `BottomTabNavigator.js`: Core app navigation (Home, Cart, Profile, etc.).
- `src/screens/`: Feature-specific screens (Home, ProductDetails, Cart, Profile, Auth).
- `src/components/`: Reusable UI components (Buttons, Inputs, Modals, Cards).
- `src/utils/`: Helper functions, constants, and route definitions.
- `assets/`: Global assets including custom fonts (Montserrat, Allura, Orbitron) and images.

## 🛠️ Building and Running

### Prerequisites
- Node.js (>= 20)
- React Native CLI
- Android Studio / Xcode for mobile development

### Commands
- **Start Metro:** `npm start`
- **Run Android:** `npm run android`
- **Run iOS:** `npm run ios` (Ensure `pod install` is run in `ios/` directory first)
- **Lint Code:** `npm run lint`
- **Run Tests:** `npm run test`

## 💅 Development Conventions

- **Styling:** Use **NativeWind** (Tailwind CSS) utility classes for all component styling. Avoid inline styles or `StyleSheet` unless absolutely necessary for dynamic values.
- **State Management:** Follow the **Redux-Saga** pattern for any asynchronous actions (API calls, storage). Always update state via actions and reducers.
- **Navigation:** Define new routes in `src/utils/routes.js` (if applicable) and add screens to the appropriate navigator in `src/navigations/`.
- **Type Safety:** The project uses **TypeScript**. Ensure new components and functions are properly typed.
- **Theming:** Custom colors (brand, mocha, cream, terracotta) and fonts (montserrat) are defined in `tailwind.config.js`. Use these custom values to maintain brand consistency.
- **Components:** Before creating a new component, check `src/components/` to see if a reusable one already exists (e.g., `CustomButton`, `FormInput`).
