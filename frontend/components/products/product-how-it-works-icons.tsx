/**
 * PRODUCT HOW IT WORKS ICONS
 * ✅ DRY: Gedeelde icons voor "Hoe werkt het?" sectie
 * ✅ Exported voor gebruik in accordion en andere componenten
 */

// ✅ OPTIMALE SYMBOLEN: Professionele en duidelijke SVG icons voor stekker en grit
export const PlugIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    {/* ✅ STEEKER: Professionele Europese stekker met 2 pinnen */}
    {/* Body */}
    <rect x="7" y="11" width="10" height="8" rx="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity={0.1} />
    {/* Linker pin */}
    <rect x="8.5" y="13" width="2.5" height="6" rx="0.5" fill="currentColor" />
    {/* Rechter pin */}
    <rect x="13" y="13" width="2.5" height="6" rx="0.5" fill="currentColor" />
    {/* Kabel */}
    <path d="M11.5 11V7a1.5 1.5 0 0 1 1.5-1.5h0a1.5 1.5 0 0 1 1.5 1.5v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M12 5.5V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
    <circle cx="12" cy="1.5" r="1" fill="currentColor" />
  </svg>
);

export const GritIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* ✅ GRIT: Professionele kattenbak met grit korrels en MAX lijn */}
    {/* Bak */}
    <rect x="3" y="7" width="18" height="13" rx="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity={0.05} />
    {/* MAX lijn (duidelijk zichtbaar) */}
    <path d="M4 11.5h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} strokeDasharray="3 2" opacity={0.8} />
    <text x="20" y="12" fontSize="8" fill="currentColor" opacity={0.6} fontWeight="bold">MAX</text>
    {/* Grit korrels (realistisch patroon) */}
    <circle cx="6" cy="9.5" r="1.8" fill="currentColor" opacity={0.7} />
    <circle cx="11" cy="9.5" r="1.6" fill="currentColor" opacity={0.75} />
    <circle cx="16" cy="9.5" r="1.7" fill="currentColor" opacity={0.7} />
    <circle cx="18" cy="9.5" r="1.3" fill="currentColor" opacity={0.65} />
    <circle cx="8" cy="13" r="1.4" fill="currentColor" opacity={0.6} />
    <circle cx="13" cy="13" r="1.5" fill="currentColor" opacity={0.65} />
    <circle cx="15" cy="13" r="1.2" fill="currentColor" opacity={0.6} />
    <circle cx="6" cy="15.5" r="1.1" fill="currentColor" opacity={0.55} />
    <circle cx="11" cy="15.5" r="1.3" fill="currentColor" opacity={0.6} />
    <circle cx="17" cy="15.5" r="1.2" fill="currentColor" opacity={0.55} />
  </svg>
);

export const TrashBagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11h8" />
  </svg>
);

export const PowerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    <circle cx="12" cy="12" r="3" strokeWidth={2} />
  </svg>
);

export const TimerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
