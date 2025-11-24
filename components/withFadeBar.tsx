// components/withFadeBar.tsx
import React, { useRef } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import FloatingBottomBar from './FloatingBottomBar';

export type Tab = 'produit' | 'prix' | 'categorie';

type WithScrollProps = {
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
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

    return (
      <>
        <WrappedComponent {...props} onScroll={onScroll} />
        <FloatingBottomBar visible={visible} active={activeTab} />
      </>
    );
  };
}