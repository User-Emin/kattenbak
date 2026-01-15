import React from "react";
import { FORM_CONFIG } from "@/lib/form-config";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  name: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type = "text", name, required, value, onChange, placeholder, autoComplete, ...props }, ref) => {
    const safeFormConfig = FORM_CONFIG || {
      input: {
        container: { width: 'w-full' },
        label: { display: 'block', fontSize: 'text-sm', fontWeight: 'font-semibold', textColor: 'text-gray-900', marginBottom: 'mb-2' },
        required: { textColor: 'text-accent', marginLeft: 'ml-1' },
        field: {
          width: 'w-full',
          padding: 'px-4 py-2.5',
          backgroundColor: 'bg-white',
          border: 'border',
          borderColor: 'border-gray-200',
          borderRadius: 'rounded',
          textColor: 'text-gray-900',
          placeholderColor: 'placeholder-gray-400',
          focus: { outline: 'focus:outline-none', borderColor: 'focus:border-accent', ring: 'focus:ring-2', ringColor: 'focus:ring-accent/10' },
          hover: { borderColor: 'hover:border-gray-300' },
          error: { borderColor: 'border-red-400', focusBorderColor: 'focus:border-red-500', focusRingColor: 'focus:ring-red-100' },
          transition: 'transition-all duration-200',
        },
        errorMessage: { marginTop: 'mt-2', fontSize: 'text-sm', textColor: 'text-red-600', display: 'flex', align: 'items-center', gap: 'gap-1' },
        errorIcon: { width: 'w-4', height: 'h-4' },
      },
    };

    return (
      <div className={safeFormConfig.input.container.width}>
        {label && (
          <label
            htmlFor={name}
            className={cn(
              safeFormConfig.input.label.display,
              safeFormConfig.input.label.fontSize,
              safeFormConfig.input.label.fontWeight,
              safeFormConfig.input.label.textColor,
              safeFormConfig.input.label.marginBottom
            )}
          >
            {label}
            {required && (
              <span className={cn(
                safeFormConfig.input.required.textColor,
                safeFormConfig.input.required.marginLeft
              )}>*</span>
            )}
          </label>
        )}
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          ref={ref}
          className={cn(
            safeFormConfig.input.field.width,
            safeFormConfig.input.field.padding,
            safeFormConfig.input.field.backgroundColor,
            safeFormConfig.input.field.border,
            error ? safeFormConfig.input.field.error.borderColor : safeFormConfig.input.field.borderColor,
            safeFormConfig.input.field.borderRadius,
            safeFormConfig.input.field.textColor,
            safeFormConfig.input.field.placeholderColor,
            safeFormConfig.input.field.focus.outline,
            error ? safeFormConfig.input.field.error.focusBorderColor : safeFormConfig.input.field.focus.borderColor,
            safeFormConfig.input.field.focus.ring,
            error ? safeFormConfig.input.field.error.focusRingColor : safeFormConfig.input.field.focus.ringColor,
            safeFormConfig.input.field.hover.borderColor,
            safeFormConfig.input.field.transition,
            className
          )}
          {...props}
        />
        {error && (
          <p className={cn(
            safeFormConfig.input.errorMessage.marginTop,
            safeFormConfig.input.errorMessage.fontSize,
            safeFormConfig.input.errorMessage.textColor,
            safeFormConfig.input.errorMessage.display,
            safeFormConfig.input.errorMessage.align,
            safeFormConfig.input.errorMessage.gap
          )}>
            <svg className={cn(
              safeFormConfig.input.errorIcon.width,
              safeFormConfig.input.errorIcon.height
            )} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
