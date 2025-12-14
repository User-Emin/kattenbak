import React from 'react';
import Image from 'next/image';

/**
 * OFFICIAL PAYMENT LOGOS - FROM DOWNLOADS
 * Real brand logos from /Downloads folder
 * - ideal-logo-1024.png → /public/logos/ideal.png
 * - pp_cc_mark_111x69.jpg → /public/logos/paypal.jpg
 */

export const PaymentIcons = {
  /**
   * iDEAL - Official Logo (from Downloads)
   */
  iDEAL: () => (
    <Image
      src="/logos/ideal.png"
      alt="iDEAL"
      width={100}
      height={40}
      className="h-8 w-auto object-contain"
      priority
    />
  ),

  /**
   * PayPal - Official Logo (from Downloads)
   */
  PayPal: () => (
    <Image
      src="/logos/paypal.jpg"
      alt="PayPal"
      width={111}
      height={69}
      className="h-8 w-auto object-contain"
      priority
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


