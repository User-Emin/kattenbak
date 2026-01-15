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
    <Card hover className="group overflow-hidden h-full flex flex-col">
      <Link href={`/product/${product.slug}`} className="flex-1 flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <ProductImage
            src={getProductImage(product.images)}
            alt={product.name}
            fill
            className="transition-transform duration-500 group-hover:scale-110"
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

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-accent uppercase tracking-wider font-semibold mb-2">
              {product.category.name}
            </p>
          )}

          {/* Product name */}
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-accent transition-colors leading-tight">
            {product.name}
          </h3>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer with CTA */}
        <CardFooter className="p-5 pt-0">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            loading={isAdding}
            leftIcon={!isAdding && product.stock > 0 ? <ShoppingCart className="w-4 h-4" /> : undefined}
          >
            {product.stock === 0 ? "Uitverkocht" : "In Winkelwagen"}
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}

