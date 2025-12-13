import React from 'react';

/**
 * Payment Method Icons - DRY Component
 * Enterprise-grade SVG icons voor betaalmethoden
 */

export const PaymentIcons = {
  iDEAL: () => (
    <svg viewBox="0 0 80 32" className="h-6 w-auto" fill="currentColor">
      <path d="M0 0h80v32H0z" fill="#CC0066"/>
      <path d="M12 8h4v16h-4z" fill="#FFF"/>
      <path d="M20 8h8c4.4 0 8 3.6 8 8s-3.6 8-8 8h-8V8zm4 4v8h4c2.2 0 4-1.8 4-4s-1.8-4-4-4h-4z" fill="#FFF"/>
      <path d="M40 8h12v4h-8v2h7v3h-7v3h8v4H40z" fill="#FFF"/>
      <path d="M56 8h4l6 16h-4l-1-3h-6l-1 3h-4l6-16zm2 3l-2 6h4l-2-6z" fill="#FFF"/>
      <path d="M68 8h4v12h6v4h-10z" fill="#FFF"/>
    </svg>
  ),

  PayPal: () => (
    <svg viewBox="0 0 124 33" className="h-6 w-auto" fill="currentColor">
      <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.468 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317z" fill="#003087"/>
      <path d="M90.765 13.075h-3.291a.95.95 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.95.95 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z" fill="#0070E0"/>
      <path d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317z" fill="#003087"/>
    </svg>
  ),

  SEPA: () => (
    <svg viewBox="0 0 80 32" className="h-6 w-auto" fill="currentColor">
      <rect width="80" height="32" rx="4" fill="#003399"/>
      <path d="M8 16a8 8 0 0 1 8-8c2.21 0 4.19.89 5.64 2.34l-2.83 2.83A4 4 0 1 0 20 16h-4a8 8 0 0 1-8 8z" fill="#FFF"/>
      <text x="28" y="22" fill="#FFF" fontSize="14" fontWeight="bold">SEPA</text>
    </svg>
  ),

  Mastercard: () => (
    <svg viewBox="0 0 48 32" className="h-6 w-auto">
      <circle cx="18" cy="16" r="12" fill="#EB001B"/>
      <circle cx="30" cy="16" r="12" fill="#F79E1B"/>
      <path d="M24 7.6c1.8 1.8 3 4.3 3 7.2s-1.2 5.4-3 7.2c-1.8-1.8-3-4.3-3-7.2s1.2-5.4 3-7.2z" fill="#FF5F00"/>
    </svg>
  ),

  Visa: () => (
    <svg viewBox="0 0 48 16" className="h-6 w-auto">
      <path d="M18.5 0l-4.2 15.7h3.3l4.2-15.7zm10.2 10.2c0-3-4.1-3.2-4-4.6 0-.4.4-.9 1.3-1 .4-.1 1.7-.2 3 .5l.5-2.5c-.7-.3-1.7-.5-2.9-.5-3.1 0-5.2 1.6-5.2 4 0 1.7 1.5 2.7 2.7 3.3 1.2.6 1.6 1 1.6 1.5 0 .8-.9 1.1-1.8 1.1-1.5 0-2.3-.2-3.5-.7l-.5 2.6c.8.4 2.2.7 3.7.7 3.3 0 5.5-1.6 5.5-4.1zM38.8 15.7h2.9L39.5 0h-2.6c-.6 0-1.1.3-1.3.9L30.8 15.7h3.3l.7-1.9h4.1l.4 1.9zm-3.6-4.6l1.7-4.7 1 4.7zm-13.5-11.1l-2.6 15.7h3.1l2.6-15.7z" fill="#1434CB"/>
    </svg>
  ),

  Bancontact: () => (
    <svg viewBox="0 0 80 32" className="h-6 w-auto" fill="currentColor">
      <rect width="80" height="32" rx="4" fill="#005498"/>
      <path d="M12 10h8c2.2 0 4 1.8 4 4s-1.8 4-4 4h-3v4h-5zm5 5h3c.6 0 1-.4 1-1s-.4-1-1-1h-3z" fill="#FFF"/>
      <path d="M28 10h8c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4v4h-4zm4 5h4c.6 0 1-.4 1-1s-.4-1-1-1h-4z" fill="#FFF"/>
      <path d="M44 10h5l3 6 3-6h5l-6 12z" fill="#FFF"/>
    </svg>
  ),

  Giropay: () => (
    <svg viewBox="0 0 80 32" className="h-6 w-auto" fill="currentColor">
      <rect width="80" height="32" rx="4" fill="#DD0020"/>
      <text x="8" y="22" fill="#FFF" fontSize="16" fontWeight="bold">giropay</text>
    </svg>
  ),

  Generic: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
      <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/>
      <path d="M2 10h20" strokeWidth="2"/>
    </svg>
  ),
};

/**
 * Payment Method Icon Component
 */
interface PaymentMethodIconProps {
  method: 'ideal' | 'paypal' | 'sepa' | 'creditcard' | 'mastercard' | 'visa' | 'bancontact' | 'giropay' | 'generic';
  className?: string;
}

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({ method, className = '' }) => {
  const Icon = {
    ideal: PaymentIcons.iDEAL,
    paypal: PaymentIcons.PayPal,
    sepa: PaymentIcons.SEPA,
    creditcard: PaymentIcons.Generic,
    mastercard: PaymentIcons.Mastercard,
    visa: PaymentIcons.Visa,
    bancontact: PaymentIcons.Bancontact,
    giropay: PaymentIcons.Giropay,
    generic: PaymentIcons.Generic,
  }[method] || PaymentIcons.Generic;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Icon />
    </div>
  );
};

/**
 * Payment Methods Display Component
 * Shows available payment methods with icons
 */
interface PaymentMethodsDisplayProps {
  methods?: string[];
  className?: string;
}

export const PaymentMethodsDisplay: React.FC<PaymentMethodsDisplayProps> = ({ 
  methods = ['ideal', 'paypal', 'creditcard', 'sepa'],
  className = '' 
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {methods.map((method) => (
        <div 
          key={method}
          className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <PaymentMethodIcon method={method as any} />
        </div>
      ))}
    </div>
  );
};
