'use client';

import React, { Component, ReactNode } from 'react';
import Link from 'next/link';
import { DESIGN_SYSTEM } from '@/lib/design-system';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ✅ ERROR BOUNDARY: Vangt alle React errors op en toont altijd content
 * Zorgt dat de pagina NOOIT leeg is, zelfs bij script errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // ✅ SECURITY: Log errors server-side only
    if (typeof window === 'undefined') {
      console.error('ErrorBoundary caught error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // ✅ FALLBACK: Toon altijd content, zelfs bij errors
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // ✅ DEFAULT FALLBACK: Graceful error UI met navigatie
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                onClick={this.handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-lg"
              >
                Probeer opnieuw
              </button>
            </div>

            {/* ✅ NAVIGATIE: Altijd beschikbaar, zelfs zonder scripts */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <nav className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                <Link href="/producten" className="text-gray-600 hover:text-gray-900">Producten</Link>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              </nav>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
