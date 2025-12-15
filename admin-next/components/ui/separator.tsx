/**
 * SEPARATOR COMPONENT - DRY UI Element
 * Reusable visual divider voor admin interface
 */

import React from 'react';
import { cn } from '@/lib/utils';

type SeparatorVariant = 'float' | 'solid' | 'gradient';
type SeparatorSpacing = 'sm' | 'md' | 'lg' | 'xl';

interface SeparatorProps {
  variant?: SeparatorVariant;
  spacing?: SeparatorSpacing;
  fade?: boolean;
  shadow?: boolean;
  className?: string;
}

const SPACING_STYLES: Record<SeparatorSpacing, string> = {
  sm: 'my-4',
  md: 'my-8',
  lg: 'my-12',
  xl: 'my-16',
};

const VARIANT_STYLES: Record<SeparatorVariant, string> = {
  float: 'h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent',
  solid: 'h-px bg-gray-400',
  gradient: 'h-px bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300',
};

/**
 * Separator Component - Visual Divider
 * DRY, dynamisch configureerbaar
 * Design: Floating divider met optionele shadow en fade
 */
export const Separator: React.FC<SeparatorProps> = ({
  variant = 'float',
  spacing = 'lg',
  fade = true,
  shadow = true,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full',
        SPACING_STYLES[spacing],
        className
      )}
      role="separator"
      aria-orientation="horizontal"
    >
      <div
        className={cn(
          VARIANT_STYLES[variant],
          shadow && 'shadow-sm',
          fade && variant === 'float' && 'opacity-80',
          'transition-opacity duration-300'
        )}
      />
    </div>
  );
};

export default Separator;



