'use client';

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { PaymentMethodIcon } from './payment-icons';

/**
 * SMOOTH COLLAPSIBLE PAYMENT SELECTOR
 * Designvol, minimalistic, elegant
 */

export type PaymentMethodType = 'ideal' | 'paypal';

interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: PaymentMethodType;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'ideal',
    name: 'iDEAL',
    description: 'Direct betalen via je bank',
    icon: 'ideal',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Betaal met je PayPal account',
    icon: 'paypal',
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
  className?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedPayment = PAYMENT_METHODS.find(m => m.id === selectedMethod) || PAYMENT_METHODS[0];

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-base font-medium text-gray-900 mb-3">Betaalmethode</h3>
      
      {/* Selected Method Display (Collapsible Trigger) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      >
        {/* Logo */}
        <div className="flex-shrink-0">
          <PaymentMethodIcon method={selectedPayment.icon} className="h-8" />
        </div>
        
        {/* Info */}
        <div className="flex-1 text-left">
          <p className="font-medium text-gray-900 text-sm">{selectedPayment.name}</p>
          <p className="text-xs text-gray-500">{selectedPayment.description}</p>
        </div>
        
        {/* Expand Icon */}
        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible Options */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-1 pt-1">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                onMethodChange(method.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150 ${
                selectedMethod === method.id
                  ? 'bg-accent/5 border border-accent/30'
                  : 'bg-gray-50 border border-transparent hover:bg-gray-100'
              }`}
            >
              {/* Logo */}
              <div className="flex-shrink-0">
                <PaymentMethodIcon method={method.icon} className="h-7" />
              </div>
              
              {/* Info */}
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 text-sm">{method.name}</p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
              
              {/* Check */}
              {selectedMethod === method.id && (
                <Check className="h-5 w-5 text-accent flex-shrink-0" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <span>Veilig betalen via Mollie</span>
      </div>
    </div>
  );
};

/**
 * Compact Payment Methods Display (for summary/footer)
 */
interface CompactPaymentMethodsProps {
  className?: string;
}

export const CompactPaymentMethods: React.FC<CompactPaymentMethodsProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 mr-2">We accepteren:</span>
      <div className="flex items-center gap-1.5">
        {(['ideal', 'paypal'] as const).map((method) => (
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


