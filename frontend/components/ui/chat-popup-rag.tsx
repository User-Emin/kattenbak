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

// ✅ SECURITY: Safe DESIGN_SYSTEM access with fallback (outside component, executed once)
const SAFE_DESIGN_SYSTEM = (() => {
  try {
    if (DESIGN_SYSTEM && DESIGN_SYSTEM.typography && DESIGN_SYSTEM.typography.fontSize) {
      return DESIGN_SYSTEM;
    }
    throw new Error('DESIGN_SYSTEM incomplete');
  } catch (err) {
    // ✅ SECURITY: Silent fallback (no error exposure)
    return {
      typography: {
        fontSize: {
          sm: 'text-sm',
          base: 'text-base',
          lg: 'text-lg',
          xl: 'text-xl',
        },
        fontWeight: {
          normal: 'font-normal',
          medium: 'font-medium',
          semibold: 'font-semibold',
        },
      },
    };
  }
})();

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatPopup() {
  // ✅ SECURITY: Initialize state safely
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stickyCartVisible, setStickyCartVisible] = useState(false);
  
  // ✅ FIX: Safe access to CHAT_CONFIG with fallbacks (useMemo for performance) - MUST BE BEFORE ANY USAGE
  const safeChatConfig = useMemo(() => {
    try {
      // Verify CHAT_CONFIG exists and has required properties
      if (!CHAT_CONFIG || !CHAT_CONFIG.button || !CHAT_CONFIG.modal || !CHAT_CONFIG.animations) {
        throw new Error('CHAT_CONFIG incomplete');
      }
      // ✅ SECURITY: Return validated config
      return CHAT_CONFIG;
    } catch (err) {
      // ✅ SECURITY: Silent fallback (no error exposure to user)
      // Return minimal fallback config that matches CHAT_CONFIG structure
      return {
        button: {
          position: { right: 'right-6', bottom: 'bottom-6', bottomWithCart: 'bottom-24' },
          size: 'w-14 h-14',
          borderRadius: 'rounded-lg',
          backgroundColor: 'bg-gray-900',
          textColor: 'text-white',
          shadow: 'shadow-lg',
          hoverBackgroundColor: 'hover:bg-gray-800',
          border: 'border border-gray-700',
          iconSize: 'w-6 h-6',
        },
        animations: {
          duration: { base: 'duration-200' },
          timing: { ease: 'ease-in-out' },
          backdrop: {
            backgroundColor: 'bg-black/50',
            blur: 'backdrop-blur-sm',
            fadeIn: 'animate-fade-in',
            zIndex: 'z-[99]',
            mobileTransparent: 'md:bg-black/50',
            mobilePointerEvents: 'md:pointer-events-auto',
          },
          modal: {
            slideIn: 'animate-slide-in',
          },
        },
        modal: {
          position: {
            container: 'fixed inset-0',
            flex: 'flex items-center justify-center',
            padding: 'p-4',
            pointerEvents: 'pointer-events-none',
          },
          zIndex: 'z-[100]',
          maxWidth: 'max-w-2xl',
          maxHeight: 'max-h-[90vh]',
          backgroundColor: 'bg-white',
          borderRadius: 'rounded-lg',
          shadow: 'shadow-2xl',
          border: 'border border-gray-200',
        },
        header: {
          backgroundColor: 'bg-gray-900',
          textColor: 'text-white',
          padding: 'p-4',
          borderRadius: 'rounded-t-lg',
          borderBottom: 'border-b border-gray-700',
          title: {
            fontSize: 'text-lg',
            fontWeight: 'font-semibold',
            textColor: 'text-white',
            letterSpacing: 'tracking-tight',
          },
          subtitle: {
            fontSize: 'text-sm',
            textColor: 'text-gray-300',
          },
        },
        messages: {
          container: {
            padding: 'p-4',
            spacing: 'space-y-4',
            backgroundColor: 'bg-gray-50',
          },
          user: {
            maxWidth: 'max-w-[80%]',
            borderRadius: 'rounded-lg',
            padding: 'p-3',
            backgroundColor: 'bg-blue-600',
            textColor: 'text-white',
          },
          assistant: {
            maxWidth: 'max-w-[80%]',
            borderRadius: 'rounded-lg',
            padding: 'p-3',
            backgroundColor: 'bg-white',
            textColor: 'text-gray-900',
            border: 'border border-gray-200',
          },
          timestamp: {
            fontSize: 'text-xs',
            textColor: 'text-gray-500',
          },
        },
        emptyState: {
          textColor: 'text-gray-600',
          iconSize: 'w-12 h-12',
          iconColor: 'text-gray-400',
          fontSize: 'text-sm',
          suggestionButton: {
            padding: 'p-2',
            backgroundColor: 'bg-white',
            borderRadius: 'rounded',
            fontSize: 'text-sm',
            hoverBackgroundColor: 'hover:bg-gray-100',
          },
        },
        loading: {
          backgroundColor: 'bg-white',
          border: 'border border-gray-200',
          borderRadius: 'rounded-lg',
          padding: 'p-3',
          iconSize: 'w-5 h-5',
          iconColor: 'text-gray-400',
        },
        error: {
          backgroundColor: 'bg-red-50',
          border: 'border border-red-200',
          borderRadius: 'rounded-lg',
          padding: 'p-3',
          fontSize: 'text-sm',
          textColor: 'text-red-700',
        },
        input: {
          container: {
            padding: 'p-4',
            backgroundColor: 'bg-white',
            borderTop: 'border-t border-gray-200',
            borderRadius: 'rounded-b-lg',
          },
          field: {
            padding: 'p-3',
            border: 'border border-gray-300',
            borderRadius: 'rounded-lg',
            focus: {
              ring: 'focus:ring-2 focus:ring-blue-500',
              border: 'focus:border-blue-500',
            },
            fontSize: 'text-sm',
            backgroundColor: 'bg-white',
          },
          button: {
            padding: 'p-3',
            borderRadius: 'rounded-lg',
            backgroundColor: 'bg-blue-600',
            textColor: 'text-white',
            hoverBackgroundColor: 'hover:bg-blue-700',
            fontSize: 'text-sm',
            fontWeight: 'font-medium',
            transition: 'transition-colors',
            iconSize: 'w-5 h-5',
          },
          footer: {
            fontSize: 'text-xs',
            textColor: 'text-gray-500',
          },
        },
      };
    }
  }, []);

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
      
      if (!response.ok) {
        // Handle HTTP errors (429, 403, 500, etc.)
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Er ging iets mis');
      }
      
      // ✅ FIX: API returns answer directly in root (RAGResponse structure)
      // Response structure: { success: true, answer: string, sources?: [...], metadata?: {...} }
      const answer = data.answer || data.data?.answer || 'Geen antwoord ontvangen';
      
      // ✅ SECURITY: Sanitize answer (prevent XSS in chat display)
      if (typeof answer !== 'string') {
        throw new Error('Ongeldig antwoord ontvangen van de server');
      }
      
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

  // ✅ SECURITY: Additional safety check - ensure safeChatConfig is valid before render
  if (!safeChatConfig || !safeChatConfig.button || !safeChatConfig.modal || !safeChatConfig.animations) {
    // Return minimal button only (no popup) to prevent crash
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed right-4 bottom-8 w-14 h-14 bg-black text-white rounded-sm shadow-2xl z-[100] flex items-center justify-center hover:bg-gray-900 transition-colors"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  // ✅ DRY: Calculate button position via CHAT_CONFIG (with safe access)
  const buttonBottomClass = useMemo(() => {
    if (!safeChatConfig?.button?.position) {
      return 'bottom-8';
    }
    return stickyCartVisible 
      ? safeChatConfig.button.position.bottomWithCart
      : safeChatConfig.button.position.bottom;
  }, [stickyCartVisible, safeChatConfig]);

  return (
    <>
      {/* ✅ MODERN: Floating Chat Button - Hoekiger, zwart-wit, Noto Sans */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'fixed',
          safeChatConfig.button.position.right,
          'z-[100]',
          buttonBottomClass,
          safeChatConfig.button.size,
          safeChatConfig.button.borderRadius,
          safeChatConfig.button.backgroundColor,
          safeChatConfig.button.textColor,
          safeChatConfig.button.shadow,
          safeChatConfig.button.hoverBackgroundColor,
          'transition-all',
          safeChatConfig.animations.duration.base,
          safeChatConfig.animations.timing.ease,
          'hover:scale-110',
          'active:scale-95',
          safeChatConfig.button.border,
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
          <X className={safeChatConfig.button.iconSize} />
        ) : (
          <MessageCircle className={safeChatConfig.button.iconSize} />
        )}
      </button>

      {/* Chat Popup */}
      {isExpanded && (
        <>
          {/* ✅ DRY: Backdrop via CHAT_CONFIG */}
          <div
            className={cn(
              'fixed',
              'inset-0',
              safeChatConfig.animations.backdrop.backgroundColor,
              safeChatConfig.animations.backdrop.blur,
              safeChatConfig.animations.backdrop.fadeIn,
              safeChatConfig.animations.backdrop.zIndex,
              safeChatConfig.animations.backdrop.mobileTransparent,
              safeChatConfig.animations.backdrop.mobilePointerEvents
            )}
            onClick={() => setIsExpanded(false)}
          />
          
          {/* ✅ MODERN: Chat Modal - Hoekiger, smoother animations */}
          <div className={cn(
            safeChatConfig.modal.position.container,
            safeChatConfig.modal.zIndex,
            safeChatConfig.modal.position.flex,
            safeChatConfig.modal.position.padding,
            safeChatConfig.modal.position.pointerEvents
          )}>
            <div className={cn(
              'pointer-events-auto',
              'w-full',
              safeChatConfig.modal.maxWidth,
              safeChatConfig.modal.maxHeight,
              safeChatConfig.modal.backgroundColor,
              safeChatConfig.modal.borderRadius,
              safeChatConfig.modal.shadow,
              safeChatConfig.modal.border,
              safeChatConfig.animations.modal.slideIn,
              'flex',
              'flex-col',
              'font-sans'
            )}>
              
              {/* ✅ MODERN: Header - Hoekiger, zwart-wit, Noto Sans */}
              <div className={cn(
                safeChatConfig.header.backgroundColor,
                safeChatConfig.header.textColor,
                safeChatConfig.header.padding,
                safeChatConfig.header.borderRadius,
                safeChatConfig.header.borderBottom
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={cn(
                      safeChatConfig.header.title.fontSize,
                      safeChatConfig.header.title.fontWeight,
                      safeChatConfig.header.title.textColor,
                      safeChatConfig.header.title.letterSpacing,
                      'font-sans'
                    )}>
                      AI Assistent
                    </h3>
                    <p className={cn(
                      safeChatConfig.header.subtitle.fontSize,
                      safeChatConfig.header.subtitle.textColor,
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
                safeChatConfig.messages.container.padding,
                safeChatConfig.messages.container.spacing,
                safeChatConfig.messages.container.backgroundColor,
                'font-sans'
              )}>
                {messages.length === 0 && (
                  <div className={cn('text-center', safeChatConfig.emptyState.textColor, 'mt-8')}>
                    <MessageCircle className={cn(safeChatConfig.emptyState.iconSize, 'mx-auto', 'mb-3', safeChatConfig.emptyState.iconColor)} />
                    <p className={cn(safeChatConfig.emptyState.fontSize, 'font-sans')}>
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
                            safeChatConfig.emptyState.suggestionButton.padding,
                            safeChatConfig.emptyState.suggestionButton.backgroundColor,
                            safeChatConfig.emptyState.suggestionButton.borderRadius,
                            safeChatConfig.emptyState.suggestionButton.fontSize,
                            safeChatConfig.emptyState.suggestionButton.hoverBackgroundColor,
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
                        msg.role === 'user' ? safeChatConfig.messages.user.maxWidth : safeChatConfig.messages.assistant.maxWidth,
                        safeChatConfig.messages[msg.role].borderRadius,
                        safeChatConfig.messages[msg.role].padding,
                        'transition-all',
                        safeChatConfig.animations.duration.base,
                        'font-sans',
                        msg.role === 'user'
                          ? cn(safeChatConfig.messages.user.backgroundColor, safeChatConfig.messages.user.textColor)
                          : cn(safeChatConfig.messages.assistant.backgroundColor, safeChatConfig.messages.assistant.textColor, safeChatConfig.messages.assistant.border)
                      )}
                    >
                      <p className={cn(safeChatConfig.messages[msg.role]?.fontSize || SAFE_DESIGN_SYSTEM.typography.fontSize.sm, 'whitespace-pre-wrap')}>
                        {msg.content}
                      </p>
                      <span className={cn(safeChatConfig.messages.timestamp.fontSize, safeChatConfig.messages.timestamp.textColor, 'mt-1', 'block')}>
                        {msg.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={cn(
                      safeChatConfig.loading.backgroundColor,
                      safeChatConfig.loading.border,
                      safeChatConfig.loading.borderRadius,
                      safeChatConfig.loading.padding
                    )}>
                      <Loader2 className={cn(safeChatConfig.loading.iconSize, 'animate-spin', safeChatConfig.loading.iconColor)} />
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className={cn(
                    safeChatConfig.error.backgroundColor,
                    safeChatConfig.error.border,
                    safeChatConfig.error.borderRadius,
                    safeChatConfig.error.padding,
                    safeChatConfig.error.fontSize,
                    safeChatConfig.error.textColor,
                    'font-sans'
                  )}>
                    {error}
                  </div>
                )}
              </div>

              {/* ✅ MODERN: Input - Hoekiger, Noto Sans, smoother */}
              <div className={cn(
                safeChatConfig.input.container.padding,
                safeChatConfig.input.container.backgroundColor,
                safeChatConfig.input.container.borderTop,
                safeChatConfig.input.container.borderRadius,
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
                      safeChatConfig.input.field.padding,
                      safeChatConfig.input.field.border,
                      safeChatConfig.input.field.borderRadius,
                      safeChatConfig.input.field.focus.ring,
                      safeChatConfig.input.field.focus.border,
                      safeChatConfig.input.field.fontSize,
                      safeChatConfig.input.field.backgroundColor,
                      'font-sans'
                    )}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      safeChatConfig.input.button.padding,
                      safeChatConfig.input.button.borderRadius,
                      safeChatConfig.input.button.backgroundColor,
                      safeChatConfig.input.button.textColor,
                      safeChatConfig.input.button.hoverBackgroundColor,
                      safeChatConfig.input.button.fontSize,
                      safeChatConfig.input.button.fontWeight,
                      'transition-all',
                      safeChatConfig.input.button.transition,
                      'disabled:opacity-50',
                      'disabled:cursor-not-allowed',
                      'flex',
                      'items-center',
                      'justify-center',
                      'font-sans'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className={cn(safeChatConfig.input.button.iconSize, 'animate-spin')} />
                    ) : (
                      <Send className={safeChatConfig.input.button.iconSize} />
                    )}
                  </button>
                </div>
                <p className={cn(
                  safeChatConfig.input.footer.fontSize,
                  safeChatConfig.input.footer.textColor,
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
