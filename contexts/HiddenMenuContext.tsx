import React, { createContext, useContext, useState } from 'react';

type HiddenMenuContextType = {
  hiddenMode: boolean;
  setHiddenMode: (v: boolean) => void;
};

const HiddenMenuContext = createContext<HiddenMenuContextType>({
  hiddenMode: false,
  setHiddenMode: () => {},
});

export const useHiddenMenu = () => useContext(HiddenMenuContext);

export const HiddenMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hiddenMode, setHiddenMode] = useState(false);
  return (
    <HiddenMenuContext.Provider value={{ hiddenMode, setHiddenMode }}>
      {children}
    </HiddenMenuContext.Provider>
  );
};
