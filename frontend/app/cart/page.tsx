"use client";

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { getProductImage } from '@/lib/image-config';
import { X, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <ShoppingCart className="h-20 w-20 mx-auto mb-6 text-gray-300" />
          <h1 className="text-3xl font-semibold mb-4 text-gray-900">Je winkelwagen is leeg</h1>
          <p className="text-gray-600 mb-8">
            Ontdek onze premium zelfreinigende kattenbak
          </p>
          <Link href="/">
            <Button size="lg" className="bg-[#f76402] hover:bg-[#e55a02] text-white font-semibold px-8 rounded-md" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Verder Winkelen
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // DRY: Nederlandse consumentenprijzen zijn INCLUSIEF BTW
  // Subtotal van cart = som van alle product.price (incl. BTW)
  const shipping = subtotal >= 50 ? 0 : 5.95;
  
  // BTW berekening: uit INCLUSIEF prijs halen
  const total = subtotal + shipping; // Eindprijs
  const priceExclVAT = total / 1.21; // Prijs excl. BTW
  const tax = total - priceExclVAT; // BTW bedrag

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <h1 className="text-4xl font-semibold mb-2">Winkelwagen</h1>
        <p className="text-gray-600 mb-8">{itemCount} {itemCount === 1 ? 'product' : 'producten'}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => (
              <div key={item.product.id}>
                <div className="flex gap-3 sm:gap-6">
                  {/* COMPACT IMAGE */}
                  <div className="relative w-20 h-20 sm:w-32 sm:h-32 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                    <ProductImage
                      src={getProductImage(item.product.images)}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* HEADER - compact op mobiel */}
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h2 className="text-base sm:text-xl font-semibold mb-1 truncate">
                          {item.product.name}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                          {formatPrice(item.product.price)} per stuk
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-400 hover:text-gray-600 transition p-1 sm:p-2 flex-shrink-0"
                        aria-label="Verwijder"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>

                    {/* QUANTITY + PRICE - responsive */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded border-2 border-gray-300 hover:border-accent flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>

                        <span className="w-10 sm:w-12 text-center font-semibold text-base sm:text-lg">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded border-2 border-gray-300 hover:border-accent flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>

                      <p className="text-base sm:text-xl font-semibold">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>

                {index < items.length - 1 && (
                  <Separator variant="float" spacing="md" />
                )}
              </div>
            ))}
          </div>

          {/* Order Summary - Direct in achtergrond zoals USPs */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Overzicht</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotaal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Verzendkosten</span>
                  <span className="font-medium">{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                </div>
              </div>

              <Separator variant="float" spacing="sm" />

              <div className="space-y-1 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Totaal</span>
                  <span className="text-2xl font-semibold">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-500 text-right">Incl. 21% BTW ({formatPrice(tax)})</p>
              </div>

              <Link href={`/checkout?product=${items[0].product.id}&quantity=${items[0].quantity}`}>
                <Button className="w-full bg-[#f76402] hover:bg-[#e55a02] text-white font-semibold py-3 px-6 rounded-md flex items-center justify-center gap-2" size="lg">
                  <span>Afrekenen</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <p className="text-xs text-gray-500 text-center mt-4">
                Geen account nodig - direct afrekenen als gast
              </p>

              <Separator variant="float" spacing="md" />

              <div className="text-sm font-semibold text-gray-700 space-y-2">
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
