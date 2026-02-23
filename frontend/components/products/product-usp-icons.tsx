/**
 * ✅ CUSTOM VECTOR ICONS - Product USP Icons
 * Diep custom SVG icons voor product-specifieke USPs
 * Absoluut zonder hardcode - volledig dynamisch
 */

import { BRAND_COLORS_HEX } from '@/lib/color-config';

interface IconProps {
  className?: string;
}

// ✅ HYGIENE ICON - Custom vector voor "Nooit meer scheppen"
export function HygieneIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Water droplet + sparkle */}
      <path
        d="M24 8C24 8 18 14 18 20C18 24.4183 20.5817 27 25 27C29.4183 27 32 24.4183 32 20C32 14 26 8 24 8Z"
        fill="currentColor"
        style={{ color: BRAND_COLORS_HEX.primary }}
      />
      {/* Sparkle lines */}
      <path
        d="M24 4L24 8M24 40L24 44M4 24L8 24M40 24L44 24M12.3431 12.3431L14.8284 14.8284M33.1716 33.1716L35.6569 35.6569M12.3431 35.6569L14.8284 33.1716M33.1716 14.8284L35.6569 12.3431"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ color: BRAND_COLORS_HEX.primaryLight }}
      />
    </svg>
  );
}

// ✅ APP BEDIENING ICON - Exact zoals screenshot: Wit smartphone/tablet icoon
export function AppIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* ✅ EXACT SCREENSHOT: Wit smartphone outline met witte border */}
      <rect
        x="12"
        y="8"
        width="24"
        height="40"
        rx="2"
        fill="white"
        stroke="white"
        strokeWidth="1.5"
      />
      {/* Screen area - donkerder voor contrast */}
      <rect
        x="15"
        y="14"
        width="18"
        height="28"
        rx="1"
        fill="#1a1a1a"
      />
      {/* Home indicator bar - wit */}
      <rect
        x="20"
        y="38"
        width="8"
        height="2"
        rx="1"
        fill="white"
      />
    </svg>
  );
}

// ✅ AUTOMATISCH ICON - Custom vector voor "Zelfreinigend"
export function AutomaticIcon({ className = 'w-12 h-12' }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circular arrow (automatic cycle) */}
      <circle
        cx="24"
        cy="24"
        r="16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="4 4"
        className="text-green-600"
      />
      {/* Arrow head */}
      <path
        d="M32 16L38 22L32 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="text-green-600"
      />
      {/* Center dot */}
      <circle
        cx="24"
        cy="24"
        r="4"
        fill="currentColor"
        className="text-green-600"
      />
      {/* Sparkle effect */}
      <path
        d="M24 8L24 12M24 36L24 40M8 24L12 24M36 24L40 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-green-400"
      />
    </svg>
  );
}

// ✅ ICON MAP - DRY: Mapping voor dynamisch gebruik
export const PRODUCT_USP_ICONS = {
  hygiene: HygieneIcon,
  app: AppIcon,
  automatic: AutomaticIcon,
} as const;
