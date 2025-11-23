import React, { useRef, useEffect } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import FloatingBottomBar from './FloatingBottomBar';

/* 1.  type unique */
export type Tab = 'produit' | 'prix' | 'categorie';

/* 2.  Pas de <Tab extends string> ici */
export default function withFadeBar(
  WrappedComponent: React.ComponentType<any>,
  activeTab: Tab,
  onTab: (t: Tab) => void
) {
  return (props: any) => {
    const lastY   = useRef(0);
    const visible = useRef(new Animated.Value(1)).current;

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = e.nativeEvent.contentOffset.y;
      const diff     = currentY - lastY.current;

      if (diff > 2)       Animated.timing(visible, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      else if (diff < -2) Animated.timing(visible, { toValue: 1, duration: 200, useNativeDriver: true }).start();

      lastY.current = currentY;
    };

    return (
      <>
        <WrappedComponent {...props} onScroll={onScroll} />
        <FloatingBottomBar visible={visible} active={activeTab} onTab={onTab} />
      </>
    );
  };
}