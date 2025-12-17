"use client";

import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { ProductImage } from './product-image';
import { formatPrice } from '@/lib/utils';
import { getProductImage } from '@/lib/image-config';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Separator } from './separator';

interface MiniCartProps {
  onClose?: () => void;
}

export const MiniCart = ({ onClose }: MiniCartProps) => {
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const router = useRouter();

  // DRY Handler voor navigatie met auto-close - Maintainable
  const handleNavigate = (path: string) => {
    if (onClose) {
      onClose(); // Sluit de mini-cart
    }
    router.push(path); // Navigeer naar pagina
  };

  if (itemCount === 0) {
    return (
      <div className="p-8 text-center">
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600 mb-4">Je winkelwagen is leeg</p>
        <Button variant="outline" onClick={() => handleNavigate('/')}>
          Verder winkelen
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Scrollable items section */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xl font-semibold mb-6">Winkelwagen ({itemCount})</h2>
        
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4">
              <div className="relative w-20 h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                <ProductImage
                  src={getProductImage(item.product.images)}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 truncate">
                  {item.product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  {formatPrice(item.product.price)}
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                    aria-label="Verlaag aantal"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                    aria-label="Verhoog aantal"
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => removeItem(item.product.id)}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Verwijder uit winkelwagen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed footer with buttons - altijd zichtbaar */}
      <div className="flex-shrink-0 bg-white border-t-2 border-gray-200">
        <Separator variant="float" spacing="sm" />
        
        <div className="p-6 pt-4">
          <div className="flex justify-between items-center mb-5">
            <span className="font-semibold text-gray-900 text-lg">Subtotaal</span>
            <span className="text-2xl font-medium text-gray-900">{formatPrice(subtotal)}</span>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              size="lg" 
              fullWidth 
              className="font-medium"
              onClick={() => handleNavigate('/cart')}
            >
              Bekijk Winkelwagen
            </Button>
            
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth 
              className="font-semibold"
              onClick={() => handleNavigate(`/checkout?product=${items[0].product.id}&quantity=${items[0].quantity}`)}
            >
              Bestelling Afronden
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Verzendkosten worden berekend bij checkout
          </p>
        </div>
      </div>
    </div>
  );
};
