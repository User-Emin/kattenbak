/**
 * CHAT POPUP CONFIGURATION - DRY & SECURE
 * ✅ Single source of truth voor chat styling
 * ✅ Geen hardcoding - alle values via DESIGN_SYSTEM
 * ✅ Type-safe configuratie
 */

import { DESIGN_SYSTEM } from './design-system';

export const CHAT_CONFIG = {
  // Button styling - Hoekiger, zwart-wit
  button: {
    size: 'w-14 h-14', // 56px - moderner dan 64px
    borderRadius: 'rounded-sm', // ✅ HOEKIGER (was rounded-full)
    backgroundColor: DESIGN_SYSTEM.colors.primary, // Zwart
    textColor: DESIGN_SYSTEM.colors.secondary, // Wit
    hoverBackgroundColor: DESIGN_SYSTEM.colors.gray[900], // Donkerder zwart
    border: `border border-${DESIGN_SYSTEM.colors.gray[800]}`, // Subtiele border
    shadow: DESIGN_SYSTEM.effects.shadow.lg,
    zIndex: 100,
    position: {
      right: 'right-4',
      bottom: 'bottom-8',
      bottomWithCart: 'bottom-32 md:bottom-24',
    },
    transition: DESIGN_SYSTEM.transitions.duration.base,
    iconSize: 'w-6 h-6',
  },

  // Modal styling - Hoekiger, zwart-wit
  modal: {
    maxWidth: 'max-w-md',
    maxHeight: 'max-h-[90vh] md:max-h-[600px]',
    backgroundColor: DESIGN_SYSTEM.colors.secondary, // Wit
    borderRadius: 'rounded-sm', // ✅ HOEKIGER (was rounded-md)
    border: `border border-${DESIGN_SYSTEM.colors.border.default}`,
    shadow: DESIGN_SYSTEM.effects.shadow.lg,
    zIndex: 120,
  },

  // Header styling - Zwart-wit
  header: {
    backgroundColor: DESIGN_SYSTEM.colors.primary, // Zwart
    textColor: DESIGN_SYSTEM.colors.secondary, // Wit
    padding: DESIGN_SYSTEM.spacing[6], // 24px
    borderRadius: 'rounded-t-sm', // ✅ HOEKIGER
    borderBottom: 'border-b border-gray-800',
    title: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.xl, // 20px
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium, // 500 - Noto Sans
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings, // Noto Sans
      letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight, // Logo style
    },
    subtitle: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
      textColor: DESIGN_SYSTEM.colors.text.muted, // Gray-300
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
    },
  },

  // Messages styling
  messages: {
    container: {
      padding: DESIGN_SYSTEM.spacing[6], // 24px
      backgroundColor: DESIGN_SYSTEM.colors.gray[50], // Light gray background
      spacing: 'space-y-4',
    },
    user: {
      backgroundColor: DESIGN_SYSTEM.colors.primary, // Zwart
      textColor: DESIGN_SYSTEM.colors.secondary, // Wit
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      padding: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[4]}`, // 16px
      maxWidth: 'max-w-[85%]',
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
    },
    assistant: {
      backgroundColor: DESIGN_SYSTEM.colors.secondary, // Wit
      textColor: DESIGN_SYSTEM.colors.text.primary, // Zwart
      border: 'border border-gray-200',
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      padding: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[4]}`, // 16px
      maxWidth: 'max-w-[85%]',
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
    },
    timestamp: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.xs, // 12px
      opacity: 0.6,
    },
  },

  // Input styling - Hoekiger, Noto Sans
  input: {
    container: {
      padding: DESIGN_SYSTEM.spacing[4], // 16px
      backgroundColor: DESIGN_SYSTEM.colors.secondary, // Wit
      borderTop: 'border-t border-gray-200',
      borderRadius: 'rounded-b-sm', // ✅ HOEKIGER
    },
    field: {
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      border: 'border border-gray-300',
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
      backgroundColor: DESIGN_SYSTEM.colors.primary, // Zwart
      textColor: DESIGN_SYSTEM.colors.secondary, // Wit
      hoverBackgroundColor: DESIGN_SYSTEM.colors.gray[900], // Donkerder zwart
      padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[6]}`, // 12px 24px
      fontSize: DESIGN_SYSTEM.typography.fontSize.base, // 16px
      fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal, // 400 - Noto Sans
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
      iconSize: 'w-5 h-5',
      transition: DESIGN_SYSTEM.transitions.duration.base,
    },
    footer: {
      fontSize: DESIGN_SYSTEM.typography.fontSize.xs, // 12px
      textColor: DESIGN_SYSTEM.colors.text.muted, // Gray-500
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
    },
    modal: {
      slideIn: 'animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 fade-in duration-300 ease-out',
    },
  },

  // Empty state styling
  emptyState: {
    iconSize: 'w-12 h-12',
    iconColor: DESIGN_SYSTEM.colors.gray[400],
    textColor: DESIGN_SYSTEM.colors.text.secondary, // Gray-600
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
    suggestionButton: {
      backgroundColor: DESIGN_SYSTEM.colors.secondary, // Wit
      hoverBackgroundColor: DESIGN_SYSTEM.colors.gray[100],
      borderRadius: 'rounded-sm', // ✅ HOEKIGER
      padding: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[4]}`, // 8px 16px
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
      fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
    },
  },

  // Loading state
  loading: {
    backgroundColor: DESIGN_SYSTEM.colors.secondary, // Wit
    border: `border border-${DESIGN_SYSTEM.colors.border.default}`,
    borderRadius: 'rounded-sm', // ✅ HOEKIGER
    padding: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[4]}`, // 16px
    iconColor: DESIGN_SYSTEM.colors.primary, // Zwart
    iconSize: 'w-5 h-5',
  },

  // Error state
  error: {
    backgroundColor: '#fef2f2', // Red-50
    border: 'border border-red-200',
    borderRadius: 'rounded-sm', // ✅ HOEKIGER
    padding: DESIGN_SYSTEM.spacing[3], // 12px
    textColor: '#991b1b', // Red-800
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm, // 14px
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // Noto Sans
  },
} as const;
