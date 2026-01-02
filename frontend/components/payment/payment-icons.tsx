import React from 'react';

/**
 * OFFICIAL PAYMENT LOGOS - DIRECT IMG TAGS (NO NEXT.JS OPTIMIZATION)
 * Real brand logos from /public/logos/ folder
 * - ideal.png (54K, 1040x1040 PNG)
 * - paypal.jpg (3.5K, 226x142 JPEG)
 * 
 * Using direct <img> tags to avoid Next.js image optimization issues
 */

export const PaymentIcons = {
  /**
   * iDEAL - Official Logo
   */
  iDEAL: () => (
    <img
      src="/logos/ideal.png"
      alt="iDEAL"
      className="h-8 w-auto object-contain"
      loading="eager"
    />
  ),

  /**
   * PayPal - Official Logo
   */
  PayPal: () => (
    <img
      src="/logos/paypal.jpg"
      alt="PayPal"
      className="h-8 w-auto object-contain"
      loading="eager"
    />
  ),
};

/**
 * Payment Method Icon Component
 */
interface PaymentMethodIconProps {
  method: 'ideal' | 'paypal';
  className?: string;
}

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({ method, className = '' }) => {
  const Icon = {
    ideal: PaymentIcons.iDEAL,
    paypal: PaymentIcons.PayPal,
  }[method];

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Icon />
    </div>
  );
};

/**
 * Payment Methods Display Component (Compact)
 */
interface PaymentMethodsDisplayProps {
  methods?: ('ideal' | 'paypal')[];
  className?: string;
}

export const PaymentMethodsDisplay: React.FC<PaymentMethodsDisplayProps> = ({ 
  methods = ['ideal', 'paypal'],
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 mr-2">We accepteren:</span>
      <div className="flex items-center gap-1.5">
        {methods.map((method) => (
          <div 
            key={method}
            className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <PaymentMethodIcon method={method} />
          </div>
        ))}
      </div>
    </div>
  );
};


