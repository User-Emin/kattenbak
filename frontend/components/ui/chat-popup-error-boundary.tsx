'use client';

/**
 * ERROR BOUNDARY FOR CHAT POPUP
 * Prevents entire page crash when chat component has errors
 * Security: Generic error messages, no stack traces exposed
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ChatPopupErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // ✅ SECURITY: Log errors server-side only (not in browser console)
    if (typeof window === 'undefined') {
      console.error('ChatPopup Error:', error, errorInfo);
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
      // ✅ SECURITY: Generic error UI (no stack traces, no sensitive info)
      return (
        <div className="fixed bottom-6 right-6 z-[100]">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Chat niet beschikbaar
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  De chatfunctie is tijdelijk niet beschikbaar. Probeer het later opnieuw.
                </p>
                <button
                  onClick={this.handleReset}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Opnieuw proberen
                </button>
              </div>
              <button
                onClick={this.handleReset}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                aria-label="Sluiten"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
