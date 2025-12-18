import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accentDark font-semibold',
  secondary: 'bg-white text-accent border border-accent hover:bg-accent hover:text-white font-semibold',
  outline: 'bg-transparent border border-current hover:bg-gray-50',
  ghost: 'bg-transparent hover:bg-gray-50',
  brand: 'bg-accent text-white hover:bg-accentDark font-semibold',
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
          'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 hover:scale-105 active:scale-95',
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
