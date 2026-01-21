/**
 * CART CONTEXT - State Management
 * localStorage persistence + cookies voor guest checkout
 * Maximaal DRY, type-safe, performance optimized
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
  // ✅ VARIANT SYSTEM: Store selected variant info
  variantId?: string;
  variantName?: string;
  variantColor?: string;
  variantImage?: string; // Variant-specific image URL
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  street: string;
  houseNumber: string;
  addition?: string;
  postalCode: string;
  city: string;
  country: string;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number, variant?: { id?: string; name?: string; color?: string; image?: string }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void; // ✅ VARIANT SYSTEM: Variant-aware quantity update (modulair)
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>; // ✅ VARIANT SYSTEM: Expose setItems for variant-aware operations (modulair, geen hardcode)
  clearCart: () => void;
  customerData: CustomerData | null;
  saveCustomerData: (data: CustomerData) => void;
  loadCustomerData: () => CustomerData | null;
  clearCustomerData: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'kattenbak_cart';
const CART_VERSION = 'v2'; // Version for UUID migration
const CUSTOMER_DATA_COOKIE = 'kb_customer_data';
const CONSENT_COOKIE = 'kb_consent';
const COOKIE_MAX_AGE = 7; // dagen

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // Version check: Clear old cart if version mismatch (UUID migration)
        if (parsed.version !== CART_VERSION) {
          localStorage.removeItem(CART_STORAGE_KEY);
          setItems([]);
        } else {
          setItems(parsed.items || []);
        }
      } catch (e) {
        console.error('Failed to parse cart data');
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }

    // Load customer data from cookies
    const data = loadCustomerData();
    if (data) {
      setCustomerData(data);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          version: CART_VERSION,
          items,
          updated: new Date().toISOString(),
        })
      );
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addItem = useCallback((product: Product, quantity: number = 1, variant?: { id?: string; name?: string; color?: string; image?: string }) => {
    setItems((prev) => {
      // ✅ VARIANT SYSTEM: Check for same product AND variant
      const existingIndex = prev.findIndex((item) => 
        item.product.id === product.id && 
        item.variantId === variant?.id
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      
      return [...prev, { 
        product, 
        quantity,
        variantId: variant?.id,
        variantName: variant?.name,
        variantColor: variant?.color,
        variantImage: variant?.image,
      }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  // ✅ VARIANT SYSTEM: Update quantity with variant awareness (modulair, geen hardcode)
  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      // ✅ VARIANT SYSTEM: Remove specific variant if variantId provided, otherwise remove all variants of product
      if (variantId) {
        setItems((prev) => prev.filter((item) => 
          !(item.product.id === productId && item.variantId === variantId)
        ));
      } else {
        removeItem(productId);
      }
      return;
    }
    
    // ✅ VARIANT SYSTEM: Update quantity for specific variant if variantId provided
    setItems((prev) =>
      prev.map((item) => {
        if (variantId) {
          // Update specific variant
          return (item.product.id === productId && item.variantId === variantId) 
            ? { ...item, quantity } 
            : item;
        } else {
          // Update first matching product (backward compatibility)
          return item.product.id === productId ? { ...item, quantity } : item;
        }
      })
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  // ✅ Save customer data (localStorage only - GDPR compliant)
  const saveCustomerData = useCallback((data: CustomerData) => {
    setCustomerData(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kb_customer_data', JSON.stringify(data));
    }
  }, []);

  // ✅ Load customer data (localStorage only - GDPR compliant)
  const loadCustomerData = useCallback((): CustomerData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const data = localStorage.getItem('kb_customer_data');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  // ✅ Clear customer data (localStorage only - GDPR compliant)
  const clearCustomerData = useCallback(() => {
    setCustomerData(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kb_customer_data');
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        setItems, // ✅ VARIANT SYSTEM: Expose setItems for variant-aware operations (modulair, geen hardcode)
        clearCart,
        customerData,
        saveCustomerData,
        loadCustomerData,
        clearCustomerData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
