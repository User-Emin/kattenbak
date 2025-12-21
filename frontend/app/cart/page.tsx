"use client";

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { getProductImage } from '@/lib/image-config';
import { X, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch - wacht tot client-side gemount is
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tijdens SSR of mounting, toon loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-20 w-20 mx-auto mb-4 text-gray-300 animate-pulse" />
          <p className="text-gray-600">Winkelwagen laden...</p>
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <ShoppingCart className="h-20 w-20 mx-auto mb-6 text-gray-300" />
          <h1 className="text-3xl font-light mb-4 text-gray-900">Je winkelwagen is leeg</h1>
          <p className="text-gray-600 mb-8">
            Ontdek onze premium zelfreinigende kattenbak
          </p>
          <Link href="/">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Verder Winkelen
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= 50 ? 0 : 5.95;
  const tax = (subtotal + shipping) * 0.21;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="container mx-auto px-4 lg:px-12 max-w-6xl">
        <h1 className="text-3xl font-normal mb-2">Winkelwagen</h1>
        <p className="text-gray-600 mb-6">{itemCount} {itemCount === 1 ? 'product' : 'producten'}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items - Compacter */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div key={item.product.id}>
                <div className="flex gap-4">
                  {/* Smaller image on mobile */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                    <ProductImage
                      src={getProductImage(item.product.images)}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h2 className="text-base md:text-lg font-normal mb-1 truncate">
                          {item.product.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.product.price)} per stuk
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                        aria-label="Verwijder"
                      >
                        <X className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Compacter quantity selector */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="w-8 text-center font-medium text-sm">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-lg md:text-xl font-light">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>

                {index < items.length - 1 && (
                  <Separator variant="float" spacing="sm" />
                )}
              </div>
            ))}
          </div>

          {/* Order Summary - Compacter */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-8">
              <h2 className="text-lg font-normal mb-4">Overzicht</h2>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotaal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Verzendkosten</span>
                  <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">BTW (21%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              <Separator variant="float" spacing="sm" />

              <div className="flex justify-between items-center mb-5">
                <span className="text-base font-medium">Totaal</span>
                <span className="text-xl font-light">{formatPrice(total)}</span>
              </div>

              <Link href={items[0] ? `/checkout?product=${items[0].product.id}&quantity=${items[0].quantity}` : '/checkout'}>
                <button className="w-full px-6 py-3.5 bg-gradient-to-br from-cart to-cart-hover text-white font-bold rounded transition text-base flex items-center justify-center gap-2 hover:shadow-cart">
                  Afrekenen
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>

              <p className="text-xs text-gray-500 text-center mt-3">
                Geen account nodig
              </p>

              <Separator variant="float" spacing="sm" />

              <div className="text-xs text-gray-600 space-y-1.5">
                <p>✓ Gratis verzending vanaf €50</p>
                <p>✓ Veilig betalen met Mollie</p>
                <p>✓ 14 dagen bedenktijd</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
