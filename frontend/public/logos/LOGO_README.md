# Logo – vervangen op server

Het navbar-logo komt uit **design-system** (geen hardcode):

- **Pad:** `/logos/logo.png`  
  → bestand: `frontend/public/logos/logo.png`

**Logo uit bijlage (CATSUPPLY wit op donker) plaatsen:**

1. Sla de bijlage (bijv. `Schermafbeelding 2026-02-01 om 11.28.43.png`) op als `logo.png`.
2. Plaats het bestand hier: `frontend/public/logos/logo.png`  
   (op server: `/var/www/kattenbak/frontend/public/logos/logo.png`.)
3. Deploy opnieuw of herlaad de site; de navbar toont dit logo.

**USP-banner** (boven de navbar): wit met zwarte tekst — staat in `design-system.ts` (`uspBanner.bg: '#ffffff'`, `uspBanner.color: '#000000'`).

Fallback bij fout: `logo-navbar-original.png` → daarna `logo.webp`. Als alles faalt: tekst-placeholder "Logo".
