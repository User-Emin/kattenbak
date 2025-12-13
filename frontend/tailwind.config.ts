import type { Config } from "tailwindcss";

export default {
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
    'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800',
    'bg-black', 'bg-white',
    // Text colors
    'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400',
    'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'text-blue-50', 'text-blue-100', 'text-blue-200', 'text-blue-300', 'text-blue-400',
    'text-blue-500', 'text-blue-600', 'text-blue-700', 'text-blue-800', 'text-blue-900',
    'text-orange-500', 'text-orange-600', 'text-orange-700',
    'text-white', 'text-black',
    // Gradients
    'from-gray-50', 'from-gray-900', 'from-gray-800',
    'to-gray-100', 'to-gray-900', 'to-black',
    'from-orange-600', 'from-orange-700', 'to-orange-700', 'to-orange-800',
    'via-white',
    // Border colors
    'border-gray-100', 'border-gray-200', 'border-gray-300', 'border-gray-600', 'border-gray-800',
    'border-blue-100', 'border-blue-600',
    // Hover states
    'hover:bg-orange-700', 'hover:bg-orange-800', 'hover:bg-gray-100', 'hover:bg-gray-200',
    'hover:bg-gray-800', 'hover:bg-gray-900', 'hover:text-gray-900',
    'hover:from-gray-800', 'hover:from-orange-700', 'hover:to-gray-900', 'hover:to-orange-800',
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
        // Donker blauw voor navbar en structurele elementen
        brand: {
          DEFAULT: '#005980',      // Donker blauw voor navbar
          light: '#0077a3',
          dark: '#003d5c',
        },
        // ZWART voor action buttons - MAXIMAAL DYNAMISCH (was cyaan #00fbff)
        accent: {
          DEFAULT: '#000000',      // ZWART als base
          light: '#1a1a1a',        // Lichter zwart
          dark: '#000000',         // Pure zwart
        },
        // Verwijder custom cyan - gebruik default Tailwind
        // cyan removed - primary is now BLACK/GRAY
      },
      borderRadius: {
        'pill': '9999px',          // Volledige pill vorm
        '4xl': '2rem',             // Extra rond voor cards
        '5xl': '2.5rem',           // Zeer rond
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
} satisfies Config;
