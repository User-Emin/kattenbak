"use client";

/**
 * RAG CHAT POPUP - FULLY CONFIGURABLE
 * AI-powered chat met Ollama + RAG
 * Security: Rate limiting + input validation backend
 * DRY: ALL settings from API/config - NO HARDCODE
 */

import { useState, useEffect } from "react";
import { Button } from "./button";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";

// DRY: Chat button configuration (can be loaded from API)
interface ChatConfig {
  enabled: boolean;
  position: 'left' | 'right';
  bottomOffset: string;
  sideOffset: string;
  size: string;
  backgroundColor: string;
  hoverBackgroundColor: string;
  textColor: string;
  zIndex: number;
  alwaysVisible: boolean; // ✅ CRITICAL: Always visible like Zedar
  showPulseEffect: boolean;
  title: string;
  subtitle: string;
}

// DRY: Default config (can be overridden by API)
const DEFAULT_CHAT_CONFIG: ChatConfig = {
  enabled: true,
  position: 'right', // ✅ RECHTS zoals Zedar
  bottomOffset: '1.5rem', // 24px - meer ruimte
  sideOffset: '1.5rem', // 24px - meer ruimte
  size: '4rem', // 64px = w-16 h-16
  backgroundColor: '#f76402', // accent color
  hoverBackgroundColor: '#e55a02', // accent-dark
  textColor: '#ffffff',
  zIndex: 9999,
  alwaysVisible: true, // ✅ ALWAYS VISIBLE like Zedar (ook bij scrollen)
  showPulseEffect: true,
  title: 'AI Assistent',
  subtitle: 'Stel me een vraag over onze kattenbak',
};

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
  const [showPulse, setShowPulse] = useState(false);
  const [config, setConfig] = useState<ChatConfig>(DEFAULT_CHAT_CONFIG);

  // DRY: Load chat config from API (if available)
  useEffect(() => {
    fetch('/api/v1/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.chatWidget) {
          setConfig({ ...DEFAULT_CHAT_CONFIG, ...data.data.chatWidget });
        }
      })
      .catch(() => {
        // Use default config on error
      });
  }, []);

  // DRY: Pulse effect - only if enabled in config
  useEffect(() => {
    if (!config.showPulseEffect) return;

    let pulseTimeout: NodeJS.Timeout;
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        setShowPulse(true);
        pulseTimeout = setTimeout(() => {
          setShowPulse(false);
        }, 3000);
      }, 1000);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const initialPulse = setTimeout(() => {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000);
    }, 2000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(pulseTimeout);
      clearTimeout(scrollTimeout);
      clearTimeout(initialPulse);
    };
  }, [config.showPulseEffect]);

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

  // DRY: Chat button - FULLY CONFIGURABLE, NO HARDCODE
  if (!config.enabled) return null;

  // DRY: Build position styles from config
  const positionStyles = {
    position: 'fixed' as const,
    [config.position]: config.sideOffset,
    bottom: config.bottomOffset,
    zIndex: config.zIndex,
    width: config.size,
    height: config.size,
    backgroundColor: config.backgroundColor,
  };

  return (
    <>
      {/* Floating Chat Button - FULLY CONFIGURABLE */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          setShowPulse(false);
        }}
        style={positionStyles}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = config.hoverBackgroundColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = config.backgroundColor;
        }}
        className={`transition-all duration-300 ease-out
                   text-white rounded-full shadow-lg hover:shadow-2xl
                   focus:outline-none focus:ring-2 focus:ring-offset-2
                   flex items-center justify-center
                   relative overflow-visible group
                   ${config.showPulseEffect && showPulse ? 'animate-pulse-subtle' : ''}`}
        aria-label="Open chat"
      >
        {/* Pulse effect - only if enabled */}
        {config.showPulseEffect && showPulse && !isExpanded && (
          <>
            <span 
              className="absolute inset-0 rounded-full scale-100 animate-ping-slow"
              style={{ backgroundColor: `${config.backgroundColor}66` }}
            ></span>
            <span 
              className="absolute inset-0 rounded-full scale-100 animate-ping-slower"
              style={{ backgroundColor: `${config.backgroundColor}33` }}
            ></span>
          </>
        )}
        
        {/* Hover effect */}
        <span className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 ease-out origin-center"></span>
        
        {/* Chat icon */}
        {isExpanded ? (
          <X className="w-7 h-7 relative z-10 transition-transform duration-200" />
        ) : (
          <svg 
            className="w-7 h-7 relative z-10 transition-transform duration-200 group-hover:scale-110" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Popup */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200 z-[70] md:bg-transparent md:pointer-events-none"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Chat Modal */}
          <div className="fixed inset-0 md:inset-auto md:bottom-32 md:right-8 z-[80] flex items-center justify-center md:items-end md:justify-end p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md max-h-[90vh] md:max-h-[600px] bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 fade-in duration-300 flex flex-col">
              
              {/* Header - DRY: Use config titles */}
              <div className="bg-gradient-to-br from-brand to-brand-dark p-6 rounded-t-2xl text-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold">{config.title}</h3>
                    <p className="text-sm text-white/90 mt-1">{config.subtitle}</p>
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
