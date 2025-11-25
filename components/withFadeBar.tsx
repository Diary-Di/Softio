// components/withFadeBar.tsx
import React, { useRef } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import FloatingBottomBar from './FloatingBottomBar';

export type Tab = 'produit' | 'prix' | 'categorie';

type WithScrollProps = {
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  navigation?: any;
  route?: any;
};

export default function withFadeBar<P>(
  WrappedComponent: React.ComponentType<P & Partial<WithScrollProps>>,
  activeTab: Tab
): React.FC<P> {
  return (props: P) => {
    const lastY   = useRef(0);
    const visible = useRef(new Animated.Value(1)).current;

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = e.nativeEvent.contentOffset.y;
      const diff     = currentY - lastY.current;

      if (diff > 2)       Animated.timing(visible, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      else if (diff < -2) Animated.timing(visible, { toValue: 1, duration: 200, useNativeDriver: true }).start();

      lastY.current = currentY;
      (props as Partial<WithScrollProps>).onScroll?.(e);
    };

    // Hide the floating bottom bar for specific screens (e.g. the CreateProduct or CreateCustomer screens)
    const routeName = (props as any).route?.name as string | undefined;
    // Exclude certain screens so the product floating bar does not appear on those screens
    // Add 'CustomerFollowUp' so the product bar is hidden on the follow-up screen
    const excludedScreens = ['CreateProduct', 'CreateCustomer', 'CustomerList', 'CustomerFollowUp', 'NewSale', 'CartValidation'];
    const shouldShowBar = !routeName || !excludedScreens.includes(routeName);

    return (
      <>
        <WrappedComponent {...props} onScroll={onScroll} navigation={(props as any).navigation} route={(props as any).route} />
        {shouldShowBar && <FloatingBottomBar visible={visible} active={activeTab} />}
      </>
    );
  };
}