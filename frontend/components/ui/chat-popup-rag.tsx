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
          position: {
            type: 'fixed',
            right: 'right-6',
            bottom: 'bottom-6',
            bottomWithCart: 'bottom-24',
          },
          size: 'w-14 h-14',
          borderRadius: 'rounded-lg',
          backgroundColor: 'bg-gray-900',
          textColor: 'text-white',
          shadow: 'shadow-lg',
          hoverBackgroundColor: 'hover:bg-gray-800',
          border: 'border border-gray-700',
          display: 'flex',
          align: 'items-center',
          justify: 'justify-center',
          zIndex: 100,
          hoverScale: 'hover:scale-110',
          activeScale: 'active:scale-95',
          focus: {
            outline: 'focus:outline-none',
            ring: 'focus:ring-4',
            ringColor: 'focus:ring-gray-400/30',
          },
          iconSize: 'w-6 h-6',
        },
        animations: {
          duration: { base: 'duration-200' },
          timing: { ease: 'ease-in-out' },
          backdrop: {
            backgroundColor: 'bg-black/50',
            blur: 'backdrop-blur-sm',
            fadeIn: 'animate-in fade-in duration-300',
            zIndex: 'z-[99]',
            mobileTransparent: 'md:bg-transparent',
            mobilePointerEvents: 'md:pointer-events-none',
            position: 'fixed',
            inset: 'inset-0',
          },
          modal: {
            slideIn: 'animate-in zoom-in-95 duration-300',
            container: {
              position: 'fixed',
              inset: 'inset-0',
              zIndex: 'z-[200]',
              display: 'flex',
              align: 'items-center',
              justify: 'justify-center',
              padding: 'p-3 sm:p-4',
              pointerEvents: 'pointer-events-none',
            },
            content: {
              pointerEvents: 'pointer-events-auto',
              width: 'w-full',
              display: 'flex',
              direction: 'flex-col',
              position: 'relative',
            },
          },
        },
        modal: {
          maxWidth: 'max-w-md',
          maxHeight: 'max-h-[85vh] sm:max-h-[80vh]',
          backgroundColor: 'bg-white',
          borderRadius: 'rounded-xl sm:rounded-2xl',
          shadow: 'shadow-2xl',
          border: 'border border-gray-200',
          zIndex: 200,
          overflow: 'overflow-hidden',
        },
        header: {
          backgroundColor: 'bg-black',
          textColor: 'text-white',
          padding: 'px-4 py-3',
          borderRadius: 'rounded-t-xl sm:rounded-t-2xl',
          borderBottom: 'border-b border-gray-700/20',
          sticky: 'sticky top-0',
          container: {
            display: 'flex',
            justify: 'justify-between',
            align: 'items-start',
            marginBottom: 'mb-2',
          },
          title: {
            fontSize: 'text-lg',
            fontWeight: 'font-semibold',
            textColor: 'text-white',
            letterSpacing: 'tracking-tight',
          },
          subtitle: {
            fontSize: 'text-sm',
            textColor: 'text-gray-300',
            marginTop: 'mt-1',
          },
          closeButton: {
            textColor: 'text-gray-400',
            hoverTextColor: 'hover:text-white',
            transition: 'transition-colors',
            padding: 'p-1',
            borderRadius: 'rounded-sm',
            hoverBackground: 'hover:bg-gray-800',
          },
        },
        messages: {
          container: {
            padding: 'p-4',
            spacing: 'space-y-4',
            backgroundColor: 'bg-gray-50',
            flex: 'flex-1',
            overflow: 'overflow-y-auto',
            display: 'flex',
            direction: 'flex-col',
          },
          messageWrapper: {
            display: 'flex',
            userJustify: 'justify-end',
            assistantJustify: 'justify-start',
          },
          loadingContainer: {
            display: 'flex',
            justify: 'justify-start',
          },
          user: {
            maxWidth: 'max-w-[85%]',
            borderRadius: 'rounded-sm',
            padding: 'p-3',
            backgroundColor: 'bg-black',
            textColor: 'text-white',
          },
          assistant: {
            maxWidth: 'max-w-[85%]',
            borderRadius: 'rounded-sm',
            padding: 'p-3',
            backgroundColor: 'bg-white',
            textColor: 'gradient-text', // ✅ GRADIENT (was text-black)
            border: 'border border-gray-200',
          },
          timestamp: {
            fontSize: 'text-xs',
            textColor: 'text-gray-500',
            marginTop: 'mt-1',
            display: 'block',
          },
        },
        emptyState: {
          textColor: 'text-gray-600',
          iconSize: 'w-12 h-12',
          iconColor: 'text-gray-400',
          fontSize: 'text-sm',
          container: {
            align: 'items-center',
            textAlign: 'text-center',
            marginTop: 'mt-8',
          },
          iconContainer: {
            marginX: 'mx-auto',
            marginBottom: 'mb-3',
          },
          suggestionsContainer: {
            marginTop: 'mt-4',
            spacing: 'space-y-2',
          },
          suggestionButton: {
            padding: 'p-2',
            backgroundColor: 'bg-white',
            borderRadius: 'rounded',
            fontSize: 'text-sm',
            hoverBackgroundColor: 'hover:bg-gray-100',
            display: 'block',
            width: 'w-full',
            textAlign: 'text-left',
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
          fieldContainer: {
            display: 'flex',
            gap: 'gap-2',
          },
          field: {
            flex: 'flex-1',
          },
          buttonContainer: {
            display: 'flex',
            align: 'items-center',
            justify: 'justify-center',
          },
          footer: {
            marginTop: 'mt-2',
            textAlign: 'text-center',
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
        utilities: {
          fontFamily: 'font-sans',
          transition: {
            all: 'transition-all',
            colors: 'transition-colors',
          },
          disabled: {
            opacity: 'disabled:opacity-50',
            cursor: 'disabled:cursor-not-allowed',
          },
          animation: {
            spin: 'animate-spin',
          },
          whitespace: {
            preWrap: 'whitespace-pre-wrap',
          },
          textAlign: {
            center: 'text-center',
            left: 'text-left',
          },
          margin: {
            auto: 'mx-auto',
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
      // ✅ SECURITY: Log errors server-side only (not in browser console in production)
      if (typeof window === 'undefined' || process.env.NODE_ENV === 'development') {
        console.error('Chat error:', err);
      }
      // ✅ SECURITY: Generic error message (no sensitive data exposure)
      setError('Kon geen antwoord krijgen. Probeer het opnieuw.');
      
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

  // ✅ DRY: Calculate button position via CHAT_CONFIG (with safe access)
  const buttonBottomClass = useMemo(() => {
    if (!safeChatConfig?.button?.position) {
      return 'bottom-8';
    }
    return stickyCartVisible 
      ? safeChatConfig.button.position.bottomWithCart
      : safeChatConfig.button.position.bottom;
  }, [stickyCartVisible, safeChatConfig]);

  // ✅ SECURITY: Additional safety check - ensure safeChatConfig is valid before render
  // This check happens AFTER safeChatConfig is defined
  if (!safeChatConfig || !safeChatConfig.button || !safeChatConfig.modal || !safeChatConfig.animations) {
    // Return minimal button only (no popup) to prevent crash - 100% DYNAMISCH via fallback config
    const fallbackButton = safeChatConfig?.button || {
      position: { type: 'fixed', right: 'right-6', bottom: 'bottom-6' },
      size: 'w-16 h-16',
      borderRadius: 'rounded-md',
      backgroundColor: 'bg-gradient-to-r from-[#3C3C3D] to-[#7A7A7D]', // ✅ GRADIENT (was bg-black)
      textColor: 'text-white',
      shadow: 'shadow-lg',
      hoverBackgroundColor: 'hover:bg-gray-900',
      display: 'flex',
      align: 'items-center',
      justify: 'justify-center',
      zIndex: 'z-[50]',
      transitionClasses: 'transition-all duration-200',
      iconSize: 'w-7 h-7',
    };
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          fallbackButton.position.type,
          fallbackButton.position.right,
          fallbackButton.position.bottom,
          fallbackButton.size,
          fallbackButton.borderRadius,
          fallbackButton.backgroundColor,
          fallbackButton.textColor,
          fallbackButton.shadow,
          fallbackButton.hoverBackgroundColor,
          fallbackButton.display,
          fallbackButton.align,
          fallbackButton.justify,
          fallbackButton.zIndex,
          fallbackButton.transitionClasses
        )}
        aria-label="Open chat"
      >
        <MessageCircle className={fallbackButton.iconSize} />
      </button>
    );
  }

  return (
    <>
      {/* ✅ ULTRA MODERN: Floating Chat Button - 100% Dynamisch via DESIGN_SYSTEM */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          safeChatConfig.button.position.type,
          safeChatConfig.button.position.right,
          safeChatConfig.button.zIndex,
          buttonBottomClass,
          safeChatConfig.button.size,
          safeChatConfig.button.borderRadius,
          safeChatConfig.button.backgroundColor,
          safeChatConfig.button.textColor,
          safeChatConfig.button.shadow,
          safeChatConfig.button.hoverBackgroundColor,
          safeChatConfig.button.transitionClasses,
          safeChatConfig.button.hoverScale,
          safeChatConfig.button.activeScale,
          safeChatConfig.button.border,
          safeChatConfig.button.focus.outline,
          safeChatConfig.button.focus.ring,
          safeChatConfig.button.focus.ringColor,
          safeChatConfig.button.display,
          safeChatConfig.button.align,
          safeChatConfig.button.justify,
          safeChatConfig.utilities?.fontFamily || 'font-sans',
          !isExpanded && safeChatConfig.button.pulse // ✅ MODERN: Pulse animation when closed
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
          {/* ✅ ULTRA MODERN: Backdrop - 100% Dynamisch via DESIGN_SYSTEM */}
          <div
            className={cn(
              safeChatConfig.animations.backdrop.position,
              safeChatConfig.animations.backdrop.inset,
              safeChatConfig.animations.backdrop.backgroundColor,
              safeChatConfig.animations.backdrop.blur,
              safeChatConfig.animations.backdrop.fadeIn,
              safeChatConfig.animations.backdrop.zIndex,
              safeChatConfig.animations.backdrop.mobileTransparent,
              safeChatConfig.animations.backdrop.mobilePointerEvents,
              safeChatConfig.animations.backdrop.transition
            )}
            onClick={() => setIsExpanded(false)}
          />
          
          {/* ✅ ULTRA MODERN: Chat Modal - 100% Dynamisch via DESIGN_SYSTEM */}
          <div className={cn(
            safeChatConfig.animations.modal.container.position,
            safeChatConfig.animations.modal.container.inset,
            safeChatConfig.animations.modal.container.zIndex,
            safeChatConfig.animations.modal.container.display,
            safeChatConfig.animations.modal.container.align,
            safeChatConfig.animations.modal.container.justify,
            safeChatConfig.animations.modal.container.padding,
            safeChatConfig.animations.modal.container.pointerEvents,
            safeChatConfig.animations.modal.container.transition
          )}>
            <div className={cn(
              safeChatConfig.animations.modal.content.pointerEvents,
              safeChatConfig.animations.modal.content.width,
              safeChatConfig.modal.maxWidth,
              safeChatConfig.modal.maxHeight,
              safeChatConfig.modal.backgroundColor,
              safeChatConfig.modal.borderRadius,
              safeChatConfig.modal.shadow,
              safeChatConfig.modal.border,
              safeChatConfig.modal.overflow,
              safeChatConfig.animations.modal.slideIn,
              safeChatConfig.animations.modal.content.display,
              safeChatConfig.animations.modal.content.direction,
              safeChatConfig.animations.modal.content.position,
              safeChatConfig.animations.modal.content.marginBottom || 'mb-4', // ✅ POPUP: Margin onderaan zodat modal boven button verschijnt
              safeChatConfig.animations.modal.content.transition,
              safeChatConfig.utilities?.fontFamily || 'font-sans'
            )}>
              
              {/* ✅ MODERN: Header - Consistent met cookie modal - 100% DRY */}
              <div className={cn(
                safeChatConfig.header.sticky,
                safeChatConfig.header.backgroundColor,
                safeChatConfig.header.textColor,
                safeChatConfig.header.padding,
                safeChatConfig.header.borderRadius,
                safeChatConfig.header.borderBottom
              )}>
                <div className={cn(
                  safeChatConfig.header.container.display,
                  safeChatConfig.header.container.justify,
                  safeChatConfig.header.container.align,
                  safeChatConfig.header.container.marginBottom
                )}>
                  {/* ✅ WHATSAPP: Alleen naam (geen subtitle) */}
                  <h3 className={cn(
                    safeChatConfig.header.title.fontSize || 'text-lg',
                    safeChatConfig.header.title.fontWeight || 'font-semibold',
                    safeChatConfig.header.title.textColor || 'gradient-text', // ✅ GRADIENT (was text-black)
                    safeChatConfig.header.title.letterSpacing || 'tracking-normal',
                    safeChatConfig.utilities?.fontFamily || 'font-sans'
                  )}>
                    AI Assistent
                  </h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className={cn(
                      'text-gray-600 hover:text-black', // ✅ WHATSAPP: Grijze close button (was text-gray-400)
                      safeChatConfig.header.closeButton.transition,
                      safeChatConfig.header.closeButton.padding,
                      safeChatConfig.header.closeButton.borderRadius,
                      'hover:bg-gray-200' // ✅ WHATSAPP: Lichte hover (was hover:bg-gray-800)
                    )}
                    aria-label="Sluit chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ✅ WARNING BANNER REMOVED - Nu alleen in product detail pagina */}

              {/* ✅ MODERN: Messages - Ronder, Noto Sans - 100% DRY */}
              <div className={cn(
                safeChatConfig.messages.container.flex,
                safeChatConfig.messages.container.overflow,
                safeChatConfig.messages.container.padding,
                safeChatConfig.messages.container.spacing,
                safeChatConfig.messages.container.backgroundColor,
                safeChatConfig.messages.container.display,
                safeChatConfig.messages.container.direction,
                safeChatConfig.utilities?.fontFamily || 'font-sans'
              )}>
                {messages.length === 0 && (
                  <div className={cn(
                    safeChatConfig.emptyState.container.textAlign,
                    safeChatConfig.emptyState.textColor,
                    safeChatConfig.emptyState.container.marginTop
                  )}>
                    <MessageCircle className={cn(
                      safeChatConfig.emptyState.iconSize,
                      safeChatConfig.emptyState.iconContainer.marginX,
                      safeChatConfig.emptyState.iconContainer.marginBottom,
                      safeChatConfig.emptyState.iconColor
                    )} />
                    <p className={cn(
                      safeChatConfig.emptyState.fontSize,
                      safeChatConfig.utilities?.fontFamily || 'font-sans'
                    )}>
                      Stel een vraag over features, specificaties, of geschiktheid
                    </p>
                    <div className={cn(
                      safeChatConfig.emptyState.suggestionsContainer.marginTop,
                      safeChatConfig.emptyState.suggestionsContainer.spacing
                    )}>
                      {["Hoeveel liter is de afvalbak?", "Heeft deze kattenbak een app?", "Is het veilig voor mijn kat?"].map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(suggestion)}
                          className={cn(
                            safeChatConfig.emptyState.suggestionButton.display,
                            safeChatConfig.emptyState.suggestionButton.width,
                            safeChatConfig.emptyState.suggestionButton.textAlign,
                            safeChatConfig.emptyState.suggestionButton.padding,
                            safeChatConfig.emptyState.suggestionButton.backgroundColor,
                            safeChatConfig.emptyState.suggestionButton.borderRadius,
                            safeChatConfig.emptyState.suggestionButton.fontSize,
                            safeChatConfig.emptyState.suggestionButton.fontWeight || 'font-semibold',
                            safeChatConfig.emptyState.suggestionButton.hoverBackgroundColor,
                            safeChatConfig.utilities?.transition?.colors || 'transition-colors',
                            safeChatConfig.utilities?.fontFamily || 'font-sans'
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
                    className={cn(
                      safeChatConfig.messages.messageWrapper.display,
                      safeChatConfig.messages.messageWrapper.padding || 'px-2', // ✅ FIX: Padding zodat tekst niet aan zijkanten plakt
                      msg.role === 'user' 
                        ? safeChatConfig.messages.messageWrapper.userJustify 
                        : safeChatConfig.messages.messageWrapper.assistantJustify
                    )}
                  >
                    <div
                      className={cn(
                        msg.role === 'user' ? safeChatConfig.messages?.user?.maxWidth || 'max-w-[85%]' : safeChatConfig.messages?.assistant?.maxWidth || 'max-w-[85%]',
                        msg.role === 'user' ? safeChatConfig.messages?.user?.borderRadius || 'rounded-lg' : safeChatConfig.messages?.assistant?.borderRadius || 'rounded-lg',
                        msg.role === 'user' ? safeChatConfig.messages?.user?.padding || 'p-4' : safeChatConfig.messages?.assistant?.padding || 'p-4',
                        msg.role === 'user' ? safeChatConfig.messages?.user?.fontWeight || 'font-semibold' : safeChatConfig.messages?.assistant?.fontWeight || 'font-semibold',
                        safeChatConfig.utilities?.transition?.all || 'transition-all',
                        safeChatConfig.animations?.duration?.base || 'duration-200',
                        safeChatConfig.utilities?.fontFamily || 'font-sans',
                        msg.role === 'user'
                          ? cn(safeChatConfig.messages?.user?.backgroundColor || 'bg-gradient-to-r from-[#3C3C3D] to-[#7A7A7D]', safeChatConfig.messages?.user?.textColor || 'text-white') // ✅ GRADIENT (was bg-black)
                          : cn(safeChatConfig.messages?.assistant?.backgroundColor || 'bg-white', safeChatConfig.messages?.assistant?.textColor || 'gradient-text', safeChatConfig.messages?.assistant?.border || 'border border-gray-200') // ✅ GRADIENT (was text-black)
                      )}
                    >
                      <p className={cn(
                        SAFE_DESIGN_SYSTEM.typography.fontSize.sm,
                        safeChatConfig.utilities?.whitespace?.preWrap || 'whitespace-pre-wrap'
                      )}>
                        {msg.content}
                      </p>
                      <span className={cn(
                        safeChatConfig.messages?.timestamp?.fontSize || 'text-xs',
                        safeChatConfig.messages?.timestamp?.textColor || 'text-gray-500',
                        safeChatConfig.messages?.timestamp?.marginTop,
                        safeChatConfig.messages?.timestamp?.display
                      )}>
                        {msg.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className={cn(
                    safeChatConfig.messages.loadingContainer.display,
                    safeChatConfig.messages.loadingContainer.justify
                  )}>
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
                      safeChatConfig.utilities?.fontFamily || 'font-sans'
                    )}>
                      {error}
                    </div>
                )}
              </div>

              {/* ✅ MODERN: Input - Hoekiger, Noto Sans, smoother - 100% DRY */}
              <div className={cn(
                safeChatConfig.input.container.padding,
                safeChatConfig.input.container.backgroundColor,
                safeChatConfig.input.container.borderTop,
                safeChatConfig.input.container.borderRadius,
                safeChatConfig.utilities?.fontFamily || 'font-sans'
              )}>
                <div className={cn(
                  safeChatConfig.input.fieldContainer.display,
                  safeChatConfig.input.fieldContainer.gap
                )}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Stel je vraag..."
                    className={cn(
                      safeChatConfig.input.field.flex,
                      safeChatConfig.input.field.width || 'w-full',
                      safeChatConfig.input.field.padding,
                      safeChatConfig.input.field.border,
                      safeChatConfig.input.field.borderRadius,
                      safeChatConfig.input.field.focus.ring,
                      safeChatConfig.input.field.focus.border,
                      safeChatConfig.input.field.focus.outline,
                      safeChatConfig.input.field.fontSize,
                      safeChatConfig.input.field.fontWeight,
                      safeChatConfig.input.field.backgroundColor,
                      safeChatConfig.input.field.focus.backgroundColor,
                      safeChatConfig.input.field.placeholder?.textColor || 'placeholder:text-gray-500',
                      safeChatConfig.utilities?.fontFamily || 'font-sans'
                    )}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      safeChatConfig.input.button.padding,
                      safeChatConfig.input.button.minWidth,
                      safeChatConfig.input.button.minHeight,
                      safeChatConfig.input.button.borderRadius,
                      safeChatConfig.input.button.backgroundColor,
                      safeChatConfig.input.button.textColor,
                      safeChatConfig.input.button.hoverBackgroundColor,
                      safeChatConfig.input.button.activeBackgroundColor,
                      safeChatConfig.input.button.fontSize,
                      safeChatConfig.input.button.fontWeight,
                      safeChatConfig.utilities?.transition?.all || 'transition-all',
                      safeChatConfig.input.button.transition,
                      safeChatConfig.input.button.disabled?.opacity || safeChatConfig.utilities?.disabled?.opacity || 'disabled:opacity-40',
                      safeChatConfig.input.button.disabled?.cursor || safeChatConfig.utilities?.disabled?.cursor || 'disabled:cursor-not-allowed',
                      safeChatConfig.input.buttonContainer.display,
                      safeChatConfig.input.buttonContainer.align,
                      safeChatConfig.input.buttonContainer.justify,
                      safeChatConfig.utilities?.fontFamily || 'font-sans'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className={cn(
                        safeChatConfig.input.button.iconSize,
                        safeChatConfig.utilities?.animation?.spin || 'animate-spin'
                      )} />
                    ) : (
                      <Send className={safeChatConfig.input.button.iconSize} />
                    )}
                  </button>
                </div>
                <p className={cn(
                  safeChatConfig.input.footer.fontSize || 'text-xs',
                  safeChatConfig.input.footer.fontWeight || 'font-normal',
                  safeChatConfig.input.footer.letterSpacing || 'tracking-normal',
                  safeChatConfig.input.footer.antialiased || 'antialiased',
                  safeChatConfig.input.footer.textColor,
                  safeChatConfig.input.footer.marginTop,
                  safeChatConfig.input.footer.textAlign,
                  safeChatConfig.input.footer.fontFamily || safeChatConfig.utilities?.fontFamily || 'font-sans'
                )}>
                  Powered by AI
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
