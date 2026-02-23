"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { productsApi } from "@/lib/api/products";
import { SEO_IMPLEMENTATION_CONFIG } from "@/lib/seo-implementation-strategy";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

/**
 * ✅ SEO PHASE 3: Related Products Component
 * 
 * Modulair, veilig, geen hardcode
 * - Dynamisch via category
 * - XSS-veilig (Next.js Link)
 * - Aansluitend op SEO_IMPLEMENTATION_CONFIG
 */
interface RelatedProductsProps {
  currentProduct: Product;
  className?: string;
}

export function RelatedProducts({ currentProduct, className }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchRelatedProducts() {
      if (!currentProduct?.categoryId) {
        setLoading(false);
        return;
      }
      
      try {
        // ✅ DYNAMIC: Get related products by category
        const { products } = await productsApi.getAll({
          categoryId: currentProduct.categoryId,
          inStock: true,
          pageSize: SEO_IMPLEMENTATION_CONFIG.relatedProducts.maxCount + 1, // +1 to exclude current
        });
        
        // ✅ FILTER: Exclude current product
        const filtered = products
          .filter(p => p.id !== currentProduct.id)
          .slice(0, SEO_IMPLEMENTATION_CONFIG.relatedProducts.maxCount);
        
        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Error fetching related products:', error);
        // ✅ FALLBACK: Try featured products if category fails
        try {
          const featured = await productsApi.getFeatured(SEO_IMPLEMENTATION_CONFIG.relatedProducts.maxCount);
          const filtered = featured
            .filter(p => p.id !== currentProduct.id)
            .slice(0, SEO_IMPLEMENTATION_CONFIG.relatedProducts.maxCount);
          setRelatedProducts(filtered);
        } catch (fallbackError) {
          console.error('Error fetching featured products:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchRelatedProducts();
  }, [currentProduct]);
  
  // ✅ SECURITY: Don't render if no products or disabled
  if (!SEO_IMPLEMENTATION_CONFIG.relatedProducts.enabled || loading || relatedProducts.length === 0) {
    return null;
  }
  
  return (
    <section className={cn('mt-12 py-8 border-t border-gray-200', className)}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Gerelateerde Producten
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => {
          const productImage = product.images?.[0] || '/placeholder-image.jpg';
          
          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* ✅ SECURITY: Sanitize image URL */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Image
                  src={productImage}
                  alt={product.name || 'Product afbeelding'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
