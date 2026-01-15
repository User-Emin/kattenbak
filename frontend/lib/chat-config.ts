/**
 * CHAT POPUP CONFIGURATION - DRY & SECURE
 * ✅ Single source of truth voor chat styling
 * ✅ Geen hardcoding - alle values via DESIGN_SYSTEM
 * ✅ Type-safe configuratie
 */

import { DESIGN_SYSTEM } from './design-system';

export const CHAT_CONFIG = {
  // Button styling - Hoekiger, zwart-wit (GEEN transparantie)
  button: {
    size: 'w-14 h-14', // 56px - moderner dan 64px
    borderRadius: 'rounded-sm', // ✅ HOEKIGER (was rounded-full)
    backgroundColor: 'bg-black', // ✅ ZWART (geen transparantie)
    textColor: 'text-white', // ✅ WIT
    hoverBackgroundColor: 'hover:bg-gray-900', // Donkerder zwart
    border: 'border border-gray-800', // Subtiele border
    shadow: 'shadow-2xl', // ✅ SOLIDE shadow
    zIndex: 100,
    position: {
      type: DESIGN_SYSTEM.layoutUtils.position.fixed,
      right: 'right-4',
      bottom: 'bottom-8',
      bottomWithCart: 'bottom-32 md:bottom-24',
    },
    display: DESIGN_SYSTEM.layoutUtils.display.flex,
    align: DESIGN_SYSTEM.layoutUtils.flex.align.center,
    justify: DESIGN_SYSTEM.layoutUtils.flex.justify.center,
    transition: DESIGN_SYSTEM.transitions.duration.base,
    hoverScale: 'hover:scale-110',
    activeScale: 'active:scale-95',
    focus: {
      outline: 'focus:outline-none',
      ring: 'focus:ring-4',
      ringColor: 'focus:ring-gray-400/30',
    },
    iconSize: 'w-6 h-6',
  },

  // Modal styling - Consistent met andere modals (cookie-settings-modal pattern)
  modal: {
    maxWidth: 'max-w-md', // Consistent met cookie modal max-w-xl pattern
    maxHeight: 'max-h-[85vh] sm:max-h-[80vh]', // Consistent met cookie modal
    backgroundColor: 'bg-white', // ✅ WIT (geen transparantie)
    borderRadius: 'rounded-xl sm:rounded-2xl', // ✅ Consistent met cookie modal (was rounded-sm)
    border: 'border border-gray-200',
    shadow: 'shadow-2xl', // ✅ SOLIDE shadow
    zIndex: 200, // ✅ Consistent met cookie modal z-[200] (was 120)
    overflow: 'overflow-hidden', // ✅ Consistent met cookie modal
    // Note: Container and content layout utilities are in animations.modal
  },

  // Header styling - Zwart-wit (GEEN transparantie) - Consistent met cookie modal
  header: {
    backgroundColor: 'bg-black', // ✅ ZWART (geen transparantie)
    textColor: 'text-white', // ✅ WIT
    padding: 'px-4 py-3', // ✅ Consistent met cookie modal (was spacing[6])
    borderRadius: 'rounded-t-xl sm:rounded-t-2xl', // ✅ Consistent met modal borderRadius (was rounded-t-sm)
    borderBottom: 'border-b border-gray-700/20', // ✅ Consistent met cookie modal (was border-gray-800)
    sticky: 'sticky top-0', // ✅ Consistent met cookie modal
    container: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      justify: DESIGN_SYSTEM.layoutUtils.flex.justify.between,
      align: DESIGN_SYSTEM.layoutUtils.flex.align.start,
      marginBottom: 'mb-2',
    },
    title: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.xl, // 20px
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium, // 500 - Noto Sans
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings, // Noto Sans
      letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight, // Logo style
      textColor: 'text-white', // ✅ WIT (geen transparantie)
    },
    subtitle: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
      textColor: 'text-gray-300', // ✅ Gray-300 (geen transparantie)
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
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

  // Messages styling - Zwart-wit (GEEN transparantie)
  messages: {
    container: {
      padding: DESIGN_SYSTEM.spacing[6], // 24px
      backgroundColor: 'bg-gray-50', // ✅ Light gray background (geen transparantie)
      spacing: 'space-y-4',
      flex: DESIGN_SYSTEM.layoutUtils.flex.grow.grow,
      overflow: DESIGN_SYSTEM.layoutUtils.overflow.yAuto,
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      direction: DESIGN_SYSTEM.layoutUtils.flex.direction.col,
    },
    messageWrapper: {
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      userJustify: DESIGN_SYSTEM.layoutUtils.flex.justify.end,
      assistantJustify: DESIGN_SYSTEM.layoutUtils.flex.justify.start,
    },
    user: {
      backgroundColor: 'bg-black', // ✅ ZWART (geen transparantie)
      textColor: 'text-white', // ✅ WIT
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      padding: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[4]}`, // 16px
      maxWidth: 'max-w-[85%]',
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
    },
    assistant: {
      backgroundColor: 'bg-white', // ✅ WIT (geen transparantie)
      textColor: 'text-black', // ✅ ZWART
      border: 'border border-gray-200',
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      padding: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[4]}`, // 16px
      maxWidth: 'max-w-[85%]',
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
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

  // Input styling - Hoekiger, Noto Sans, Zwart-wit (GEEN transparantie)
  input: {
    container: {
      padding: DESIGN_SYSTEM.spacing[4], // 16px
      backgroundColor: 'bg-white', // ✅ WIT (geen transparantie)
      borderTop: 'border-t border-gray-200',
      borderRadius: 'rounded-b-sm', // ✅ HOEKIGER
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
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      border: 'border border-gray-300',
      backgroundColor: 'bg-white', // ✅ WIT (geen transparantie)
      padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[4]}`, // 12px 16px
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
      focus: {
        ring: 'focus:ring-2 focus:ring-black/30',
        border: 'focus:border-black',
      },
    },
    button: {
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      backgroundColor: 'bg-black', // ✅ ZWART (geen transparantie)
      textColor: 'text-white', // ✅ WIT
      hoverBackgroundColor: 'hover:bg-gray-900', // Donkerder zwart
      padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[6]}`, // 12px 24px
      fontSize: DESIGN_SYSTEM.typography.fontSize.base, // 16px
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal, // 400 - Noto Sans
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
      iconSize: 'w-5 h-5',
      transition: DESIGN_SYSTEM.transitions.duration.base,
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
      fadeIn: 'animate-in fade-in duration-300', // ✅ Consistent met cookie modal (was duration-200)
      backgroundColor: 'bg-black/50', // ✅ Consistent met cookie modal (was bg-black/20)
      blur: 'backdrop-blur-sm',
      zIndex: DESIGN_SYSTEM.layoutUtils.zIndex.backdrop,
      mobileTransparent: 'md:bg-transparent',
      mobilePointerEvents: DESIGN_SYSTEM.layoutUtils.pointerEvents.none,
      position: DESIGN_SYSTEM.layoutUtils.position.fixed,
      inset: 'inset-0',
    },
    modal: {
      slideIn: 'animate-in zoom-in-95 duration-300', // ✅ Consistent met cookie modal (was slide-in-from-bottom-4)
      container: {
        position: DESIGN_SYSTEM.layoutUtils.position.fixed,
        inset: 'inset-0',
        zIndex: 'z-[200]', // ✅ Consistent met cookie modal (was layoutUtils.zIndex.modal)
        display: DESIGN_SYSTEM.layoutUtils.display.flex,
        align: DESIGN_SYSTEM.layoutUtils.flex.align.center,
        justify: DESIGN_SYSTEM.layoutUtils.flex.justify.center,
        padding: 'p-3 sm:p-4', // ✅ Consistent met cookie modal (was p-4)
        pointerEvents: DESIGN_SYSTEM.layoutUtils.pointerEvents.none,
      },
      content: {
        pointerEvents: DESIGN_SYSTEM.layoutUtils.pointerEvents.auto,
        width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull,
        display: DESIGN_SYSTEM.layoutUtils.display.flex,
        direction: DESIGN_SYSTEM.layoutUtils.flex.direction.col,
        position: 'relative', // ✅ Consistent met cookie modal
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
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      padding: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[4]}`, // 8px 16px
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
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
    borderRadius: 'rounded-sm', // ✅ HOEKIGER
    padding: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[4]}`, // 16px
    iconColor: 'text-black', // ✅ ZWART (geen transparantie)
    iconSize: 'w-5 h-5',
  },

  // Error state - Zwart-wit (GEEN transparantie)
  error: {
    backgroundColor: 'bg-red-50', // ✅ Red-50 (geen transparantie)
    border: 'border border-red-200',
    borderRadius: 'rounded-sm', // ✅ HOEKIGER
    padding: DESIGN_SYSTEM.spacing[3], // 12px
    textColor: 'text-red-800', // ✅ Red-800 (geen transparantie)
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
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
