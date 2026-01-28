'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { DESIGN_SYSTEM } from '@/lib/design-system';

/**
 * ✅ ERROR PAGE: Graceful error handling - toont altijd content
 * Zorgt dat gebruikers altijd kunnen navigeren, zelfs bij errors
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 🔒 SECURITY: Log errors server-side only, NOT in console
    if (typeof window === 'undefined') {
      console.error('Error:', error);
    }
  }, [error]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-white px-4"
      style={{
        fontFamily: DESIGN_SYSTEM.typography.fontFamily.body,
      }}
    >
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 
            className="text-4xl font-light text-gray-900 mb-4"
            style={{
              fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
            }}
          >
            Er is een probleem opgetreden
          </h1>
          <p className="text-gray-600 mb-2">
            We werken aan een oplossing. Je kunt doorgaan met winkelen.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors rounded-lg"
            style={{
              textDecoration: 'none',
            }}
          >
            Terug naar Home
          </Link>
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-lg"
          >
            Probeer opnieuw
          </button>
        </div>

        {/* ✅ NAVIGATIE: Altijd beschikbaar, zelfs zonder scripts */}
        <div className="pt-8 border-t border-gray-200">
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/producten" className="text-gray-600 hover:text-gray-900">Producten</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            <Link href="/over-ons" className="text-gray-600 hover:text-gray-900">Over Ons</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

