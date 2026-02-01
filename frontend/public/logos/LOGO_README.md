# Logo – vervangen op server

Het navbar-logo komt uit **design-system** (geen hardcode):

- **Pad:** `/logos/logo.png`  
  → bestand: `frontend/public/logos/logo.png`

**Nieuw logo plaatsen (bijv. uit Downloads):**

1. Hernoem je bestand (bijv. `Schermafbeelding 2026-02-01 om 11.08.16.png`) naar `logo.png`.
2. Plaats het op de server:  
   `frontend/public/logos/logo.png`  
   (lokaal: `frontend/public/logos/logo.png`; op server: `/var/www/kattenbak/frontend/public/logos/logo.png`.)
3. Herlaad de site; de navbar toont het nieuwe logo.

Fallback bij fout: `logo-navbar-original.png` → daarna `logo.webp`.
