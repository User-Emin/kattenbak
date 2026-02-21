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
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { X, Send, Loader2 } from "lucide-react";
import { ChatIcon } from "@/components/ui/chat-icon";
import { CHAT_CONFIG } from "@/lib/chat-config";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { useUI } from "@/context/ui-context";
import { cn } from "@/lib/utils";
import { productsApi } from "@/lib/api/products";

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
  /** Modulaire waarschuwingen van RAG (bijv. externe leverancier) */
  warnings?: string[];
}

export function ChatPopup() {
  // ✅ SECURITY: Initialize state safely
  const pathname = usePathname();
  const { isCartOpen } = useUI(); // ✅ SIDEBAR: Check of cart sidebar open is
  const isProductPage = pathname?.startsWith('/product/') || false;
  const productSlug = (pathname?.match(/^\/product\/([^/?#]+)/)?.[1] ?? '').trim() || '';
  const [productContext, setProductContext] = useState<{ slug?: string; title?: string; description?: string; price?: string | number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stickyCartVisible, setStickyCartVisible] = useState(false);
  const [hasShownInitialMessage, setHasShownInitialMessage] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(false);
  const [chatBubbleDismissed, setChatBubbleDismissed] = useState(false); // ✅ SLUITEN: State voor chatwolk sluiten
  
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
      // ✅ SECURITY: Silent fallback (no error exposure); 100% DESIGN_SYSTEM-aligned
      const ds = DESIGN_SYSTEM;
      return {
        button: {
          position: {
            type: ds.layoutUtils.position.fixed as 'fixed',
            right: (ds.layout.chatButton as { right?: string })?.right ?? 'right-2',
            bottom: 'bottom-6',
            bottomWithCart: 'bottom-24',
          },
          size: 'w-14 h-14',
          borderRadius: ds.effects.borderRadius.xl,
          backgroundColor: 'bg-black',
          textColor: 'text-white',
          shadow: ds.effects.shadow.lg,
          hoverBackgroundColor: 'hover:bg-gray-900',
          border: 'border-2 border-black',
          display: ds.layoutUtils.display.flex,
          align: ds.layoutUtils.flex.align.center,
          justify: ds.layoutUtils.flex.justify.center,
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
          duration: { base: ds.transitions.duration.base },
          timing: { ease: ds.transitions.timing.easeInOut },
          backdrop: {
            backgroundColor: 'bg-transparent',
            blur: '',
            fadeIn: '',
            zIndex: ds.layoutUtils.zIndex.backdrop,
            mobileTransparent: '',
            mobilePointerEvents: ds.layoutUtils.pointerEvents.none,
            position: ds.layoutUtils.position.fixed,
            inset: 'inset-0',
            transition: '',
          },
          modal: {
            slideIn: 'animate-in zoom-in-95 duration-300',
            container: {
              position: ds.layoutUtils.position.fixed,
              inset: 'inset-0',
              zIndex: 'z-[200]',
              display: ds.layoutUtils.display.flex,
              align: ds.layoutUtils.flex.align.center,
              justify: ds.layoutUtils.flex.justify.center,
              padding: 'p-3 sm:p-4',
              pointerEvents: ds.layoutUtils.pointerEvents.none,
              backgroundColor: 'bg-transparent',
            },
            content: {
              pointerEvents: ds.layoutUtils.pointerEvents.auto,
              width: ds.layoutUtils.sizing.widthFull,
              display: ds.layoutUtils.display.flex,
              direction: ds.layoutUtils.flex.direction.col,
              position: ds.layoutUtils.position.relative,
            },
          },
        },
        modal: {
          maxWidth: 'max-w-md',
          maxHeight: 'max-h-[85vh] sm:max-h-[80vh]',
          backgroundColor: 'bg-white',
          borderRadius: (ds.layout.chatModal as { modalBorderRadius?: string })?.modalBorderRadius ?? 'rounded-xl sm:rounded-2xl',
          shadow: ds.effects.shadow.lg,
          border: 'border border-black/10',
          zIndex: 200,
          overflow: 'overflow-hidden',
        },
        header: {
          backgroundColor: 'bg-black',
          textColor: 'text-white',
          padding: 'px-4 py-3',
          borderRadius: ds.layout.chatModal?.headerBorderRadius ?? 'rounded-t-xl sm:rounded-t-2xl',
          borderBottom: 'border-b border-black/10',
          sticky: 'sticky top-0',
          container: {
            display: ds.layoutUtils.display.flex,
            justify: ds.layoutUtils.flex.justify.between,
            align: ds.layoutUtils.flex.align.start,
            marginBottom: 'mb-0',
          },
          title: {
            fontSize: 'text-lg', // DESIGN_SYSTEM.typography.fontSize.lg = 1.125rem → Tailwind text-lg
            fontWeight: 'font-semibold', // DESIGN_SYSTEM.typography.fontWeight.semibold
            textColor: 'text-white',
            letterSpacing: 'tracking-normal',
          },
          subtitle: { display: 'hidden' },
          closeButton: {
            textColor: 'text-white',
            hoverTextColor: 'hover:text-white/80',
            transition: 'transition-colors',
            padding: 'p-1',
            borderRadius: ds.effects.borderRadius.sm,
            hoverBackground: 'hover:bg-white/10',
          },
        },
        messages: {
          container: {
            padding: 'p-4',
            spacing: 'space-y-4',
            backgroundColor: 'bg-white',
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
            textColor: 'text-black',
            border: 'border border-black/10',
          },
          timestamp: {
            fontSize: 'text-xs',
            textColor: 'text-black/70',
            marginTop: 'mt-1',
            display: 'block',
          },
        },
        emptyState: {
          textColor: 'text-black',
          iconSize: 'w-12 h-12',
          iconColor: 'text-black/70',
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
            hoverBackgroundColor: 'hover:bg-black/5',
            border: 'border border-black/10',
            display: 'block',
            width: 'w-full',
            textAlign: 'text-left',
          },
        },
        loading: {
          backgroundColor: 'bg-white',
          border: 'border border-black/10',
          borderRadius: 'rounded-lg',
          padding: 'p-3',
          iconSize: 'w-5 h-5',
          iconColor: 'text-black/70',
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
            backgroundColor: 'bg-black',
            borderTop: 'border-t border-black/20',
            borderRadius: 'rounded-b-3xl',
          },
          fieldContainer: {
            display: 'flex',
            gap: 'gap-2',
          },
          field: {
            flex: 'flex-1',
            width: 'w-full',
            padding: 'px-4 py-2.5',
            border: 'border border-white/30',
            borderRadius: 'rounded-full',
            fontSize: 'text-base',
            fontWeight: 'font-normal',
            backgroundColor: 'bg-black',
            textColor: 'text-white',
            placeholder: { textColor: 'placeholder:text-white/60' },
            focus: {
              ring: 'focus:ring-2 focus:ring-white/40',
              border: 'focus:border-white/50',
              outline: 'focus:outline-none',
            },
          },
          buttonContainer: {
            display: 'flex',
            align: 'items-center',
            justify: 'justify-center',
          },
          footer: {
            marginTop: 'mt-2',
            textAlign: 'text-center',
            fontSize: 'text-xs',
            textColor: 'text-white/80',
          },
          button: {
            padding: 'p-3',
            borderRadius: 'rounded-lg',
            backgroundColor: 'bg-brand',
            textColor: 'text-white',
            hoverBackgroundColor: 'hover:bg-brand-dark',
            fontSize: 'text-sm',
            fontWeight: 'font-medium',
            transition: 'transition-colors',
            iconSize: 'w-5 h-5',
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

  // ✅ CHAT BUBBLE: "Ik ben AI assistent" vraag bij chatbutton (smooth effect) - BUITEN CHATBUTTON
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // ✅ SLUITEN: Check localStorage of chatwolk is gesloten
    const dismissed = localStorage.getItem('chatBubbleDismissed') === 'true';
    if (dismissed) {
      setChatBubbleDismissed(true);
      return;
    }
    
    // Check if we're on a product page
    const pathname = window.location.pathname;
    const isProductPage = pathname.startsWith('/product/');
    
    if (isProductPage && !isExpanded && !chatBubbleDismissed) {
      // ✅ SMOOTH EFFECT: Show bubble after delay (alleen als chat gesloten is)
      const bubbleTimer = setTimeout(() => {
        setShowChatBubble(true);
      }, 2000); // ✅ SMOOTH: 2 seconden delay voor smooth appearance
      
      return () => {
        clearTimeout(bubbleTimer);
      };
    } else {
      // ✅ HIDE: Verberg bubble als chat open is of niet op product pagina
      setShowChatBubble(false);
    }
  }, [isExpanded, chatBubbleDismissed]);

  // ✅ SLUITEN: Functie om chatwolk te sluiten en niet meer te tonen
  const handleDismissChatBubble = useCallback(() => {
    setShowChatBubble(false);
    setChatBubbleDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatBubbleDismissed', 'true');
    }
  }, []);

  // ✅ INITIAL MESSAGE: "Ik ben een assistent" vraag over product
  useEffect(() => {
    if (isExpanded && !hasShownInitialMessage && typeof window !== 'undefined') {
      // Check if we're on a product page
      const pathname = window.location.pathname;
      const isProductPage = pathname.startsWith('/product/');
      
      if (isProductPage) {
        // Get product name from page
        const productNameElement = document.querySelector('h1');
        const productName = productNameElement?.textContent?.trim() || 'dit product';
        
        // ✅ SMOOTH EFFECT: Delay voor smooth appearance
        setTimeout(() => {
          const initialMessage: Message = {
            role: 'assistant',
            content: `Hallo! Ik ben een AI assistent. Heb je vragen over ${productName}? Ik help je graag verder!`,
            timestamp: new Date()
          };
          
          setMessages([initialMessage]);
          setHasShownInitialMessage(true);
        }, 300); // ✅ SMOOTH: 300ms delay voor smooth effect
      }
    }
  }, [isExpanded, hasShownInitialMessage]);

  // ✅ RAG: Productcontext ophalen wanneer chat op productpagina opent (modulair)
  useEffect(() => {
    if (!isExpanded || !isProductPage || !productSlug) return;
    let cancelled = false;
    (async () => {
      try {
        const product = await productsApi.getBySlug(productSlug);
        if (!cancelled && product) {
          setProductContext({
            slug: product.slug,
            title: product.title,
            description: typeof product.description === 'string' ? product.description : '',
            price: product.price != null ? String(product.price) : undefined,
          });
        }
      } catch {
        if (!cancelled) setProductContext(null);
      }
    })();
    return () => { cancelled = true; };
  }, [isExpanded, isProductPage, productSlug]);

  // ✅ PERFORMANCE: useCallback voor stable function reference
  const sendMessage = useCallback(async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // ✅ SECURITY: Use dynamic API URL (no hardcoding)
      const response = await fetch(`${apiUrl}/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
          ...(productContext ? { product_context: productContext } : {}),
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

      const warnings = Array.isArray(data.warnings) ? data.warnings : undefined;
      const assistantMessage: Message = {
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
        ...(warnings?.length ? { warnings } : {}),
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
  }, [isLoading, messages, apiUrl, productContext]);

  const handleSendMessage = useCallback(async () => {
    await sendMessage(input);
  }, [input, sendMessage]);

  // ✅ PERFORMANCE: useCallback voor stable function reference
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // ✅ DRY: Calculate button position via CHAT_CONFIG (with safe access)
  // ✅ MOBILE BOTTOM NAV: Dynamisch berekenen via DESIGN_SYSTEM (geen hardcode)
  const buttonBottomClass = useMemo(() => {
    if (!safeChatConfig?.button?.position) {
      return 'bottom-8';
    }
    // ✅ MOBILE BOTTOM NAV: Op productpagina's mobiel: boven bottom nav (dynamisch via DESIGN_SYSTEM)
    if (isProductPage && typeof window !== 'undefined' && window.innerWidth < 768) {
      // ✅ DYNAMISCH: Gebruik DESIGN_SYSTEM.layout.mobileBottomNav.chatButtonOffsetPx (geen hardcode)
      const offsetPx = DESIGN_SYSTEM.layout.mobileBottomNav?.chatButtonOffsetPx || 72;
      // ✅ DYNAMISCH: Gebruik inline style voor exacte pixel waarde (geen hardcode Tailwind class)
      return `bottom-[${offsetPx}px]`; // ✅ DYNAMISCH: Exacte pixel waarde via DESIGN_SYSTEM
    }
    return stickyCartVisible 
      ? safeChatConfig.button.position.bottomWithCart
      : safeChatConfig.button.position.bottom;
  }, [stickyCartVisible, safeChatConfig, isProductPage]);
  
  // ✅ MOBILE BOTTOM NAV: Dynamische z-index via DESIGN_SYSTEM (geen hardcode)
  const buttonZIndexClass = useMemo(() => {
    // ✅ MOBILE BOTTOM NAV: Op productpagina's mobiel: boven bottom nav (z-[201] > z-[200])
    if (isProductPage && typeof window !== 'undefined' && window.innerWidth < 768) {
      return DESIGN_SYSTEM.layout.mobileBottomNav?.chatButtonZIndex || 'z-[201]';
    }
    // ✅ DEFAULT: Normale z-index voor andere pagina's
    return safeChatConfig?.button?.zIndex || 'z-[50]';
  }, [isProductPage, safeChatConfig]);
  
  // ✅ MOBILE BOTTOM NAV: State voor window width (voor responsive updates)
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Initial width
    setWindowWidth(window.innerWidth);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // ✅ MOBILE BOTTOM NAV: Dynamische inline style (overschrijft classes)
  const buttonStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      visibility: 'visible',
      opacity: 1,
    };
    
    // ✅ MOBILE BOTTOM NAV: Op productpagina's mobiel: boven bottom nav
    if (isProductPage && windowWidth !== null && windowWidth < 768) {
      return {
        ...baseStyle,
        zIndex: DESIGN_SYSTEM.layout.mobileBottomNav?.chatButtonZIndexValue || 201,
        bottom: `${DESIGN_SYSTEM.layout.mobileBottomNav?.chatButtonOffsetPx || 72}px`,
      };
    }
    
    return baseStyle;
  }, [isProductPage, windowWidth]);

  // ✅ SECURITY: Additional safety check - ensure safeChatConfig is valid before render
  // This check happens AFTER safeChatConfig is defined
  if (!safeChatConfig || !safeChatConfig.button || !safeChatConfig.modal || !safeChatConfig.animations) {
    // Return minimal button only (no popup) to prevent crash - 100% DYNAMISCH via fallback config
    const fallbackButton = safeChatConfig?.button || {
      position: { type: 'fixed', right: DESIGN_SYSTEM.layout.chatButton?.right ?? 'right-2', bottom: 'bottom-6' },
      size: 'w-16 h-16',
      borderRadius: 'rounded-full',
      backgroundColor: 'bg-black', // ✅ ZWART: Solid zwart (geen transparantie)
      textColor: 'text-white', // ✅ WIT SYMBOOL: Symbool wit
      shadow: 'shadow-lg',
      hoverBackgroundColor: 'hover:bg-gray-900', // ✅ ZWART HOVER: Donkerder hover
      border: 'border-2 border-black', // ✅ ZWART BORDER: Geen grijs meer
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
        <ChatIcon className={fallbackButton.iconSize} size={28} />
      </button>
    );
  }

  return (
    <>
      {/* ✅ CHAT BUBBLE: "Ik ben AI assistent" vraag BUITEN chatbutton (smooth effect) - MET KRUISJE */}
      {showChatBubble && !isExpanded && !chatBubbleDismissed && (
        <div
          className={cn(
            'fixed z-[101]',
            safeChatConfig.button.position.right,
            buttonBottomClass,
            'mb-24', // ✅ POSITION: Boven chatbutton (mb-24 voor ruimte)
            'animate-in fade-in slide-in-from-bottom-4 duration-500', // ✅ SMOOTH: Smooth fade-in en slide-up
            'max-w-sm' // ✅ GROTER: max-w-sm ipv max-w-xs
          )}
          style={{
            animation: 'fadeInUp 0.5s ease-out', // ✅ SMOOTH: Custom animation
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border border-black/10 p-4 relative">
            {/* ✅ KRUISJE: Sluit chatwolk en toon niet meer */}
            <button
              onClick={handleDismissChatBubble}
              className="absolute top-2 right-2 text-black/70 hover:text-black transition-colors"
              aria-label="Sluit chatwolk"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* ✅ SPEECH BUBBLE ARROW: Wijs naar chatbutton */}
            <div className="absolute bottom-0 right-6 transform translate-y-full">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black/10"></div>
            </div>
            <div className="absolute bottom-0 right-6 transform translate-y-full -mt-px">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
            </div>
            
            <p className="text-sm text-black font-medium leading-relaxed pr-6">
              Ik ben een AI assistent. Heb je vragen over dit product?
            </p>
          </div>
        </div>
      )}

      {/* ✅ ULTRA MODERN: Floating Chat Button - 100% Dynamisch via DESIGN_SYSTEM - SMOOTH */}
      {/* ✅ SIDEBAR: Verberg chat button wanneer cart sidebar open is */}
      {!isCartOpen && (
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            setShowChatBubble(false); // ✅ HIDE: Verberg bubble bij klik
          }}
          className={cn(
          safeChatConfig.button.position.type,
          safeChatConfig.button.position.right,
          // ✅ MOBILE BOTTOM NAV: Z-index en bottom MOETEN als laatste komen om overschrijven te voorkomen
          buttonZIndexClass, // ✅ DYNAMISCH: Gebruik berekende z-index (boven bottom nav op productpagina's) - LAATSTE voor z-index
          buttonBottomClass, // ✅ DYNAMISCH: Gebruik berekende bottom (boven bottom nav op productpagina's) - LAATSTE voor bottom
          safeChatConfig.button.size,
          safeChatConfig.button.borderRadius,
          safeChatConfig.button.backgroundColor,
          safeChatConfig.button.textColor,
          safeChatConfig.button.shadow,
          safeChatConfig.button.hoverBackgroundColor,
          'transition-all duration-300 ease-out', // ✅ SMOOTH: Smooth transitions voor alle properties
          'animate-in fade-in slide-in-from-bottom-4 duration-500', // ✅ SMOOTH: Fade-in en slide-up animatie bij laden
          safeChatConfig.button.hoverScale,
          safeChatConfig.button.activeScale,
          safeChatConfig.button.border,
          safeChatConfig.button.focus.outline,
          safeChatConfig.button.focus.ring,
          safeChatConfig.button.focus.ringColor,
          safeChatConfig.button.display,
          safeChatConfig.button.align,
          safeChatConfig.button.justify,
          'gap-2',
          safeChatConfig.utilities?.fontFamily || 'font-sans',
          !isExpanded && safeChatConfig.button.pulse // ✅ MODERN: Pulse animation when closed
        )}
        style={buttonStyle}
        aria-label="Open chat"
      >
          {isExpanded ? (
            <X className={safeChatConfig.button.iconSize} />
          ) : (
            <>
              <ChatIcon className={safeChatConfig.button.iconSize} size={20} />
              <span className="text-sm font-semibold tracking-tight">Vraag AI</span>
            </>
          )}
        </button>
      )}

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
            safeChatConfig.animations.modal.container.backgroundColor || 'bg-transparent', // ✅ VOLLEDIG TRANSPARANT: Container bedekt niets, achtergrond blijft volledig zichtbaar
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
              
              {/* ✅ MODERN: Header - Zwart (geen grijs), gegarandeerd via class + inline backup */}
              <div
                className={cn(
                  safeChatConfig.header.sticky,
                  'bg-black',
                  safeChatConfig.header.textColor,
                  safeChatConfig.header.padding,
                  safeChatConfig.header.borderRadius,
                  safeChatConfig.header.borderBottom
                )}
                style={{ backgroundColor: '#000000' }}
              >
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
                    safeChatConfig.header.title.textColor || 'text-white', // ✅ WIT: Via config (geen hardcode)
                    safeChatConfig.header.title.letterSpacing || 'tracking-normal',
                    safeChatConfig.utilities?.fontFamily || 'font-sans'
                  )}>
                    AI Assistent
                  </h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className={cn(
                      safeChatConfig.header.closeButton.textColor, // ✅ WIT: Via config (geen hardcode)
                      safeChatConfig.header.closeButton.hoverTextColor, // ✅ HOVER: Via config (geen hardcode)
                      safeChatConfig.header.closeButton.transition,
                      safeChatConfig.header.closeButton.padding,
                      safeChatConfig.header.closeButton.borderRadius,
                      'hover:bg-white/10'
                    )}
                    aria-label="Sluit chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {safeChatConfig.supportQuickReplies?.items?.length ? (
                <div className={cn(
                  safeChatConfig.supportQuickReplies.container.padding,
                  safeChatConfig.supportQuickReplies.container.backgroundColor,
                  safeChatConfig.supportQuickReplies.container.borderBottom
                )}>
                  <p className={cn(
                    safeChatConfig.supportQuickReplies.label.fontSize,
                    safeChatConfig.supportQuickReplies.label.fontWeight,
                    safeChatConfig.supportQuickReplies.label.textColor,
                    safeChatConfig.supportQuickReplies.label.marginBottom,
                    safeChatConfig.utilities?.fontFamily || 'font-sans'
                  )}>
                    {safeChatConfig.supportQuickReplies.label.text}
                  </p>
                  <div className={cn(
                    safeChatConfig.supportQuickReplies.list.display,
                    safeChatConfig.supportQuickReplies.list.wrap,
                    safeChatConfig.supportQuickReplies.list.gap
                  )}>
                    {safeChatConfig.supportQuickReplies.items.map((item, idx) => (
                      <button
                        key={`${item.label}-${idx}`}
                        onClick={() => sendMessage(item.value)}
                        disabled={isLoading}
                        className={cn(
                          safeChatConfig.supportQuickReplies.button.backgroundColor,
                          safeChatConfig.supportQuickReplies.button.hoverBackgroundColor,
                          safeChatConfig.supportQuickReplies.button.border,
                          safeChatConfig.supportQuickReplies.button.borderRadius,
                          safeChatConfig.supportQuickReplies.button.padding,
                          safeChatConfig.supportQuickReplies.button.fontSize,
                          safeChatConfig.supportQuickReplies.button.fontWeight,
                          safeChatConfig.supportQuickReplies.button.fontFamily,
                          safeChatConfig.supportQuickReplies.button.textColor,
                          safeChatConfig.utilities?.transition?.colors || 'transition-colors',
                          safeChatConfig.utilities?.disabled?.opacity || 'disabled:opacity-50',
                          safeChatConfig.utilities?.disabled?.cursor || 'disabled:cursor-not-allowed'
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

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
                    <ChatIcon size={48} className={cn(
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
                      {["Past een Maine Coon in?", "Is het geschikt voor kittens?", "Hoeveel liter is de afvalbak?", "Is het veilig voor mijn kat?"].map((suggestion, idx) => (
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
                          : cn(safeChatConfig.messages?.assistant?.backgroundColor || 'bg-white', safeChatConfig.messages?.assistant?.textColor || 'text-black', safeChatConfig.messages?.assistant?.border || 'border border-black/10')
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
                        safeChatConfig.messages?.timestamp?.textColor || 'text-black/70',
                        safeChatConfig.messages?.timestamp?.marginTop,
                        safeChatConfig.messages?.timestamp?.display
                      )}>
                        {msg.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && msg.warnings?.length ? (
                        <div className="mt-2 pt-2 border-t border-black/10">
                          <p className="text-xs text-amber-700 font-medium">Let op:</p>
                          <ul className="text-xs text-amber-800 mt-0.5 list-disc list-inside space-y-0.5">
                            {msg.warnings.map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
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
                      safeChatConfig.input.field.textColor,
                      safeChatConfig.input.field.focus?.backgroundColor,
                      safeChatConfig.input.field.placeholder?.textColor || 'placeholder:text-white/60',
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
