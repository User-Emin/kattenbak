"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";

/**
 * Product Navigation - Smooth Swipe Buttons
 * 
 * Features:
 * - Sticky in footer (bottom-0)
 * - Smooth transitions
 * - Previous/Next product
 * - Touch-friendly voor mobiel
 */

interface ProductNavigationProps {
  currentProduct: Product;
}

export function ProductNavigation({ currentProduct }: ProductNavigationProps) {
  const [prevProduct, setPrevProduct] = useState<Product | null>(null);
  const [nextProduct, setNextProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch adjacent products
  useEffect(() => {
    const fetchAdjacentProducts = async () => {
      try {
        const response = await fetch(`/api/v1/products?limit=100`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // ✅ DEFENSIVE: Handle both array and object responses
          const products = Array.isArray(data.data) ? data.data : [];
          
          if (products.length === 0) {
            console.warn('No products array in API response');
            setLoading(false);
            return;
          }
          
          const currentIndex = products.findIndex((p: Product) => p.id === currentProduct.id);
          
          if (currentIndex > 0) {
            setPrevProduct(products[currentIndex - 1]);
          }
          
          if (currentIndex < products.length - 1) {
            setNextProduct(products[currentIndex + 1]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch adjacent products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdjacentProducts();
  }, [currentProduct.id]);

  if (loading || (!prevProduct && !nextProduct)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-10 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Previous Product */}
          {prevProduct ? (
            <Link
              href={`/product/${prevProduct.slug}`}
              className="flex items-center gap-3 flex-1 group transition-all duration-300 hover:bg-gray-50 rounded-lg p-3 -m-3"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white group-hover:bg-[#395162] transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs text-gray-500 font-light">Vorig product</p>
                <p className="text-sm font-normal text-gray-900 truncate group-hover:text-[#f76402] transition-colors">
                  {prevProduct.name}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {/* Divider */}
          {prevProduct && nextProduct && (
            <div className="hidden md:block w-px h-12 bg-gray-200" />
          )}

          {/* Next Product */}
          {nextProduct ? (
            <Link
              href={`/product/${nextProduct.slug}`}
              className="flex items-center gap-3 flex-1 group transition-all duration-300 hover:bg-gray-50 rounded-lg p-3 -m-3"
            >
              <div className="flex-1 min-w-0 text-right">
                <p className="text-xs text-gray-500 font-light">Volgend product</p>
                <p className="text-sm font-normal text-gray-900 truncate group-hover:text-[#f76402] transition-colors">
                  {nextProduct.name}
                </p>
              </div>
              <div className="flex-shrink-0 w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white group-hover:bg-[#395162] transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}

