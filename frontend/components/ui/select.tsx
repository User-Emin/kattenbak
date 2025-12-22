import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  name: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, name, required, value, onChange, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            {label}
            {required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <select
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          ref={ref}
          className={`w-full px-4 py-3 bg-white border-2 border-gray-300 rounded text-gray-900 
            focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 
            hover:border-gray-400 transition-all duration-200
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}
            ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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



