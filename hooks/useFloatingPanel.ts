// hooks/useFloatingPanel.ts
import { useState, useRef, useCallback } from 'react';
import { Animated } from 'react-native';

export function useFloatingPanel() {
  const [isPanelVisible, setIsPanelVisible] = useState(true); // Visible par défaut
  const panelPosition = useRef(new Animated.Value(0)).current; // 0 = visible

  const openPanel = useCallback(() => {
    setIsPanelVisible(true);
    Animated.spring(panelPosition, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [panelPosition]);

  const closePanel = useCallback(() => {
    setIsPanelVisible(false);
    Animated.spring(panelPosition, {
      toValue: 300, // Valeur pour cacher le panel
      useNativeDriver: true,
    }).start();
  }, [panelPosition]);

  const togglePanel = useCallback(() => {
    if (isPanelVisible) {
      closePanel();
    } else {
      openPanel();
    }
  }, [isPanelVisible, openPanel, closePanel]);

  const hideOnScroll = useCallback(() => {
    if (isPanelVisible) {
      closePanel();
    }
  }, [isPanelVisible, closePanel]);

  const showOnScrollEnd = useCallback(() => {
    if (!isPanelVisible) {
      // Remontre le panel après un délai quand le scroll s'arrête
      setTimeout(() => {
        openPanel();
      }, 1500);
    }
  }, [isPanelVisible, openPanel]);

  return {
    isPanelVisible,
    panelPosition,
    openPanel,
    closePanel,
    togglePanel,
    hideOnScroll,
    showOnScrollEnd,
  };
}