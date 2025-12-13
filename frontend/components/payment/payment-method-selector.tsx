'use client';

import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { PaymentMethodIcon } from './payment-icons';

/**
 * Payment Method Selection Component
 * DRY, Reusable, Enterprise-grade
 */

export type PaymentMethodType = 'ideal' | 'creditcard' | 'paypal' | 'bancontact' | 'sepa';

interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: PaymentMethodType;
  enabled: boolean;
  popular?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
  availableMethods?: PaymentMethodType[];
  className?: string;
}

const DEFAULT_METHODS: PaymentMethod[] = [
  {
    id: 'ideal',
    name: 'iDEAL',
    description: 'Betaal direct via je bank',
    icon: 'ideal',
    enabled: true,
    popular: true,
  },
  {
    id: 'creditcard',
    name: 'Credit Card',
    description: 'Visa, Mastercard, American Express',
    icon: 'creditcard',
    enabled: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Betaal via PayPal account',
    icon: 'paypal',
    enabled: true,
  },
  {
    id: 'bancontact',
    name: 'Bancontact',
    description: 'Belgische betaalmethode',
    icon: 'bancontact',
    enabled: true,
  },
  {
    id: 'sepa',
    name: 'SEPA Overboeking',
    description: 'Direct overboeking',
    icon: 'sepa',
    enabled: true,
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  availableMethods,
  className = '',
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>(DEFAULT_METHODS);

  useEffect(() => {
    // Filter methods based on availability
    if (availableMethods && availableMethods.length > 0) {
      setMethods(
        DEFAULT_METHODS.map((method) => ({
          ...method,
          enabled: availableMethods.includes(method.id),
        }))
      );
    }
  }, [availableMethods]);

  const enabledMethods = methods.filter((m) => m.enabled);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Betaalmethode</h3>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-gray-600">Veilig betalen</span>
        </div>
      </div>

      {enabledMethods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onMethodChange(method.id)}
          disabled={!method.enabled}
          className={`
            w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
            ${
              selectedMethod === method.id
                ? 'border-accent bg-accent/5 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }
            ${!method.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Icon */}
          <div
            className={`
            flex-shrink-0 w-16 h-12 flex items-center justify-center rounded-lg border
            ${
              selectedMethod === method.id
                ? 'border-accent/30 bg-white'
                : 'border-gray-200 bg-gray-50'
            }
          `}
          >
            <PaymentMethodIcon method={method.icon} className="h-8" />
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">{method.name}</p>
              {method.popular && (
                <span className="px-2 py-0.5 text-xs font-medium bg-accent text-white rounded-full">
                  Populair
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{method.description}</p>
          </div>

          {/* Selection Indicator */}
          <div
            className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${
              selectedMethod === method.id
                ? 'border-accent bg-accent'
                : 'border-gray-300 bg-white'
            }
          `}
          >
            {selectedMethod === method.id && (
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            )}
          </div>
        </button>
      ))}

      {/* Trust Badges */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>256-bit SSL encryptie</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-[#ff6c00]">Mollie</span>
          </div>
        </div>
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
        {(['ideal', 'creditcard', 'paypal', 'sepa'] as const).map((method) => (
          <div
            key={method}
            className="flex items-center justify-center w-10 h-7 bg-white border border-gray-200 rounded"
          >
            <PaymentMethodIcon method={method} className="h-4" />
          </div>
        ))}
      </div>
    </div>
  );
};
