import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const bottomTabState = (tabIndex: number) => ({
  index: tabIndex,
  routes: [
    { name: 'HomeTab' },
    { name: 'Cart' },
    { name: 'Wishlist' },
    { name: 'My Order' },
    { name: 'Account' },
  ],
});

type NavigationLike = {
  dispatch: (action: ReturnType<typeof CommonActions.reset>) => void;
  navigate: (name: string, params?: object) => void;
};

/** Leave checkout (and any stack screens above tabs) and open My Order tab. */
export function goToMyOrders(navigation: NavigationLike) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'BottomTab', state: bottomTabState(3) }],
    }),
  );
}

/** Leave checkout stack and open Home tab. */
export function goToHomeTab(navigation: NavigationLike) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'BottomTab', state: bottomTabState(0) }],
    }),
  );
}

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
}
