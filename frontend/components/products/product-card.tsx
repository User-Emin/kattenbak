"use client";

import React from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { getProductImage } from "@/lib/image-config";
import { Product } from "@/types/product";
import { ShoppingCart, Star } from "lucide-react";

/**
 * Product Card Component - Modern Design
 * Maximaal dynamisch met hover effects
 */

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = React.useState(false);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    if (onAddToCart) {
      await onAddToCart(product);
    }
    
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <Card hover className="group relative overflow-hidden h-full flex flex-col rounded-xl bg-white shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 transform hover:-translate-y-2">
      <Link href={`/product/${product.slug}`} className="flex-1 flex flex-col">
        {/* Image Container - ✅ PREMIUM: Modern card styling */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <ProductImage
            src={getProductImage(product.images)}
            alt={product.name}
            fill
            className="transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {hasDiscount && (
              <div className="bg-accent text-white text-sm font-bold px-3 py-1.5 shadow-lg animate-scale-in">
                -{discountPercentage}%
              </div>
            )}
            {product.isFeatured && (
              <div className="bg-primary text-white text-xs font-medium px-3 py-1.5 shadow-lg flex items-center gap-1">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span>Featured</span>
              </div>
            )}
          </div>
          
          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div 
              className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(60, 60, 61, 0.6) 0%, rgba(122, 122, 125, 0.6) 100%)', // ✅ GRADIENT met opacity (was bg-black/60)
              }}
            >
              <span className="bg-white text-foreground px-6 py-3 font-bold shadow-xl">
                Tijdelijk uitverkocht
              </span>
            </div>
          )}
        </div>

        {/* Content - ✅ PREMIUM: Modern spacing en typography */}
        <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-[#3071aa] uppercase tracking-wider font-semibold mb-3">
              {product.category.name}
            </p>
          )}

          {/* Product name - ✅ PREMIUM: Moderner typography */}
          <h3 className="font-light text-xl sm:text-2xl mb-3 line-clamp-2 group-hover:text-[#3071aa] transition-colors duration-300 leading-tight">
            {product.name}
          </h3>

          {/* Short description - ✅ PREMIUM: Groter, leesbaarder */}
          {product.shortDescription && (
            <p className="text-sm sm:text-base text-gray-600 mb-6 line-clamp-2 flex-1 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Price - ✅ PREMIUM: Moderner styling */}
          <div className="flex items-baseline gap-3 mt-auto">
            <span className="text-2xl sm:text-3xl font-light text-gray-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer with CTA - ✅ PREMIUM: Modern button */}
        <CardFooter className="p-6 sm:p-8 pt-0">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className="relative overflow-hidden group w-full px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold rounded-lg text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              backgroundColor: product.stock === 0 ? '#9ca3af' : '#3071aa',
            }}
            onMouseEnter={(e) => {
              if (product.stock > 0 && !isAdding) {
                e.currentTarget.style.backgroundColor = '#256394';
              }
            }}
            onMouseLeave={(e) => {
              if (product.stock > 0 && !isAdding) {
                e.currentTarget.style.backgroundColor = '#3071aa';
              }
            }}
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Toevoegen...
              </span>
            ) : product.stock === 0 ? (
              "Uitverkocht"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Winkelwagen
              </span>
            )}
          </button>
        </CardFooter>
      </Link>
    </Card>
  );
}

