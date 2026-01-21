import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // DRY: Safelist alle theme-colors.ts classes
    // Primary is now BLACK/GRAY (was cyan)
    'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400',
    'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
    'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400',
    'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900',
    'bg-black', 'bg-white',
    // Text colors
    'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400',
    'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'text-blue-50', 'text-blue-100', 'text-blue-200', 'text-blue-300', 'text-blue-400',
    'text-blue-500', 'text-blue-600', 'text-blue-700', 'text-blue-800', 'text-blue-900',
    'text-white', 'text-black',
    // Gradients
    'from-gray-50', 'from-gray-900', 'from-gray-800',
    'to-gray-100', 'to-gray-900', 'to-black',
    'from-blue-600', 'from-blue-700', 'to-blue-700', 'to-blue-800',
    'via-white',
    // Border colors
    'border-gray-100', 'border-gray-200', 'border-gray-300', 'border-gray-600', 'border-gray-800',
    'border-blue-100', 'border-blue-600',
    // Hover states
    'hover:bg-blue-700', 'hover:bg-blue-800', 'hover:bg-gray-100', 'hover:bg-gray-200',
    'hover:bg-gray-800', 'hover:bg-gray-900', 'hover:text-gray-900',
    'hover:from-gray-800', 'hover:from-blue-700', 'hover:to-gray-900', 'hover:to-blue-800',
    // ✅ CHAT POPUP: Safelist alle dynamische classes
    'w-14', 'h-14', 'w-12', 'h-12', 'w-5', 'h-5', 'w-6', 'h-6',
    'rounded-sm', 'rounded-t-sm', 'rounded-b-sm',
    'shadow-2xl', 'shadow-lg',
    'z-[100]', 'z-[110]', 'z-[120]',
    'right-4', 'bottom-8', 'bottom-32', 'md:bottom-24',
    'max-w-md', 'max-h-[90vh]', 'md:max-h-[600px]',
    'p-4', 'p-6', 'px-4', 'py-2', 'py-3', 'px-6',
    'text-xs', 'text-sm', 'text-base', 'text-xl',
    'font-normal', 'font-medium', 'font-semibold',
    'tracking-tight',
    'space-y-4', 'space-y-2',
    'flex', 'flex-col', 'items-center', 'justify-center', 'justify-end', 'justify-start',
    'overflow-y-auto',
    'transition-all', 'transition-colors',
    'duration-200', 'duration-300',
    'ease-out',
    'animate-in', 'fade-in', 'slide-in-from-bottom-4', 'md:slide-in-from-right-4',
    'pointer-events-none', 'pointer-events-auto',
    'fixed', 'inset-0',
    'bg-black/20', 'backdrop-blur-sm', 'md:bg-transparent',
    'opacity-1', 'opacity-50', 'opacity-60',
    // ✅ FORM CONFIG: Safelist alle form-gerelateerde classes
    'w-full', 'h-full',
    'rounded', 'rounded-xl', 'rounded-full', 'rounded-2xl',
    'border', 'border-2',
    'px-4', 'px-8', 'py-2', 'py-2.5', 'py-3', 'py-4',
    'mb-2', 'mt-2', 'ml-1',
    'gap-1', 'gap-2',
    'block',
    'resize-none',
    'focus:outline-none', 'focus:border-accent', 'focus:border-brand', 'focus:border-red-500',
    'focus:ring-2', 'focus:ring-4', 'focus:ring-accent/10', 'focus:ring-brand/10', 'focus:ring-red-100',
    'hover:border-gray-300', 'hover:border-gray-400', 'hover:bg-accent-dark', 'hover:scale-105',
    'active:scale-95',
    'bg-accent', 'bg-white',
    'text-accent', 'text-gray-900', 'text-red-600',
    'placeholder-gray-400',
    'border-gray-200', 'border-gray-300', 'border-red-400',
    'transition-all', 'duration-300',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a1a1a',
          light: '#2a2a2a',
          dark: '#0a0a0a',
        },
        secondary: {
          DEFAULT: '#fafafa',
          light: '#ffffff',
          dark: '#f5f5f5',
        },
        // BRAND - BLAUW #3071aa voor navbar en structurele elementen
        brand: {
          DEFAULT: '#3071aa',      // Main brand color #3071aa
          light: '#3d82c0',
          dark: '#256394',
        },
        // ACCENT - BLAUW #3071aa voor buttons, ZWART voor rest
        accent: {
          DEFAULT: '#3071aa',      // BLAUW #3071aa voor buttons
          light: '#3d82c0',        // BLAUW LIGHT
          dark: '#256394',         // BLAUW DARK
        },
        // Verwijder custom cyan - gebruik default Tailwind
        // cyan removed - primary is now BLACK/GRAY
      },
      // ✅ SUBTIELE RONDE HOEKEN (Coolblue style - niet stug!)
      borderRadius: {
        'none': '0',          // Voor specifieke vierkante elementen
        'sm': '0.25rem',      // 4px - Subtiele ronde hoek (buttons, inputs)
        'DEFAULT': '0.5rem',  // 8px - Default ronde hoek (cards, containers)
        'md': '0.5rem',       // 8px - Cards
        'lg': '0.75rem',      // 12px - Grote cards
        'xl': '1rem',         // 16px - Hero sections
        '2xl': '0',           // Disabled
        '3xl': '0',           // Disabled
        '4xl': '0',           // Disabled
        '5xl': '0',           // Disabled
        'pill': '0',          // Disabled
        'full': '9999px',     // ✅ ROND voor chat button!
      },
      fontFamily: {
        sans: ['var(--font-roboto-flex)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'float': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'float-hover': '0 12px 40px rgba(0, 0, 0, 0.06)',
        'cta': '0 4px 14px rgba(255, 170, 33, 0.25)',
        'cta-hover': '0 6px 20px rgba(255, 170, 33, 0.35)',
        'brand': '0 8px 32px rgba(0, 89, 128, 0.25)',
        'brand-lg': '0 12px 48px rgba(0, 89, 128, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
