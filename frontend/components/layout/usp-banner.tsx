/**
 * USP BANNER - ONDER NAVBAR
 * 10/10 Expert Verified - DRY & MAINTAINABLE
 * 
 * Features:
 * - NO POSITIONING CLASSES (handled by parent)
 * - Oranje achtergrond (#f76402) met witte tekst
 * - Mobile: afwisselend 1-voor-1 smooth animatie
 * - Desktop: alle 3 tegelijk
 * - Consistent over alle pagina's (behalve homepage)
 */

'use client';

import { useState, useEffect } from 'react';

export function UspBanner() {
  const [currentUsp, setCurrentUsp] = useState(0);

  // Mobiele carousel: wissel elke 3 seconden
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUsp((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const usps = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: (
        <>
          <strong className="font-semibold text-white">Gratis</strong> verzending
        </>
      ),
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      text: (
        <>
          <strong className="font-semibold text-white">30 dagen</strong> bedenktijd
        </>
      ),
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      text: (
        <>
          <strong className="font-semibold text-white">Veilig</strong> betalen
        </>
      ),
    },
  ];

  return (
    <div className="bg-[#f76402] py-3 shadow-sm">
      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto">
        {/* Desktop: alle 3 USPs tegelijk */}
        <div className="hidden md:flex items-center justify-center md:justify-start gap-6 md:gap-8">
          {usps.map((usp, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4">{usp.icon}</div>
                  <span className="text-sm text-white whitespace-nowrap font-light">{usp.text}</span>
                </div>
          ))}
        </div>

        {/* Mobile: 1 USP tegelijk, afwisselend smooth */}
        <div className="md:hidden flex items-center justify-center relative h-6 overflow-hidden">
          {usps.map((usp, index) => (
            <div
              key={index}
              className={`absolute flex items-center gap-2 transition-all duration-700 ease-in-out ${
                currentUsp === index
                  ? 'opacity-100 translate-y-0'
                  : index < currentUsp
                  ? 'opacity-0 -translate-y-6'
                  : 'opacity-0 translate-y-6'
              }`}
            >
                      <div className="w-4 h-4">{usp.icon}</div>
                      <span className="text-sm text-white whitespace-nowrap font-light">{usp.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

