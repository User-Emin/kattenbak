"use client";

/**
 * RAG CHAT POPUP - MODERN HOEKIGER DESIGN
 * ✅ DRY: Alle styling via CHAT_CONFIG (geen hardcoding)
 * ✅ Noto Sans font systeem
 * ✅ Zwart-wit minimalistisch design
 * ✅ Hoekiger (rounded-sm i.p.v. rounded-full/rounded-md)
 * ✅ Smoother animations
 * ✅ Performance optimized (debouncing, lazy loading)
 * Security: Rate limiting + input validation backend
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "./button";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";
import { CHAT_CONFIG } from "@/lib/chat-config";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { cn } from "@/lib/utils";

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

  // ✅ PERFORMANCE: Debounced sticky cart detection (bespaart CPU)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
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
    
    // ✅ PERFORMANCE: Debounce check (200ms i.p.v. 100ms polling)
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkStickyCart, 200);
    };
    
    // Initial check
    checkStickyCart();
    
    // ✅ PERFORMANCE: Use MutationObserver voor efficiëntere detectie
    const observer = new MutationObserver(debouncedCheck);
    const targetNode = document.body;
    observer.observe(targetNode, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
    });
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  // ✅ PERFORMANCE: Memoized API URL (geen herberekening)
  const apiUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}/api/v1`;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://catsupply.nl/api/v1';
  }, []);

  // ✅ PERFORMANCE: useCallback voor stable function reference
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);
    
    try {
      // ✅ SECURITY: Use dynamic API URL (no hardcoding)
      const response = await fetch(`${apiUrl}/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentInput,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
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
  }, [input, isLoading, messages, apiUrl]);

  // ✅ PERFORMANCE: useCallback voor stable function reference
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // ✅ DRY: Calculate button position via CHAT_CONFIG
  const buttonBottomClass = useMemo(() => {
    return stickyCartVisible 
      ? CHAT_CONFIG.button.position.bottomWithCart
      : CHAT_CONFIG.button.position.bottom;
  }, [stickyCartVisible]);

  return (
    <>
      {/* ✅ MODERN: Floating Chat Button - Hoekiger, zwart-wit, Noto Sans */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'fixed',
          CHAT_CONFIG.button.position.right,
          'z-[100]',
          buttonBottomClass,
          CHAT_CONFIG.button.size,
          CHAT_CONFIG.button.borderRadius,
          CHAT_CONFIG.button.backgroundColor,
          CHAT_CONFIG.button.textColor,
          CHAT_CONFIG.button.shadow,
          CHAT_CONFIG.button.hoverBackgroundColor,
          'transition-all',
          CHAT_CONFIG.animations.duration.base,
          CHAT_CONFIG.animations.timing.ease,
          'hover:scale-110',
          'active:scale-95',
          CHAT_CONFIG.button.border,
          'focus:outline-none',
          'focus:ring-4',
          'focus:ring-gray-400/30',
          'flex',
          'items-center',
          'justify-center',
          'font-sans'
        )}
        aria-label="Open chat"
      >
        {isExpanded ? (
          <X className={CHAT_CONFIG.button.iconSize} />
        ) : (
          <MessageCircle className={CHAT_CONFIG.button.iconSize} />
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
          
          {/* ✅ MODERN: Chat Modal - Hoekiger, smoother animations */}
          <div className="fixed inset-0 md:inset-auto md:bottom-32 md:right-8 z-[120] flex items-center justify-center md:items-end md:justify-end p-4 pointer-events-none">
            <div className={cn(
              'pointer-events-auto',
              'w-full',
              CHAT_CONFIG.modal.maxWidth,
              CHAT_CONFIG.modal.maxHeight,
              CHAT_CONFIG.modal.backgroundColor,
              CHAT_CONFIG.modal.borderRadius,
              CHAT_CONFIG.modal.shadow,
              CHAT_CONFIG.modal.border,
              CHAT_CONFIG.animations.modal.slideIn,
              'flex',
              'flex-col',
              'font-sans'
            )}>
              
              {/* ✅ MODERN: Header - Hoekiger, zwart-wit, Noto Sans */}
              <div className={cn(
                CHAT_CONFIG.header.backgroundColor,
                CHAT_CONFIG.header.textColor,
                CHAT_CONFIG.header.padding,
                CHAT_CONFIG.header.borderRadius,
                CHAT_CONFIG.header.borderBottom
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={cn(
                      CHAT_CONFIG.header.title.fontSize,
                      CHAT_CONFIG.header.title.fontWeight,
                      CHAT_CONFIG.header.title.textColor,
                      CHAT_CONFIG.header.title.letterSpacing,
                      'font-sans'
                    )}>
                      AI Assistent
                    </h3>
                    <p className={cn(
                      CHAT_CONFIG.header.subtitle.fontSize,
                      CHAT_CONFIG.header.subtitle.textColor,
                      'mt-1',
                      'font-sans'
                    )}>
                      Stel me een vraag over onze kattenbak
                    </p>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-sm hover:bg-gray-800"
                    aria-label="Sluit chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ✅ MODERN: Messages - Hoekiger, Noto Sans */}
              <div className={cn(
                'flex-1',
                'overflow-y-auto',
                CHAT_CONFIG.messages.container.padding,
                CHAT_CONFIG.messages.container.spacing,
                CHAT_CONFIG.messages.container.backgroundColor,
                'font-sans'
              )}>
                {messages.length === 0 && (
                  <div className={cn('text-center', CHAT_CONFIG.emptyState.textColor, 'mt-8')}>
                    <MessageCircle className={cn(CHAT_CONFIG.emptyState.iconSize, 'mx-auto', 'mb-3', CHAT_CONFIG.emptyState.iconColor)} />
                    <p className={cn(CHAT_CONFIG.emptyState.fontSize, 'font-sans')}>
                      Stel een vraag over features, specificaties, of geschiktheid
                    </p>
                    <div className="mt-4 space-y-2">
                      {["Hoeveel liter is de afvalbak?", "Heeft deze kattenbak een app?", "Is het veilig voor mijn kat?"].map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(suggestion)}
                          className={cn(
                            'block',
                            'w-full',
                            'text-left',
                            CHAT_CONFIG.emptyState.suggestionButton.padding,
                            CHAT_CONFIG.emptyState.suggestionButton.backgroundColor,
                            CHAT_CONFIG.emptyState.suggestionButton.borderRadius,
                            CHAT_CONFIG.emptyState.suggestionButton.fontSize,
                            CHAT_CONFIG.emptyState.suggestionButton.hoverBackgroundColor,
                            'transition-colors',
                            'font-sans'
                          )}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={cn(
                        msg.role === 'user' ? CHAT_CONFIG.messages.user.maxWidth : CHAT_CONFIG.messages.assistant.maxWidth,
                        CHAT_CONFIG.messages[msg.role].borderRadius,
                        CHAT_CONFIG.messages[msg.role].padding,
                        'transition-all',
                        CHAT_CONFIG.animations.duration.base,
                        'font-sans',
                        msg.role === 'user'
                          ? cn(CHAT_CONFIG.messages.user.backgroundColor, CHAT_CONFIG.messages.user.textColor)
                          : cn(CHAT_CONFIG.messages.assistant.backgroundColor, CHAT_CONFIG.messages.assistant.textColor, CHAT_CONFIG.messages.assistant.border)
                      )}
                    >
                      <p className={cn(CHAT_CONFIG.messages[msg.role].fontSize || DESIGN_SYSTEM.typography.fontSize.sm, 'whitespace-pre-wrap')}>
                        {msg.content}
                      </p>
                      <span className={cn(CHAT_CONFIG.messages.timestamp.fontSize, CHAT_CONFIG.messages.timestamp.textColor, 'mt-1', 'block')}>
                        {msg.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={cn(
                      CHAT_CONFIG.loading.backgroundColor,
                      CHAT_CONFIG.loading.border,
                      CHAT_CONFIG.loading.borderRadius,
                      CHAT_CONFIG.loading.padding
                    )}>
                      <Loader2 className={cn(CHAT_CONFIG.loading.iconSize, 'animate-spin', CHAT_CONFIG.loading.iconColor)} />
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className={cn(
                    CHAT_CONFIG.error.backgroundColor,
                    CHAT_CONFIG.error.border,
                    CHAT_CONFIG.error.borderRadius,
                    CHAT_CONFIG.error.padding,
                    CHAT_CONFIG.error.fontSize,
                    CHAT_CONFIG.error.textColor,
                    'font-sans'
                  )}>
                    {error}
                  </div>
                )}
              </div>

              {/* ✅ MODERN: Input - Hoekiger, Noto Sans, smoother */}
              <div className={cn(
                CHAT_CONFIG.input.container.padding,
                CHAT_CONFIG.input.container.backgroundColor,
                CHAT_CONFIG.input.container.borderTop,
                CHAT_CONFIG.input.container.borderRadius,
                'font-sans'
              )}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Stel je vraag..."
                    className={cn(
                      'flex-1',
                      CHAT_CONFIG.input.field.padding,
                      CHAT_CONFIG.input.field.border,
                      CHAT_CONFIG.input.field.borderRadius,
                      CHAT_CONFIG.input.field.focus.ring,
                      CHAT_CONFIG.input.field.focus.border,
                      CHAT_CONFIG.input.field.fontSize,
                      CHAT_CONFIG.input.field.backgroundColor,
                      'font-sans'
                    )}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      CHAT_CONFIG.input.button.padding,
                      CHAT_CONFIG.input.button.borderRadius,
                      CHAT_CONFIG.input.button.backgroundColor,
                      CHAT_CONFIG.input.button.textColor,
                      CHAT_CONFIG.input.button.hoverBackgroundColor,
                      CHAT_CONFIG.input.button.fontSize,
                      CHAT_CONFIG.input.button.fontWeight,
                      'transition-all',
                      CHAT_CONFIG.input.button.transition,
                      'disabled:opacity-50',
                      'disabled:cursor-not-allowed',
                      'flex',
                      'items-center',
                      'justify-center',
                      'font-sans'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className={cn(CHAT_CONFIG.input.button.iconSize, 'animate-spin')} />
                    ) : (
                      <Send className={CHAT_CONFIG.input.button.iconSize} />
                    )}
                  </button>
                </div>
                <p className={cn(
                  CHAT_CONFIG.input.footer.fontSize,
                  CHAT_CONFIG.input.footer.textColor,
                  'mt-2',
                  'text-center',
                  'font-sans'
                )}>
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
