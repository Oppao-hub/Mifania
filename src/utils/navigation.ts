import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
}

export function goToMyOrders(navigation: { navigate: (name: string, params?: object) => void }) {
  navigation.navigate('BottomTab', { screen: 'My Order' });
}

export function goToHomeTab(navigation: { navigate: (name: string, params?: object) => void }) {
  navigation.navigate('BottomTab', { screen: 'HomeTab' });
}
