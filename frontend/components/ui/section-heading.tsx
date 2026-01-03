import React from 'react';

/**
 * DRY SECTION HEADING COMPONENT
 * Consistent styling across all sections
 * Used for: USP titles, "Over dit product", "Hoe werkt het", etc.
 */

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  children,
  className = '',
  centered = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xl md:text-2xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
  };

  return (
    <h2 
      className={`
        ${sizeClasses[size]}
        font-light
        text-gray-900
        ${centered ? 'text-center' : ''}
        ${className}
      `.trim()}
    >
      {children}
    </h2>
  );
};


