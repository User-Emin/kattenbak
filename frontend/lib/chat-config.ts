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
      right: 'right-4',
      bottom: 'bottom-8',
      bottomWithCart: 'bottom-32 md:bottom-24',
    },
    transition: DESIGN_SYSTEM.transitions.duration.base,
    iconSize: 'w-6 h-6',
  },

  // Modal styling - Hoekiger, zwart-wit (GEEN transparantie)
  modal: {
    maxWidth: 'max-w-md',
    maxHeight: 'max-h-[90vh] md:max-h-[600px]',
    backgroundColor: 'bg-white', // ✅ WIT (geen transparantie)
    borderRadius: 'rounded-sm', // ✅ HOEKIGER (was rounded-md)
    border: 'border border-gray-200',
    shadow: 'shadow-2xl', // ✅ SOLIDE shadow
    zIndex: 120,
  },

  // Header styling - Zwart-wit (GEEN transparantie)
  header: {
    backgroundColor: 'bg-black', // ✅ ZWART (geen transparantie)
    textColor: 'text-white', // ✅ WIT
    padding: DESIGN_SYSTEM.spacing[6], // 24px
    borderRadius: 'rounded-t-sm', // ✅ HOEKIGER
    borderBottom: 'border-b border-gray-800',
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
    },
  },

  // Messages styling - Zwart-wit (GEEN transparantie)
  messages: {
    container: {
      padding: DESIGN_SYSTEM.spacing[6], // 24px
      backgroundColor: 'bg-gray-50', // ✅ Light gray background (geen transparantie)
      spacing: 'space-y-4',
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
      fadeIn: 'animate-in fade-in duration-200',
      backgroundColor: 'bg-black/20',
      blur: 'backdrop-blur-sm',
      zIndex: 'z-[110]',
      mobileTransparent: 'md:bg-transparent',
      mobilePointerEvents: 'md:pointer-events-none',
    },
    modal: {
      slideIn: 'animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 fade-in duration-300 ease-out',
    },
  },

  // Empty state styling - Zwart-wit (GEEN transparantie)
  emptyState: {
    iconSize: 'w-12 h-12',
    iconColor: 'text-gray-400', // ✅ Gray-400 (geen transparantie)
    textColor: 'text-gray-600', // ✅ Gray-600 (geen transparantie)
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
    suggestionButton: {
      backgroundColor: 'bg-white', // ✅ WIT (geen transparantie)
      hoverBackgroundColor: 'hover:bg-gray-100',
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      padding: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[4]}`, // 8px 16px
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
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
} as const;
