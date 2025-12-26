'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">Oeps!</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Er is iets misgegaan
        </h2>
        <p className="text-gray-600 mb-8">
          We konden de pagina niet laden. Probeer het opnieuw of ga terug naar de homepage.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#f76402] text-white rounded-md hover:bg-[#e55a02] transition-colors"
          >
            Probeer opnieuw
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}

