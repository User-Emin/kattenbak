"use client";

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * UI State Context - DRY & Maintainable
 * Centralized state voor chat popup en mini-cart
 * Zorgt dat ze elkaar niet overlappen
 */

interface UIContextType {
  isChatOpen: boolean;
  isCartOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // DRY: Open chat, sluit cart
  const openChat = () => {
    setIsChatOpen(true);
    setIsCartOpen(false);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  // DRY: Open cart, sluit chat
  const openCart = () => {
    setIsCartOpen(true);
    setIsChatOpen(false);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  return (
    <UIContext.Provider
      value={{
        isChatOpen,
        isCartOpen,
        openChat,
        closeChat,
        openCart,
        closeCart,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
}



