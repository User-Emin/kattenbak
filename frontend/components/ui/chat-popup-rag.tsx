"use client";

/**
 * RAG CHAT POPUP - Alleen op Home & Product Detail
 * AI-powered chat met Ollama + RAG
 * Security: Rate limiting + input validation backend
 */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatPopup() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stickyCartVisible, setStickyCartVisible] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  // CONDITIONAL RENDERING: Alleen op home (/) en productdetail (/product/*)
  const isHomePage = pathname === '/';
  const isProductPage = pathname?.startsWith('/product/') || false;
  const shouldShowChat = isHomePage || isProductPage;

  // Monitor cart sidebar state
  useEffect(() => {
    const checkCartSidebar = () => {
      const isOpen = document.body.hasAttribute('data-cart-open');
      setIsCartSidebarOpen(isOpen);
    };

    // Initial check
    checkCartSidebar();

    // Observer voor attribute changes
    const observer = new MutationObserver(checkCartSidebar);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['data-cart-open'] 
    });

    return () => observer.disconnect();
  }, []);

  // Niet renderen als niet op toegestane pagina OF als cart sidebar open is
  if (!shouldShowChat || isCartSidebarOpen) {
    return null;
  }

  // POSITIONERING: Home = hoek (bottom-6), ProductDetail = boven sticky cart (bottom-[85px])
  const buttonPosition = isProductPage ? 'bottom-[85px]' : 'bottom-6';

  // DEFENSIVE: Monitor sticky cart met ResizeObserver/MutationObserver (performanter dan polling)
  useEffect(() => {
    const checkStickyCart = () => {
      const stickyBar = document.querySelector('[data-sticky-cart]') as HTMLElement;
      if (stickyBar) {
        // Check if sticky bar has opacity-100 AND translate-y-0 (is visible)
        const computedStyle = window.getComputedStyle(stickyBar);
        const isVisible = computedStyle.opacity === '1' && computedStyle.transform === 'none';
        setStickyCartVisible(isVisible);
      } else {
        setStickyCartVisible(false);
      }
    };
    
    // Initial check
    checkStickyCart();

    // Observer voor class changes (meer performant dan setInterval)
    const stickyBar = document.querySelector('[data-sticky-cart]');
    if (stickyBar) {
      const observer = new MutationObserver(checkStickyCart);
      observer.observe(stickyBar, { 
        attributes: true, 
        attributeFilter: ['class', 'style'] 
      });

      // Fallback: scroll listener (lightweight)
      const handleScroll = () => checkStickyCart();
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
      };
    }

    return () => {};
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Er ging iets mis');
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.data.answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Kon geen antwoord krijgen. Probeer het opnieuw.');
      
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button - ROND SMOOTH MET RIPPLE EFFECT */}
      <div className={`fixed right-6 z-50 ${buttonPosition}`}>
        {/* Pulse rings */}
        {!isExpanded && (
          <>
            <div className="absolute inset-0 rounded-full bg-brand/20 animate-ping" 
                 style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 rounded-full bg-brand/10 animate-ping" 
                 style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
          </>
        )}
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative w-16 h-16
                     bg-gradient-to-br from-brand to-brand-dark text-white 
                     rounded-full shadow-xl 
                     hover:scale-105 hover:shadow-2xl hover:shadow-brand/40
                     focus:outline-none focus:ring-4 focus:ring-brand/30
                     active:scale-95
                     transition-all duration-200 ease-out
                     flex items-center justify-center group`}
          aria-label="Open AI chat"
          style={{ willChange: 'transform' }}
        >
          {isExpanded ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" />
                  ) : (
                    <svg
                      className="w-6 h-6 group-hover:scale-110 transition-transform duration-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            className="group-hover:stroke-[2.5]" />
                      <circle cx="8" cy="10" r="1" fill="currentColor" />
                      <circle cx="12" cy="10" r="1" fill="currentColor" />
                      <circle cx="16" cy="10" r="1" fill="currentColor" />
                    </svg>
                  )}
        </button>
      </div>

      {/* Chat Popup */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200 z-[110] md:bg-transparent md:pointer-events-none"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Chat Modal - RECHTS BENEDEN MET RONDERE BUBBLES */}
          <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-[120] flex items-center justify-center md:items-end md:justify-end p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md max-h-[85vh] md:max-h-[600px] bg-white rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 fade-in duration-300 flex flex-col">
              
              {/* Header - BLAUWE GRADIENT */}
              <div className="bg-gradient-to-br from-brand to-brand-dark p-6 rounded-t-3xl text-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">AI Assistent</h3>
                    <p className="text-sm text-white/90 mt-1">Stel me een vraag over onze kattenbak</p>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-white/80 hover:text-white transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-brand/30" />
                    <p className="text-sm">Stel een vraag over features, specificaties, of geschiktheid</p>
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => setInput("Hoeveel liter is de afvalbak?")}
                        className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm hover:bg-brand/5 transition-colors"
                      >
                        Hoeveel liter is de afvalbak?
                      </button>
                      <button
                        onClick={() => setInput("Heeft deze kattenbak een app?")}
                        className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm hover:bg-brand/5 transition-colors"
                      >
                        Heeft deze kattenbak een app?
                      </button>
                      <button
                        onClick={() => setInput("Is het veilig voor mijn kat?")}
                        className="block w-full text-left px-4 py-2 bg-white rounded-lg text-sm hover:bg-brand/5 transition-colors"
                      >
                        Is het veilig voor mijn kat?
                      </button>
                    </div>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-brand text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-xs opacity-60 mt-1 block">
                        {msg.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-3xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-brand" />
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              {/* Input - MOBILE ZOOM FIX */}
              <div className="p-4 bg-white border-t border-gray-200 rounded-b-3xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Stel je vraag..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-base"
                    style={{ fontSize: '16px' }}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-6 rounded-2xl"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by AI · Antwoorden op basis van productinformatie
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
