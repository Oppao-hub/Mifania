module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-redux|@react-navigation|@react-native-community|react-native-safe-area-context|react-native-toast-message|nativewind|react-native-css-interop|@react-native-firebase|firebase|@firebase)/)',
  ],
};
