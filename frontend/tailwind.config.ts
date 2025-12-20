import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
        // Blauw #223ce3 voor navbar en structurele elementen  
        brand: {
          DEFAULT: '#223ce3',      // Nieuwe blauwe kleur
          light: '#3d5ce8',
          dark: '#1a2fb5',
        },
        // Zwart voor action buttons (serieuzere uitstraling)
        accent: {
          DEFAULT: '#000000',      // Zwart als base
          light: '#1a1a1a',        // Donker grijs
          dark: '#0a0a0a',         // Zeer donker zwart voor hover
        },
      },
      borderRadius: {
        'pill': '9999px',          // Volledige pill vorm
        '4xl': '2rem',             // Extra rond voor cards
        '5xl': '2.5rem',           // Zeer rond
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
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
        'brand': '0 8px 32px rgba(34, 60, 227, 0.25)',  // #223ce3
        'brand-lg': '0 12px 48px rgba(34, 60, 227, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
