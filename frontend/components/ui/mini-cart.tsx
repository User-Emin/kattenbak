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
import { DESIGN_SYSTEM } from '@/lib/design-system';

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
        <Button variant="outline" className="border-2 border-gray-300 hover:border-accent px-6" onClick={() => handleNavigate('/')}>
          Verder winkelen
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${COMPONENT_COLORS.sidebar.bg}`}>
      {/* ✅ MOBIEL: Scrollable items section met extra bottom padding zodat items niet onder overzicht vallen */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${DESIGN_SYSTEM.layout.sidebar?.itemsPaddingBottom ?? ''}`}>
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
                    className={`w-9 h-9 ${DESIGN_SYSTEM.button.borderRadius} border-2 ${COMPONENT_COLORS.sidebar.border} hover:border-accent flex items-center justify-center hover:bg-gray-100 transition active:scale-95 ${COMPONENT_COLORS.sidebar.text}`}
                    aria-label="Verlaag aantal"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  
                  <span className={`w-10 text-center text-base font-semibold ${COMPONENT_COLORS.sidebar.text}`}>
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className={`w-9 h-9 ${DESIGN_SYSTEM.button.borderRadius} border-2 ${COMPONENT_COLORS.sidebar.border} hover:border-accent flex items-center justify-center hover:bg-gray-100 transition active:scale-95 ${COMPONENT_COLORS.sidebar.text}`}
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

      {/* ✅ MOBIEL: Fixed footer met optimale padding */}
      <div className={`flex-shrink-0 ${DESIGN_SYSTEM.layout.sidebar?.footerSticky ?? ''} ${COMPONENT_COLORS.sidebar.bg} border-t ${COMPONENT_COLORS.sidebar.border} ${DESIGN_SYSTEM.layout.sidebar?.footerPadding ?? 'p-4 sm:p-6'} ${DESIGN_SYSTEM.layout.sidebar?.footerPaddingTop ?? 'pt-4 sm:pt-5'} ${DESIGN_SYSTEM.layout.sidebar?.footerSafeAreaPadding ?? ''}`}>
        {/* Overzicht Section - Direct op achtergrond */}
        <div className="space-y-2 mb-5">
          <h3 className={`font-semibold ${COMPONENT_COLORS.sidebar.text} text-base mb-3`}>Overzicht</h3>
          
          {/* Subtotaal */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Subtotaal</span>
            <span className={`font-medium ${COMPONENT_COLORS.sidebar.text}`}>{formatPrice(subtotal)}</span>
          </div>
          
          {/* Verzendkosten */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Verzendkosten</span>
            <span className="text-sm font-medium text-green-600">Gratis</span>
          </div>
          
          <Separator className="my-3" />
          
          {/* Totaal - DRY: Prijzen zijn INCL. BTW */}
          <div className="flex justify-between items-center">
            <span className={`font-bold ${COMPONENT_COLORS.sidebar.text} text-lg`}>Totaal</span>
            <span className={`text-2xl font-bold ${COMPONENT_COLORS.sidebar.text}`}>{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-gray-500 text-right mt-1">Incl. 21% BTW ({formatPrice(subtotal - (subtotal / 1.21))})</p>
        </div>
        
        {/* Buttons - Oranje met witte tekst */}
        <div className="space-y-3">
            <Button 
              size="lg" 
              fullWidth 
              variant="outline"
              className="border-2 border-gray-300 hover:border-accent bg-white text-gray-900 font-semibold"
              onClick={() => handleNavigate('/cart')}
            >
              {SHARED_CONTENT.buttons.viewCart}
            </Button>
          
          {/* ✅ ORANJE BUTTON MET WITTE TEKST - Gebruik CTA variant */}
          <Button 
            size="lg" 
            fullWidth 
            variant="cta"
            onClick={() => handleNavigate(`/checkout?product=${items[0].product.id}&quantity=${items[0].quantity}`)}
          >
            {SHARED_CONTENT.buttons.checkout}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Gratis verzending • 30 dagen bedenktijd
        </p>
      </div>
    </div>
  );
};
