# Lokale setup – Poorten & 500-fix

**Productie is volledig afgezonderd:** zie [PRODUCTION_ISOLATION.md](./PRODUCTION_ISOLATION.md).

## Isolatie: Lokaal vs productie

| Bestand | Gebruik | Productie? |
|---------|---------|------------|
| `frontend/.env` | Productie-defaults (catsupply.nl) | Ja |
| `frontend/.env.development` | **Alleen** bij NODE_ENV=development | Nee |
| `frontend/.env.local` | User override, gitignored | Nee |
| `backend/.env` | Lokaal dev (header: LOKAAL) | Nee |
| Root `.env` | Lokaal scripts/workspace | Nee |

Next.js laadt bij `npm run dev`: `.env.development` → overschrijft `.env` voor dev.
Productie (Vercel/PM2): gebruikt alleen `.env` of platform env vars.

## Poortconfiguratie (volgens LOCAL_ADMIN.md + SECURITY_POLICY)

| Service  | Poort | URL                      |
|----------|-------|--------------------------|
| Backend  | **3101** | http://localhost:3101   |
| Frontend | **3002** | http://localhost:3002   |
| Admin    | **3001** | http://localhost:3001   |

## Fix Internal Server Error (500)

**Oorzaak:** `NEXT_PUBLIC_API_URL` wijst naar de verkeerde poort (bijv. 3002 = frontend zelf).

Zet in **`frontend/.env.development`** (lokaal alleen, gitignored):

```env
NEXT_PUBLIC_API_URL=http://localhost:3101/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

**Let op:** `frontend/.env.development` wordt alleen bij `NODE_ENV=development` geladen. Productie blijft ongewijzigd.

## Volgorde starten

1. Backend: `npm run dev:backend` → 3101
2. Frontend: `npm run dev:frontend` → 3002
3. Admin: `npm run dev:admin` → 3001

Of alles tegelijk: `npm run dev`

---

## Verificatie lokaal (incl. MCP browser)

1. **Poorten:** Backend 3101, frontend 3002, admin 3001.
2. **Health:** `curl -s http://localhost:3101/api/v1/health` → `200` en JSON.
3. **Homepage:** Open http://localhost:3002 → geen 500, pagina laadt.
4. **Admin:** Open http://localhost:3002/admin → login; inloggen met credentials uit [LOCAL_ADMIN.md](./LOCAL_ADMIN.md).
5. **MCP browser (Cursor):** Als de MCP-server "cursor-ide-browser" is geïnstalleerd en verbonden:
   - `browser_navigate` naar `http://localhost:3002`
   - `browser_snapshot` om de pagina te controleren
   - Eventueel `browser_navigate` naar `http://localhost:3002/admin` en login testen.

   Als MCP browser niet beschikbaar is: gebruik Playwright:  
   `npx playwright test tests/e2e/security-policy-verification.spec.ts --project=chromium`
