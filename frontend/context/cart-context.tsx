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
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  customerData: CustomerData | null;
  saveCustomerData: (data: CustomerData, consent: boolean) => void;
  loadCustomerData: () => CustomerData | null;
  clearCustomerData: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'kattenbak_cart';
const CUSTOMER_DATA_COOKIE = 'kb_customer_data';
const CONSENT_COOKIE = 'kb_consent';
const COOKIE_MAX_AGE = 7; // dagen

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch - alleen client-side renderen
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (!mounted) return; // Wacht tot component gemount is
    
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed.items || []);
      } catch (e) {
        console.error('Failed to parse cart data');
      }
    }

    // Load customer data from cookies
    const data = loadCustomerData();
    if (data) {
      setCustomerData(data);
    }
  }, [mounted]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!mounted) return; // Alleen client-side
    
    if (items.length > 0) {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items,
          updated: new Date().toISOString(),
        })
      );
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [items, mounted]);

  const itemCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const subtotal = mounted ? items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) : 0;

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQuantity = updated[existingIndex].quantity + quantity;
        
        // VOORRAAD CHECK - Niet meer toevoegen dan beschikbaar
        if (newQuantity > product.stock) {
          console.warn(`Kan niet meer dan ${product.stock} stuks toevoegen`);
          updated[existingIndex].quantity = product.stock;
          return updated;
        }
        
        updated[existingIndex].quantity = newQuantity;
        return updated;
      }
      
      // Voor nieuw item ook stock checken
      const safeQuantity = Math.min(quantity, product.stock);
      return [...prev, { product, quantity: safeQuantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          // VOORRAAD CHECK - Niet meer dan stock
          const safeQuantity = Math.min(quantity, item.product.stock);
          return { ...item, quantity: safeQuantity };
        }
        return item;
      })
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const saveCustomerData = useCallback((data: CustomerData, consent: boolean) => {
    if (consent) {
      Cookies.set(CUSTOMER_DATA_COOKIE, JSON.stringify(data), {
        expires: COOKIE_MAX_AGE,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      Cookies.set(CONSENT_COOKIE, 'true', {
        expires: COOKIE_MAX_AGE,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      setCustomerData(data);
    }
  }, []);

  const loadCustomerData = useCallback((): CustomerData | null => {
    const consent = Cookies.get(CONSENT_COOKIE);
    if (!consent) return null;

    const data = Cookies.get(CUSTOMER_DATA_COOKIE);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, []);

  const clearCustomerData = useCallback(() => {
    Cookies.remove(CUSTOMER_DATA_COOKIE);
    Cookies.remove(CONSENT_COOKIE);
    setCustomerData(null);
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
