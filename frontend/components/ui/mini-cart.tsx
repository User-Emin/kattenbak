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
import { COMPONENT_COLORS } from '@/lib/theme-colors';
import { SHARED_CONTENT } from '@/lib/content.config';

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
      <div className={`p-8 text-center ${COMPONENT_COLORS.sidebar.bg}`}>
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600 mb-4">Je winkelwagen is leeg</p>
        <Button variant="outline" onClick={() => handleNavigate('/')}>
          Verder winkelen
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${COMPONENT_COLORS.sidebar.bg}`}>
      {/* Scrollable items section */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className={`text-xl font-normal mb-6 ${COMPONENT_COLORS.sidebar.text}`}>Winkelwagen ({itemCount})</h2>
        
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
                <h3 className={`font-medium text-sm mb-1 truncate ${COMPONENT_COLORS.sidebar.text}`}>
                  {item.product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {formatPrice(item.product.price)}
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className={`w-9 h-9 rounded-lg border-2 ${COMPONENT_COLORS.sidebar.border} hover:border-gray-400 flex items-center justify-center hover:bg-gray-100 transition active:scale-95 ${COMPONENT_COLORS.sidebar.text}`}
                    aria-label="Verlaag aantal"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  
                  <span className={`w-10 text-center text-base font-semibold ${COMPONENT_COLORS.sidebar.text}`}>
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className={`w-9 h-9 rounded-lg border-2 ${COMPONENT_COLORS.sidebar.border} hover:border-gray-400 flex items-center justify-center hover:bg-gray-100 transition active:scale-95 ${COMPONENT_COLORS.sidebar.text}`}
                    aria-label="Verhoog aantal"
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => removeItem(item.product.id)}
                className={`text-gray-400 hover:${COMPONENT_COLORS.sidebar.text} transition`}
                aria-label="Verwijder uit winkelwagen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed footer with buttons - altijd zichtbaar */}
      <div className={`flex-shrink-0 ${COMPONENT_COLORS.sidebar.bg} border-t ${COMPONENT_COLORS.sidebar.border}`}>
        <div className="p-6 pt-5">
          <div className="flex justify-between items-center mb-5">
            <span className={`font-semibold ${COMPONENT_COLORS.sidebar.text} text-lg`}>Subtotaal</span>
            <span className={`text-2xl font-medium ${COMPONENT_COLORS.sidebar.text}`}>{formatPrice(subtotal)}</span>
          </div>
          
          <div className="space-y-3">
            <Button 
              size="lg" 
              fullWidth 
              className={COMPONENT_COLORS.sidebar.button}
              onClick={() => handleNavigate('/cart')}
            >
              {SHARED_CONTENT.buttons.viewCart}
            </Button>
            
            <Button 
              size="lg" 
              fullWidth 
              className={COMPONENT_COLORS.sidebar.ctaButton}
              onClick={() => handleNavigate(`/checkout?product=${items[0].product.id}&quantity=${items[0].quantity}`)}
            >
              {SHARED_CONTENT.buttons.checkout}
            </Button>
          </div>
          
          <p className={`text-xs text-gray-500 text-center mt-4`}>
            Verzendkosten worden berekend bij checkout
          </p>
        </div>
      </div>
    </div>
  );
};
