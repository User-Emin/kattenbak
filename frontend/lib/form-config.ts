/**
 * FORM CONFIGURATION - DRY & SECURE
 * ✅ Single source of truth voor form styling
 * ✅ Geen hardcoding - alle values via DESIGN_SYSTEM
 * ✅ Type-safe configuratie
 * ✅ Consistent met CHAT_CONFIG architectuur
 */

import { DESIGN_SYSTEM } from './design-system';

export const FORM_CONFIG = {
  // Input field styling - 100% dynamisch via DESIGN_SYSTEM
  input: {
    // Container
    container: {
      width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull, // 'w-full'
    },
    
    // Label styling
    label: {
      display: 'block', // Tailwind class
      fontSize: 'text-sm', // DESIGN_SYSTEM.typography.fontSize.sm - Tailwind class
      fontWeight: 'font-semibold', // DESIGN_SYSTEM.typography.fontWeight.semibold - Tailwind class
      textColor: 'text-gray-900', // DESIGN_SYSTEM.colors.text.primary - Tailwind class
      marginBottom: 'mb-2', // DESIGN_SYSTEM.spacing[2] - Tailwind class
    },
    
    // Required indicator
    required: {
      textColor: 'text-accent', // Tailwind class (accent color)
      marginLeft: 'ml-1', // DESIGN_SYSTEM.spacing[1] - Tailwind class
    },
    
    // Input field
    field: {
      width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull, // 'w-full'
      padding: 'px-4 py-2.5', // DESIGN_SYSTEM.spacing[4] + custom - Tailwind classes
      backgroundColor: 'bg-white', // DESIGN_SYSTEM.colors.secondary - Tailwind class
      border: 'border', // Tailwind class
      borderColor: 'border-gray-200', // DESIGN_SYSTEM.colors.border.default - Tailwind class
      borderRadius: 'rounded', // DESIGN_SYSTEM.effects.borderRadius.base - Tailwind class
      textColor: 'text-gray-900', // DESIGN_SYSTEM.colors.text.primary - Tailwind class
      placeholderColor: 'placeholder-gray-400', // DESIGN_SYSTEM.colors.gray[400] - Tailwind class
      
      // Focus states
      focus: {
        outline: 'focus:outline-none',
        borderColor: 'focus:border-accent', // Tailwind class (accent color)
        ring: 'focus:ring-2', // Tailwind class
        ringColor: 'focus:ring-accent/10', // Tailwind class (accent color with opacity)
      },
      
      // Hover states
      hover: {
        borderColor: 'hover:border-gray-300', // DESIGN_SYSTEM.colors.gray[300] - Tailwind class
      },
      
      // Error states
      error: {
        borderColor: 'border-red-400', // DESIGN_SYSTEM.colors.state.error - Tailwind class
        focusBorderColor: 'focus:border-red-500', // DESIGN_SYSTEM.colors.state.error - Tailwind class
        focusRingColor: 'focus:ring-red-100', // Tailwind class
      },
      
      // Transitions
      transition: 'transition-all duration-200', // ✅ Direct Tailwind classes (was: DESIGN_SYSTEM layoutUtils + transitions)
    },
    
    // Error message
    errorMessage: {
      marginTop: 'mt-2', // DESIGN_SYSTEM.spacing[2] - Tailwind class
      fontSize: 'text-sm', // DESIGN_SYSTEM.typography.fontSize.sm - Tailwind class
      textColor: 'text-red-600', // DESIGN_SYSTEM.colors.state.error - Tailwind class
      display: DESIGN_SYSTEM.layoutUtils.display.flex, // 'flex'
      align: DESIGN_SYSTEM.layoutUtils.flex.align.center, // 'items-center'
      gap: 'gap-1', // DESIGN_SYSTEM.spacing[1] - Tailwind class
    },
    
    // Error icon
    errorIcon: {
      width: 'w-4', // Tailwind class
      height: 'h-4', // Tailwind class
    },
  },
  
  // Select field styling - 100% dynamisch via DESIGN_SYSTEM
  select: {
    // Container (same as input)
    container: {
      width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull, // 'w-full'
    },
    
    // Label (same as input)
    label: {
      display: 'block',
      fontSize: 'text-sm',
      fontWeight: 'font-semibold',
      textColor: 'text-gray-900',
      marginBottom: 'mb-2',
    },
    
    // Required indicator (same as input)
    required: {
      textColor: 'text-accent',
      marginLeft: 'ml-1',
    },
    
    // Select field
    field: {
      width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull, // 'w-full'
      padding: 'px-4 py-3', // DESIGN_SYSTEM.spacing[4] + custom - Tailwind classes
      backgroundColor: 'bg-white', // DESIGN_SYSTEM.colors.secondary - Tailwind class
      border: 'border-2', // Tailwind class (thicker border for select)
      borderColor: 'border-gray-300', // DESIGN_SYSTEM.colors.gray[300] - Tailwind class
      borderRadius: 'rounded', // DESIGN_SYSTEM.effects.borderRadius.base - Tailwind class
      textColor: 'text-gray-900', // DESIGN_SYSTEM.colors.text.primary - Tailwind class
      
      // Focus states
      focus: {
        outline: 'focus:outline-none',
        borderColor: 'focus:border-accent', // Tailwind class (accent color)
        ring: 'focus:ring-4', // Tailwind class (thicker ring for select)
        ringColor: 'focus:ring-accent/10', // Tailwind class (accent color with opacity)
      },
      
      // Hover states
      hover: {
        borderColor: 'hover:border-gray-400', // DESIGN_SYSTEM.colors.gray[400] - Tailwind class
      },
      
      // Error states
      error: {
        borderColor: 'border-red-400', // DESIGN_SYSTEM.colors.state.error - Tailwind class
        focusBorderColor: 'focus:border-red-500', // DESIGN_SYSTEM.colors.state.error - Tailwind class
        focusRingColor: 'focus:ring-red-100', // Tailwind class
      },
      
      // Transitions
      transition: 'transition-all duration-200', // ✅ Direct Tailwind classes (was: DESIGN_SYSTEM layoutUtils + transitions)
    },
    
    // Error message (same as input)
    errorMessage: {
      marginTop: 'mt-2',
      fontSize: 'text-sm',
      textColor: 'text-red-600',
      display: DESIGN_SYSTEM.layoutUtils.display.flex,
      align: DESIGN_SYSTEM.layoutUtils.flex.align.center,
      gap: 'gap-1',
    },
    
    // Error icon (same as input)
    errorIcon: {
      width: 'w-4',
      height: 'h-4',
    },
  },
  
  // Textarea styling - 100% dynamisch via DESIGN_SYSTEM
  textarea: {
    // Same structure as input, but with resize-none
    field: {
      width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull, // 'w-full'
      padding: 'px-4 py-3', // DESIGN_SYSTEM.spacing[4] - Tailwind classes
      backgroundColor: 'bg-white', // DESIGN_SYSTEM.colors.secondary - Tailwind class
      border: 'border-2', // Tailwind class
      borderColor: 'border-gray-300', // DESIGN_SYSTEM.colors.gray[300] - Tailwind class
      borderRadius: 'rounded-xl', // Tailwind class (slightly more rounded)
      textColor: 'text-gray-900', // DESIGN_SYSTEM.colors.text.primary - Tailwind class
      resize: 'resize-none', // Tailwind class
      
      // Focus states
      focus: {
        outline: 'focus:outline-none',
        borderColor: 'focus:border-brand', // Tailwind class (brand color)
        ring: 'focus:ring-4', // Tailwind class
        ringColor: 'focus:ring-brand/10', // Tailwind class (brand color with opacity)
      },
      
      // Transitions
      transition: 'transition-all', // ✅ Direct Tailwind class
    },
  },
  
  // Form button styling - 100% dynamisch via DESIGN_SYSTEM
  button: {
    submit: {
      width: DESIGN_SYSTEM.layoutUtils.sizing.widthFull, // 'w-full'
      backgroundColor: 'bg-accent', // Tailwind class (accent color)
      hoverBackgroundColor: 'hover:bg-accent-dark', // Tailwind class
      textColor: 'text-gray-900', // DESIGN_SYSTEM.colors.text.primary - Tailwind class
      fontWeight: 'font-semibold', // DESIGN_SYSTEM.typography.fontWeight.semibold - Tailwind class
      padding: 'py-4 px-8', // DESIGN_SYSTEM.spacing[4] + custom - Tailwind classes
      borderRadius: DESIGN_SYSTEM.button.borderRadius, // ✅ DRY: Via DESIGN_SYSTEM (exact zoals Let op kaart)
      transition: 'transition-all duration-300', // ✅ Direct Tailwind classes
      hoverScale: 'hover:scale-105', // Tailwind class
      activeScale: 'active:scale-95', // Tailwind class
    },
  },
} as const;

/**
 * TYPE EXPORTS - Voor TypeScript type-safety
 */
export type FormConfig = typeof FORM_CONFIG;
