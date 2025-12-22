import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { COMPONENT_COLORS } from "@/lib/theme-colors";

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand' | 'cta';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// DRY: Gebruik theme-colors.ts (MAXIMAAL DYNAMISCH)
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: `${COMPONENT_COLORS.button.primary} border-2 border-transparent`, // Zwart + invisible border
  secondary: `${COMPONENT_COLORS.button.secondary} border-2 border-transparent`, // Blauw + invisible border
  cta: `${COMPONENT_COLORS.button.cta} border-2 border-transparent`, // Oranje + invisible border voor gelijke dikte
  outline: 'bg-transparent border-2 border-current hover:bg-gray-50',
  ghost: 'bg-transparent hover:bg-gray-50',
  brand: 'bg-brand text-white hover:bg-brand-dark border-2 border-transparent',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'text-sm px-6 py-2',
  md: 'text-base px-8 py-3',
  lg: 'text-lg px-10 py-4',
  xl: 'text-xl px-12 py-5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 hover:scale-105 active:scale-95',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
