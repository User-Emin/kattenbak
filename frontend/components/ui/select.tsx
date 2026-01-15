import React from "react";
import { FORM_CONFIG } from "@/lib/form-config";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  name: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, name, required, value, onChange, options, ...props }, ref) => {
    const safeFormConfig = FORM_CONFIG || {
      select: {
        container: { width: 'w-full' },
        label: { display: 'block', fontSize: 'text-sm', fontWeight: 'font-semibold', textColor: 'text-gray-900', marginBottom: 'mb-2' },
        required: { textColor: 'text-accent', marginLeft: 'ml-1' },
        field: {
          width: 'w-full',
          padding: 'px-4 py-3',
          backgroundColor: 'bg-white',
          border: 'border-2',
          borderColor: 'border-gray-300',
          borderRadius: 'rounded',
          textColor: 'text-gray-900',
          focus: { outline: 'focus:outline-none', borderColor: 'focus:border-accent', ring: 'focus:ring-4', ringColor: 'focus:ring-accent/10' },
          hover: { borderColor: 'hover:border-gray-400' },
          error: { borderColor: 'border-red-400', focusBorderColor: 'focus:border-red-500', focusRingColor: 'focus:ring-red-100' },
          transition: 'transition-all duration-200',
        },
        errorMessage: { marginTop: 'mt-2', fontSize: 'text-sm', textColor: 'text-red-600', display: 'flex', align: 'items-center', gap: 'gap-1' },
        errorIcon: { width: 'w-4', height: 'h-4' },
      },
    };

    return (
      <div className={safeFormConfig.select.container.width}>
        {label && (
          <label
            htmlFor={name}
            className={cn(
              safeFormConfig.select.label.display,
              safeFormConfig.select.label.fontSize,
              safeFormConfig.select.label.fontWeight,
              safeFormConfig.select.label.textColor,
              safeFormConfig.select.label.marginBottom
            )}
          >
            {label}
            {required && (
              <span className={cn(
                safeFormConfig.select.required.textColor,
                safeFormConfig.select.required.marginLeft
              )}>*</span>
            )}
          </label>
        )}
        <select
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          ref={ref}
          className={cn(
            safeFormConfig.select.field.width,
            safeFormConfig.select.field.padding,
            safeFormConfig.select.field.backgroundColor,
            safeFormConfig.select.field.border,
            error ? safeFormConfig.select.field.error.borderColor : safeFormConfig.select.field.borderColor,
            safeFormConfig.select.field.borderRadius,
            safeFormConfig.select.field.textColor,
            safeFormConfig.select.field.focus.outline,
            error ? safeFormConfig.select.field.error.focusBorderColor : safeFormConfig.select.field.focus.borderColor,
            safeFormConfig.select.field.focus.ring,
            error ? safeFormConfig.select.field.error.focusRingColor : safeFormConfig.select.field.focus.ringColor,
            safeFormConfig.select.field.hover.borderColor,
            safeFormConfig.select.field.transition,
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className={cn(
            safeFormConfig.select.errorMessage.marginTop,
            safeFormConfig.select.errorMessage.fontSize,
            safeFormConfig.select.errorMessage.textColor,
            safeFormConfig.select.errorMessage.display,
            safeFormConfig.select.errorMessage.align,
            safeFormConfig.select.errorMessage.gap
          )}>
            <svg className={cn(
              safeFormConfig.select.errorIcon.width,
              safeFormConfig.select.errorIcon.height
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

Select.displayName = "Select";



