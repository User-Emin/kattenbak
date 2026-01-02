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

  // Sticky cart detection
  useEffect(() => {
    const checkStickyCart = () => {
      const stickyBar = document.querySelector('[data-sticky-cart]') as HTMLElement;
      
      if (stickyBar) {
        const hasOpacity = stickyBar.classList.contains('opacity-100');
        const hasPointerEvents = !stickyBar.classList.contains('pointer-events-none');
        const isVisible = hasOpacity && hasPointerEvents;
        
        setStickyCartVisible(prev => prev !== isVisible ? isVisible : prev);
      } else {
        setStickyCartVisible(prev => prev !== false ? false : prev);
      }
    };
    
    // Poll every 100ms voor stabiele detectie
    const interval = setInterval(checkStickyCart, 100);
    checkStickyCart(); // Initial check
    
    return () => clearInterval(interval);
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
          query: userMessage.content
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Er ging iets mis');
      }
      
      // API returns answer directly in root, not in data.data (verified: 2025-12-27)
      const answer = data.answer || data.data?.answer || 'Geen antwoord ontvangen';
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: answer, // Secure: using validated answer from API
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

  // Calculate button position based on sticky cart
  const buttonBottomClass = stickyCartVisible 
    ? 'bottom-32 md:bottom-24' // 8rem = sticky cart height
    : 'bottom-8 md:bottom-8';

  return (
    <>
      {/* Floating Chat Button - ALWAYS VISIBLE */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed right-4 z-[100] ${buttonBottomClass} transition-all duration-300
                   bg-gradient-to-br from-brand to-brand-dark text-white 
                   rounded-full p-4 shadow-2xl hover:scale-110 hover:shadow-brand/50
                   focus:outline-none focus:ring-4 focus:ring-brand/30
                   active:scale-95`}
        aria-label="Open chat"
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
          
          {/* Chat Modal - Ronde hoeken zoals productdetail */}
          <div className="fixed inset-0 md:inset-auto md:bottom-32 md:right-8 z-[120] flex items-center justify-center md:items-end md:justify-end p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md max-h-[90vh] md:max-h-[600px] bg-white rounded-md shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 fade-in duration-300 flex flex-col">
              
              {/* Header */}
              <div className="bg-gradient-to-br from-brand to-brand-dark p-6 rounded-t-md text-white">
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
                        className="block w-full text-left px-4 py-2 bg-white rounded-md text-sm hover:bg-brand/5 transition-colors"
                      >
                        Hoeveel liter is de afvalbak?
                      </button>
                      <button
                        onClick={() => setInput("Heeft deze kattenbak een app?")}
                        className="block w-full text-left px-4 py-2 bg-white rounded-md text-sm hover:bg-brand/5 transition-colors"
                      >
                        Heeft deze kattenbak een app?
                      </button>
                      <button
                        onClick={() => setInput("Is het veilig voor mijn kat?")}
                        className="block w-full text-left px-4 py-2 bg-white rounded-md text-sm hover:bg-brand/5 transition-colors"
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
                      className={`max-w-[85%] rounded-md px-4 py-3 ${
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
                    <div className="bg-white border border-gray-200 rounded-md px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-brand" />
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200 rounded-b-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Stel je vraag..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-6 rounded-md"
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
