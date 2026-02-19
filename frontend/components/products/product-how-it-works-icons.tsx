/**
 * PRODUCT HOW IT WORKS ICONS
 * ✅ DRY: Gedeelde icons voor "Hoe werkt het?" sectie
 * ✅ Exported voor gebruik in accordion en andere componenten
 */

// ✅ OPTIMALE SYMBOLEN: Herkenbaar en passend bij "Stekker erin" en "Grit tot MAX"
/** Stekker erin: Stroomstekker – pinnen in stopcontact, kabel omhoog */
export const PlugIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {/* Body */}
    <rect x="8" y="10" width="8" height="10" rx="1.5" fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={2} />
    {/* Pinnen (in stopcontact) */}
    <line x1="10.5" y1="20" x2="10.5" y2="23" strokeWidth={2.5} />
    <line x1="13.5" y1="20" x2="13.5" y2="23" strokeWidth={2.5} />
    {/* Kabel */}
    <path d="M12 10V5a1.5 1.5 0 013 0v3" />
    <path d="M12 3.5V1.5" strokeWidth={2} />
  </svg>
);

/** Grit tot MAX: Kattenbak met vulniveau – duidelijke MAX-lijn zonder tekst */
export const GritIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {/* Bak (kattenbak omtrek) */}
    <rect x="3" y="8" width="18" height="12" rx="2" fill="currentColor" opacity={0.08} stroke="currentColor" strokeWidth={2} />
    {/* MAX vulniveau – duidelijke horizontale lijn */}
    <line x1="4" y1="12" x2="20" y2="12" strokeWidth={2.5} strokeDasharray="4 3" opacity={0.9} />
    {/* Grit korrels (boven MAX = vol) */}
    <circle cx="6" cy="10" r="1.5" fill="currentColor" opacity={0.6} />
    <circle cx="11" cy="10.5" r="1.4" fill="currentColor" opacity={0.65} />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" opacity={0.6} />
    <circle cx="8" cy="13" r="1.3" fill="currentColor" opacity={0.5} />
    <circle cx="13" cy="13" r="1.4" fill="currentColor" opacity={0.55} />
    <circle cx="18" cy="13" r="1.2" fill="currentColor" opacity={0.5} />
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
