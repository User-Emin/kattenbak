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
    size: 'w-16 h-16', // ✅ MODERN: 64px (was 56px) - beter zichtbaar
    borderRadius: 'rounded-full', // ✅ ROND: Volledig rond zoals gevraagd
    backgroundColor: 'bg-black', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.primary (#000000) - Tailwind class
    textColor: 'text-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.text.inverse (#ffffff) - Tailwind class
    hoverBackgroundColor: 'hover:bg-gray-900', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[900] - Tailwind class
    border: 'border-2 border-gray-800', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[800] - Tailwind class
    shadow: DESIGN_SYSTEM.effects.shadow.lg, // ✅ DYNAMISCH: via DESIGN_SYSTEM
    zIndex: 'z-[50]', // ✅ DYNAMISCH: DESIGN_SYSTEM.layoutUtils.zIndex.dropdown - Tailwind class
    position: {
      type: DESIGN_SYSTEM.layoutUtils.position.fixed,
      right: 'right-6', // ✅ MODERN: meer ruimte (was right-4)
      bottom: 'bottom-6', // ✅ MODERN: meer ruimte (was bottom-8)
      bottomWithCart: 'bottom-32 md:bottom-28', // ✅ MODERN: responsive
    },
    display: DESIGN_SYSTEM.layoutUtils.display.flex,
    align: DESIGN_SYSTEM.layoutUtils.flex.align.center,
    justify: DESIGN_SYSTEM.layoutUtils.flex.justify.center,
    transition: 'transition-all duration-200 ease-in-out', // ✅ Direct Tailwind classes
    transitionClasses: 'transition-all duration-200 ease-in-out', // ✅ DYNAMISCH: DESIGN_SYSTEM layoutUtils + transitions - Tailwind classes
    hoverScale: 'hover:scale-110', // ✅ MODERN: smooth scale
    activeScale: 'active:scale-95', // ✅ MODERN: press feedback
    focus: {
      outline: 'focus:outline-none',
      ring: 'focus:ring-4',
      ringColor: 'focus:ring-gray-400/30', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[400] - Tailwind class
    },
    iconSize: 'w-7 h-7', // ✅ MODERN: groter icon (was w-6 h-6)
    pulse: 'animate-pulse', // ✅ MODERN: subtle pulse animation
  },

  // Modal styling - ULTRA MODERN, 100% Dynamisch via DESIGN_SYSTEM
  modal: {
    maxWidth: 'max-w-md', // Consistent met cookie modal max-w-xl pattern
    maxHeight: 'max-h-[85vh] sm:max-h-[80vh]', // Consistent met cookie modal
    backgroundColor: 'bg-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.secondary (#ffffff) - Tailwind class
    borderRadius: 'rounded-2xl sm:rounded-3xl', // ✅ RONDER: Minder hoekig, smoother
    border: 'border border-gray-200', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[200] - Tailwind class
    shadow: DESIGN_SYSTEM.effects.shadow.lg, // ✅ DYNAMISCH: via DESIGN_SYSTEM
    zIndex: 200, // ✅ Consistent met cookie modal z-[200]
    overflow: 'overflow-hidden', // ✅ Consistent met cookie modal
    transition: 'transition-all duration-300', // ✅ Direct Tailwind classes
    // Note: Container and content layout utilities are in animations.modal
  },

  // Header styling - ULTRA MODERN, 100% Dynamisch via DESIGN_SYSTEM
  header: {
    backgroundColor: 'bg-black', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.primary (#000000) - Tailwind class
    textColor: 'text-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.text.inverse (#ffffff) - Tailwind class
    padding: 'px-4 py-3', // ✅ Consistent met cookie modal (was spacing[6])
    borderRadius: 'rounded-t-2xl sm:rounded-t-3xl', // ✅ RONDER: Consistent met modal borderRadius
    borderBottom: 'border-b border-gray-700/20', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[700] - Tailwind class
    sticky: 'sticky top-0', // ✅ Consistent met cookie modal
    transition: 'transition-all duration-200', // ✅ Direct Tailwind classes
    container: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      justify: DESIGN_SYSTEM.layoutUtils.flex.justify.between,
      align: DESIGN_SYSTEM.layoutUtils.flex.align.start,
      marginBottom: 'mb-2',
    },
    title: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.xl, // 20px
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold, // ✅ DIKKER: 600 - zoals in banner
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings, // Noto Sans
      letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight, // Logo style
      textColor: 'text-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.text.inverse (#ffffff) - Tailwind class
    },
    subtitle: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold, // ✅ DIKKER: 600 - zoals in banner
      textColor: 'text-gray-300', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[300] - Tailwind class
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      marginTop: 'mt-1',
    },
    closeButton: {
      textColor: 'text-gray-400', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[400] - Tailwind class
      hoverTextColor: 'hover:text-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.text.inverse - Tailwind class
      transition: 'transition-colors', // ✅ DYNAMISCH: DESIGN_SYSTEM.layoutUtils.transitions.colors - Tailwind class
      padding: 'p-1', // ✅ DYNAMISCH: DESIGN_SYSTEM.spacing[1] - Tailwind class
      borderRadius: 'rounded-sm', // ✅ DYNAMISCH: DESIGN_SYSTEM.effects.borderRadius.sm - Tailwind class
      hoverBackground: 'hover:bg-gray-800', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[800] - Tailwind class
    },
  },

  // Messages styling - ULTRA MODERN, 100% Dynamisch via DESIGN_SYSTEM
  messages: {
    container: {
      padding: 'p-4 sm:p-6', // ✅ DYNAMISCH: 16px mobile, 24px desktop (was: DESIGN_SYSTEM.spacing[6] = '1.5rem' string)
      backgroundColor: 'bg-gray-50', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[50] - Tailwind class
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
      backgroundColor: 'bg-black', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.primary (#000000) - Tailwind class
      textColor: 'text-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.text.inverse (#ffffff) - Tailwind class
      borderRadius: 'rounded-lg', // ✅ RONDER: Minder hoekig, smoother
      padding: 'p-4', // ✅ DYNAMISCH: DESIGN_SYSTEM.spacing[4] - Tailwind class
      maxWidth: 'max-w-[85%]',
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold, // ✅ DIKKER: 600 - zoals in banner
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      transition: 'transition-all duration-200', // ✅ DYNAMISCH: DESIGN_SYSTEM layoutUtils + transitions - Tailwind classes
    },
    assistant: {
      backgroundColor: 'bg-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.secondary (#ffffff) - Tailwind class
      textColor: 'text-black', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.text.primary (#000000) - Tailwind class
      border: 'border border-gray-200', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[200] - Tailwind class
      borderRadius: 'rounded-lg', // ✅ RONDER: Minder hoekig, smoother
      padding: 'p-4', // ✅ DYNAMISCH: DESIGN_SYSTEM.spacing[4] - Tailwind class
      maxWidth: 'max-w-[85%]',
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold, // ✅ DIKKER: 600 - zoals in banner
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      transition: 'transition-all duration-200', // ✅ DYNAMISCH: DESIGN_SYSTEM layoutUtils + transitions - Tailwind classes
    },
    timestamp: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.xs, // 12px
      textColor: 'text-gray-500', // ✅ Gray-500 (geen opacity, solid color)
      marginTop: 'mt-1',
      display: DESIGN_SYSTEM.layoutUtils.display.block,
    },
    loadingContainer: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      justify: DESIGN_SYSTEM.layoutUtils.flex.justify.start,
    },
  },

  // Input styling - ULTRA MODERN, 100% Dynamisch via DESIGN_SYSTEM
  input: {
    container: {
      padding: 'p-4', // ✅ Direct Tailwind class (was: DESIGN_SYSTEM.spacing[4] = '1rem' string)
      backgroundColor: 'bg-white', // ✅ Direct Tailwind class (was: DESIGN_SYSTEM.colors.secondary = '#ffffff' string)
      borderTop: 'border-t border-gray-200', // ✅ Direct Tailwind class (was: template literal)
      borderRadius: 'rounded-b-2xl sm:rounded-b-3xl', // ✅ RONDER: Consistent met modal borderRadius
      transition: 'transition-all duration-200', // ✅ Direct Tailwind classes
    },
    fieldContainer: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      gap: 'gap-2',
    },
    field: {
      flex: DESIGN_SYSTEM.layoutUtils.flex.grow.grow,
    },
    buttonContainer: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      align: DESIGN_SYSTEM.layoutUtils.flex.align.center,
      justify: DESIGN_SYSTEM.layoutUtils.flex.justify.center,
    },
    footer: {
      marginTop: 'mt-2',
      textAlign: 'text-center',
    },
    field: {
      borderRadius: 'rounded-lg', // ✅ RONDER: Minder hoekig, smoother
      border: 'border border-gray-300', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[300] - Tailwind class
      backgroundColor: 'bg-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.secondary (#ffffff) - Tailwind class
      padding: 'px-4 py-4', // ✅ BREDER: Meer padding links/rechts (was px-3)
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      focus: {
        ring: 'focus:ring-2 focus:ring-black/30', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.primary - Tailwind class
        border: 'focus:border-black', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.primary - Tailwind class
      },
      transition: 'transition-all duration-200', // ✅ DYNAMISCH: DESIGN_SYSTEM layoutUtils + transitions - Tailwind classes
    },
    button: {
      borderRadius: 'rounded-full', // ✅ ROND: Volledig rond zoals gevraagd
      backgroundColor: 'bg-black', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.primary (#000000) - Tailwind class
      textColor: 'text-white', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.text.inverse (#ffffff) - Tailwind class
      hoverBackgroundColor: 'hover:bg-gray-900', // ✅ DYNAMISCH: DESIGN_SYSTEM.colors.gray[900] - Tailwind class
      padding: 'px-4 py-6', // ✅ BREDER: Meer padding links/rechts (was px-3)
      fontSize: DESIGN_SYSTEM.typography.fontSize.base, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold, // ✅ DIKKER: 600 - zoals in banner
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ DYNAMISCH: via DESIGN_SYSTEM
      iconSize: 'w-5 h-5',
      transition: 'transition-all duration-200 ease-in-out', // ✅ DYNAMISCH: DESIGN_SYSTEM layoutUtils + transitions - Tailwind classes
    },
    footer: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.xs, // 12px
      textColor: 'text-gray-500', // ✅ Gray-500 (geen transparantie)
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
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
      fadeIn: 'animate-in fade-in duration-300', // ✅ DYNAMISCH: DESIGN_SYSTEM.transitions.duration.slow (300ms) - Tailwind class
      backgroundColor: 'bg-black/50', // ✅ Consistent met cookie modal
      blur: 'backdrop-blur-sm',
      zIndex: DESIGN_SYSTEM.layoutUtils.zIndex.backdrop,
      mobileTransparent: 'md:bg-transparent',
      mobilePointerEvents: DESIGN_SYSTEM.layoutUtils.pointerEvents.none,
      position: DESIGN_SYSTEM.layoutUtils.position.fixed,
      inset: 'inset-0',
      transition: 'transition-all duration-300', // ✅ Direct Tailwind classes
    },
    modal: {
      slideIn: 'animate-in zoom-in-95 duration-300 ease-out', // ✅ DYNAMISCH: DESIGN_SYSTEM transitions - Tailwind classes
    container: {
      position: DESIGN_SYSTEM.layoutUtils.position.fixed,
      inset: 'inset-0',
      zIndex: 'z-[200]', // ✅ Consistent met cookie modal
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      align: DESIGN_SYSTEM.layoutUtils.flex.align.end, // ✅ POPUP: Boven button (end i.p.v. center)
      justify: DESIGN_SYSTEM.layoutUtils.flex.justify.end, // ✅ POPUP: Rechts (end i.p.v. center)
      padding: 'p-3 sm:p-4 pb-24 sm:pb-24', // ✅ POPUP: Padding onderaan (96px) voor ruimte boven button (64px button + 32px gap)
      pointerEvents: DESIGN_SYSTEM.layoutUtils.pointerEvents.none,
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

  // Empty state styling - Zwart-wit (GEEN transparantie)
  emptyState: {
    iconSize: 'w-12 h-12',
    iconColor: 'text-gray-400', // ✅ Gray-400 (geen transparantie)
    textColor: 'text-gray-600', // ✅ Gray-600 (geen transparantie)
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
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
      backgroundColor: 'bg-white', // ✅ WIT (geen transparantie)
      hoverBackgroundColor: 'hover:bg-gray-100',
      borderRadius: 'rounded-lg', // ✅ RONDER: Minder hoekig, smoother
      padding: 'px-4 py-2', // ✅ Direct Tailwind classes (was: template literal)
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold, // ✅ DIKKER: 600 - zoals in banner
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
      display: DESIGN_SYSTEM.layoutUtils.display.block,
      width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull,
      textAlign: 'text-left',
    },
  },

  // Loading state - Zwart-wit (GEEN transparantie)
  loading: {
    backgroundColor: 'bg-white', // ✅ WIT (geen transparantie)
    border: 'border border-gray-200',
    borderRadius: 'rounded-lg', // ✅ RONDER: Minder hoekig, smoother
    padding: 'p-4', // ✅ Direct Tailwind class (was: template literal)
    iconColor: 'text-black', // ✅ ZWART (geen transparantie)
    iconSize: 'w-5 h-5',
  },

  // Error state - Zwart-wit (GEEN transparantie)
  error: {
    backgroundColor: 'bg-red-50', // ✅ Red-50 (geen transparantie)
    border: 'border border-red-200',
    borderRadius: 'rounded-lg', // ✅ RONDER: Minder hoekig, smoother
    padding: 'p-3', // ✅ Direct Tailwind class (was: DESIGN_SYSTEM.spacing[3] = '0.75rem' string)
    textColor: 'text-red-800', // ✅ Red-800 (geen transparantie)
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
  },

  // Warning banner - Rode achtergrond, zwarte tekst
  warning: {
    container: {
      backgroundColor: 'bg-red-500', // ✅ ROOD: Rode achtergrond
      textColor: 'text-black', // ✅ ZWART: Zwarte tekst
      padding: 'px-4 py-3', // ✅ DYNAMISCH: DESIGN_SYSTEM spacing
      borderRadius: 'rounded-t-2xl sm:rounded-t-3xl', // ✅ RONDER: Consistent met modal
      borderBottom: 'border-b border-red-600', // ✅ DYNAMISCH: Donkerder rood voor border
      marginBottom: 'mb-0', // Geen margin, direct onder header
    },
    text: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold, // ✅ DIKKER: 600 - zoals in banner
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
      lineHeight: 'leading-relaxed', // ✅ DYNAMISCH: Betere leesbaarheid
    },
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
