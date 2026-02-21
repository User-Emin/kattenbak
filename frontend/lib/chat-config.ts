/**
 * CHAT POPUP CONFIGURATION - DRY & SECURE
 * ✅ Single source of truth voor chat styling
 * ✅ Geen hardcoding - alle values via DESIGN_SYSTEM
 * ✅ Type-safe configuratie
 */

import { DESIGN_SYSTEM } from './design-system';

export const CHAT_CONFIG = {
  // Button styling - ULTRA MODERN, dynamisch via DESIGN_SYSTEM
  button: {
    size: 'px-4 py-3', // ✅ OVAAL: Rechthoekig maar rond
    borderRadius: 'rounded-full', // ✅ PILVORM: rondere hoeken
    backgroundColor: 'bg-black', // ✅ ZWART: Volledig zwart zoals gevraagd
    textColor: 'text-white', // ✅ WIT SYMBOOL: Symbool wit
    hoverBackgroundColor: 'hover:bg-gray-900', // ✅ HOVER: Donkerder zwart
    border: 'border-2 border-black', // ✅ BORDER: Volledig zwart
    shadow: DESIGN_SYSTEM.effects.shadow.lg, // ✅ DYNAMISCH: via DESIGN_SYSTEM
    zIndex: 'z-[50]', // ✅ DYNAMISCH: DESIGN_SYSTEM.layoutUtils.zIndex.dropdown - Tailwind class
    position: {
      type: DESIGN_SYSTEM.layoutUtils.position.fixed,
      right: DESIGN_SYSTEM.layout.chatButton?.right ?? 'right-2',
      bottom: 'bottom-6',
      bottomWithCart: 'bottom-32 md:bottom-28',
    },
    display: DESIGN_SYSTEM.layoutUtils.display.flex,
    align: DESIGN_SYSTEM.layoutUtils.flex.align.center,
    justify: DESIGN_SYSTEM.layoutUtils.flex.justify.center,
    transition: 'transition-all duration-200 ease-in-out', // ✅ Direct Tailwind classes
    transitionClasses: 'transition-all duration-200 ease-in-out', // ✅ DYNAMISCH: DESIGN_SYSTEM layoutUtils + transitions - Tailwind classes
    hoverScale: 'hover:scale-105', // ✅ MODERN: subtieler bij ovaal
    activeScale: 'active:scale-95', // ✅ MODERN: press feedback
    focus: {
      outline: 'focus:outline-none',
      ring: 'focus:ring-4',
      ringColor: 'focus:ring-gray-400/30', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[400] - Tailwind class
    },
    iconSize: 'w-5 h-5', // ✅ MODERN: iets compacter door tekst
    pulse: '', // ✅ FIX: Geen beweging (was animate-pulse)
  },

  // Modal styling - ULTRA MODERN, 100% Dynamisch via DESIGN_SYSTEM
  modal: {
    maxWidth: 'max-w-sm',
    maxHeight: 'max-h-[90vh] sm:max-h-[85vh]',
    backgroundColor: 'bg-white', // ✅ DESIGN_SYSTEM.layout.chatModal.messagesBg (#ffffff)
    borderRadius: DESIGN_SYSTEM.layout.chatModal.modalBorderRadius ?? 'rounded-3xl sm:rounded-[2rem]',
    border: 'border border-black/10',
    shadow: DESIGN_SYSTEM.effects.shadow.lg, // ✅ DYNAMISCH: via DESIGN_SYSTEM
    zIndex: 200, // ✅ Consistent met cookie modal z-[200]
    overflow: 'overflow-hidden', // ✅ Consistent met cookie modal
    transition: 'transition-all duration-300', // ✅ Direct Tailwind classes
    // Note: Container and content layout utilities are in animations.modal
  },

  // Header styling - ✅ ZWART: geen grijs, altijd zwart (design-system headerBg #000000)
  header: {
    backgroundColor: 'bg-black',
    textColor: 'text-white',
    padding: 'px-4 py-3',
    borderRadius: DESIGN_SYSTEM.layout.chatModal?.headerBorderRadius ?? 'rounded-t-3xl sm:rounded-t-[2rem]',
    borderBottom: 'border-b border-black/10',
    sticky: 'sticky top-0', // ✅ Consistent met cookie modal
    transition: 'transition-all duration-200', // ✅ Direct Tailwind classes
    container: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      justify: DESIGN_SYSTEM.layoutUtils.flex.justify.between,
      align: DESIGN_SYSTEM.layoutUtils.flex.align.center, // ✅ WHATSAPP: Center align (was start)
      marginBottom: 'mb-0', // ✅ WHATSAPP: Geen margin (was mb-2)
    },
    title: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.lg, // ✅ WHATSAPP: Iets kleiner (was xl)
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold, // ✅ DIKKER: 600
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ Noto Sans
      letterSpacing: 'tracking-normal', // ✅ WHATSAPP: Normale spacing (was tight)
      textColor: 'text-white', // ✅ WIT: Op gradient achtergrond (was gradient-text)
    },
    subtitle: {
      display: 'hidden', // ✅ WHATSAPP: Verberg subtitle (alleen naam)
    },
    closeButton: {
      textColor: 'text-white',
      hoverTextColor: 'hover:text-white/80',
      transition: 'transition-colors',
      padding: DESIGN_SYSTEM.layout.chatModal?.closeButtonPadding ?? 'p-2',
      borderRadius: DESIGN_SYSTEM.layout.chatModal?.closeButtonRounded ?? 'rounded-md',
      hoverBackground: 'hover:bg-white/10',
    },
  },

  // Messages: wit, geen grijze details
  messages: {
    container: {
      padding: 'p-4 sm:p-6',
      backgroundColor: 'bg-white',
      spacing: 'space-y-4',
      flex: DESIGN_SYSTEM.layoutUtils.flex.grow.grow,
      overflow: DESIGN_SYSTEM.layoutUtils.overflow.yAuto,
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      direction: DESIGN_SYSTEM.layoutUtils.flex.direction.col,
      transition: 'transition-all duration-200', // ✅ Direct Tailwind classes
    },
    messageWrapper: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      userJustify: DESIGN_SYSTEM.layoutUtils.flex.justify.end,
      assistantJustify: DESIGN_SYSTEM.layoutUtils.flex.justify.start,
      padding: 'px-2', // ✅ FIX: Padding links/rechts zodat tekst niet aan zijkanten plakt
      transition: 'transition-all duration-200', // ✅ Direct Tailwind classes
    },
    user: {
      backgroundColor: `bg-gradient-to-r from-[${DESIGN_SYSTEM.colors.primaryStart}] to-[${DESIGN_SYSTEM.colors.primaryEnd}]`, // ✅ GRADIENT DYNAMISCH: Via DESIGN_SYSTEM (geen hardcode)
      textColor: 'text-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.text.inverse (#ffffff) - Tailwind class
      borderRadius: 'rounded-xl', // ✅ RONDER: Extra ronde hoeken, smoother
      padding: 'p-4', // ✅ DYNAMISCH: DESIGN_SYSTEM.spacing[4] - Tailwind class
      maxWidth: 'max-w-[85%]',
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold, // ✅ DIKKER: 700 - dikker dan banner
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      transition: 'transition-all duration-200', // ✅ DYNAMISCH: DESIGN_SYSTEM layoutUtils + transitions - Tailwind classes
    },
    assistant: {
      backgroundColor: 'bg-white',
      textColor: 'text-black',
      border: 'border border-black/10',
      borderRadius: 'rounded-xl', // ✅ RONDER: Extra ronde hoeken, smoother
      padding: 'p-4', // ✅ DYNAMISCH: DESIGN_SYSTEM.spacing[4] - Tailwind class
      maxWidth: 'max-w-[85%]',
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold, // ✅ DIKKER: 700 - dikker dan banner
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      transition: 'transition-all duration-200', // ✅ DYNAMISCH: DESIGN_SYSTEM layoutUtils + transitions - Tailwind classes
    },
    timestamp: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
      textColor: 'text-black/70',
      marginTop: 'mt-1',
      display: DESIGN_SYSTEM.layoutUtils.display.block,
    },
    loadingContainer: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      justify: DESIGN_SYSTEM.layoutUtils.flex.justify.start,
    },
  },

  // Input: zwart typgebied uit layout.chatModal, ronde hoeken ook mobiel
  input: {
    container: {
      padding: 'p-3 sm:p-4',
      backgroundColor: 'bg-white',
      borderTop: 'border-t border-black/10',
      borderRadius: DESIGN_SYSTEM.layout.chatModal?.inputBottomBorderRadius ?? 'rounded-b-3xl',
      transition: 'transition-all duration-200',
    },
    fieldContainer: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      gap: 'gap-2',
    },
    buttonContainer: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      align: DESIGN_SYSTEM.layoutUtils.flex.align.center,
      justify: DESIGN_SYSTEM.layoutUtils.flex.justify.center,
    },
    field: {
      flex: DESIGN_SYSTEM.layoutUtils.flex.grow.grow,
      borderRadius: 'rounded-full',
      border: 'border border-black/20',
      backgroundColor: 'bg-white',
      textColor: 'text-black',
      padding: 'px-4 py-2.5',
      width: 'w-full',
      fontSize: DESIGN_SYSTEM.typography.fontSize.base,
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
      placeholder: { textColor: 'placeholder:text-black/50' },
      focus: {
        ring: 'focus:ring-2 focus:ring-black/20',
        border: 'focus:border-black/40',
        backgroundColor: 'focus:bg-white',
        outline: 'focus:outline-none',
      },
      transition: 'transition-all duration-200 ease-out',
    },
    button: {
      borderRadius: 'rounded-full',
      backgroundColor: 'bg-black',
      textColor: 'text-white',
      hoverBackgroundColor: 'hover:bg-gray-900',
      activeBackgroundColor: 'active:bg-black',
      padding: 'p-2.5',
      minWidth: 'min-w-[44px]',
      minHeight: 'min-h-[44px]',
      fontSize: DESIGN_SYSTEM.typography.fontSize.base,
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
      iconSize: 'w-5 h-5',
      disabled: { opacity: 'disabled:opacity-40', cursor: 'disabled:cursor-not-allowed' },
      transition: 'transition-all duration-150 ease-out',
    },
    footer: {
      marginTop: 'mt-1.5',
      textAlign: 'text-center',
      fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
      textColor: 'text-white/80',
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
      letterSpacing: 'tracking-normal',
      antialiased: 'antialiased',
    },
  },

  // Animations - Smoother
  animations: {
    duration: {
      fast: DESIGN_SYSTEM.transitions.duration.fast, // 150ms
      base: DESIGN_SYSTEM.transitions.duration.base, // 200ms
      slow: DESIGN_SYSTEM.transitions.duration.slow, // 300ms
    },
    timing: {
      ease: DESIGN_SYSTEM.transitions.timing.easeOut, // ease-out voor smoother
    },
    backdrop: {
      fadeIn: '', // ✅ GEEN ANIMATIE: Backdrop niet zichtbaar, dus geen fade-in nodig
      backgroundColor: 'bg-black/10', // ✅ KLEINE BLUR ACHTERGROND: Subtiele overlay bij openen chatbot (was bg-transparent)
      blur: 'backdrop-blur-sm', // ✅ KLEINE BLUR: Subtiele blur voor focus (was '')
      zIndex: DESIGN_SYSTEM.layoutUtils.zIndex.backdrop,
      mobileTransparent: '', // ✅ GEEN MOBILE OVERRIDE: Overal transparant
      mobilePointerEvents: DESIGN_SYSTEM.layoutUtils.pointerEvents.none, // ✅ POINTER EVENTS NONE: Backdrop niet klikbaar
      position: DESIGN_SYSTEM.layoutUtils.position.fixed,
      inset: 'inset-0',
      transition: '', // ✅ GEEN TRANSITION: Backdrop niet zichtbaar, dus geen transition nodig
    },
    modal: {
      slideIn: 'animate-in zoom-in-95 duration-300 ease-out', // ✅ DYNAMISCH: DESIGN_SYSTEM transitions - Tailwind classes
    container: {
      position: DESIGN_SYSTEM.layoutUtils.position.fixed,
      inset: 'inset-0', // ✅ VOLLEDIG TRANSPARANT: Container bedekt viewport maar is volledig transparant, achtergrond blijft zichtbaar
      zIndex: 'z-[200]', // ✅ Consistent met cookie modal
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      align: DESIGN_SYSTEM.layoutUtils.flex.align.end, // ✅ POPUP: Boven button (end i.p.v. center)
      justify: DESIGN_SYSTEM.layoutUtils.flex.justify.end, // ✅ POPUP: Rechts (end i.p.v. center)
      padding: 'p-3 sm:p-4 pb-24 sm:pb-24', // ✅ POPUP: Padding onderaan (96px) voor ruimte boven button (64px button + 32px gap)
      pointerEvents: DESIGN_SYSTEM.layoutUtils.pointerEvents.none, // ✅ POINTER EVENTS NONE: Container niet klikbaar, alleen content
      backgroundColor: 'bg-transparent', // ✅ VOLLEDIG TRANSPARANT: Container bedekt niets, achtergrond blijft volledig zichtbaar
      transition: 'transition-all duration-300', // ✅ Direct Tailwind classes
    },
      content: {
        pointerEvents: DESIGN_SYSTEM.layoutUtils.pointerEvents.auto,
        width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull,
        display: DESIGN_SYSTEM.layoutUtils.display.flex,
        direction: DESIGN_SYSTEM.layoutUtils.flex.direction.col,
        position: 'relative', // ✅ Consistent met cookie modal
        marginBottom: 'mb-4', // ✅ POPUP: Margin onderaan zodat modal boven button verschijnt
        transition: 'transition-all duration-300', // ✅ Direct Tailwind classes
      },
    },
  },

  // Empty state: geen grijze details
  emptyState: {
    iconSize: 'w-12 h-12',
    iconColor: 'text-black/70',
    textColor: 'text-black',
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
    container: {
      align: DESIGN_SYSTEM.layoutUtils.flex.align.center,
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
      backgroundColor: 'bg-white',
      hoverBackgroundColor: 'hover:bg-black/5',
      border: 'border border-black/10',
      borderRadius: 'rounded-xl',
      padding: 'px-4 py-2',
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold, // ✅ DIKKER: 700 - dikker dan banner
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
      display: DESIGN_SYSTEM.layoutUtils.display.block,
      width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull,
      textAlign: 'text-left',
    },
  },

  // Loading state: geen grijze details
  loading: {
    backgroundColor: 'bg-white',
    border: 'border border-black/10',
    borderRadius: 'rounded-lg', // ✅ RONDER: Minder hoekig, smoother
    padding: 'p-4', // ✅ Direct Tailwind class (was: template literal)
    iconColor: `text-[${DESIGN_SYSTEM.colors.primaryStart}]`, // ✅ DESIGN_SYSTEM: primaryStart
    iconSize: 'w-5 h-5',
  },

  // Error state - Zwart-wit (GEEN transparantie)
  error: {
    backgroundColor: 'bg-red-50', // ✅ Red-50 (geen transparantie)
    border: 'border border-red-200',
    borderRadius: 'rounded-xl', // ✅ RONDER: Extra ronde hoeken, smoother
    padding: 'p-3', // ✅ Direct Tailwind class (was: DESIGN_SYSTEM.spacing[3] = '0.75rem' string)
    textColor: 'text-red-800', // ✅ Red-800 (geen transparantie)
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold, // ✅ DIKKER: 700 - dikker dan banner
  },

  // Global utilities - DRY
  utilities: {
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
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
} as const;
