"use client";

/**
 * RAG CHAT POPUP - No hCaptcha
 * AI-powered chat met Ollama + RAG
 * Security: Rate limiting + input validation backend
 */

import { useState, useEffect } from "react";
import { Button } from "./button";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatPopup() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stickyCartVisible, setStickyCartVisible] = useState(false);

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

  // DEFENSIVE: Dynamic position om sticky cart conflict te voorkomen
  // z-index: 50 (boven sticky cart z-40, maar onder modals/lightbox)
  const buttonPosition = stickyCartVisible 
    ? 'bottom-[100px]' // Net boven sticky cart (±80px cart height + 20px margin)
    : 'bottom-6'; // Normaal

  return (
    <>
      {/* Chat Button - DEFENSIEF STICKY MET CONFLICT PREVENTIE */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed right-6 z-50 ${buttonPosition}
                   bg-gradient-to-br from-brand to-brand-dark text-white 
                   rounded-full p-4 shadow-2xl 
                   hover:scale-110 hover:shadow-brand/50
                   focus:outline-none focus:ring-4 focus:ring-brand/30
                   active:scale-95
                   transition-all duration-300 ease-out`}
        aria-label="Open chat"
        style={{ willChange: 'transform' }}
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Popup */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200 z-[110] md:bg-transparent md:pointer-events-none"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Chat Modal - RECHTS BENEDEN */}
          <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-[120] flex items-center justify-center md:items-end md:justify-end p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md max-h-[85vh] md:max-h-[600px] bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 fade-in duration-300 flex flex-col">
              
              {/* Header */}
              <div className="bg-gradient-to-br from-brand to-brand-dark p-6 rounded-t-2xl text-white">
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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
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
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
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

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Stel je vraag..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-6 rounded-xl"
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
