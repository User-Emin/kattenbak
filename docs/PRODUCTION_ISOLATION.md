# Productie (catsupply.nl) – Volledige isolatie van lokaal

**Doel:** catsupply.nl draait uitsluitend op productie-configuratie. Geen localhost, geen lokale .env, geen overlap met development.

---

## Hoe isolatie werkt

| Laag | Lokaal | Productie (catsupply.nl) |
|------|--------|---------------------------|
| **Backend env** | Laadt `backend/.env` of `../.env` | Laadt alleen `backend/.env` of **alleen process.env** (geen parent .env) |
| **Frontend API URL** | `NODE_ENV=development` → localhost:3101 of `NEXT_PUBLIC_API_URL` | `NODE_ENV=production` → altijd https://catsupply.nl/api/v1 (nooit localhost) |
| **Frontend env** | `.env.development` / `.env.local` (gitignored) | `.env` of platform env (Vercel/PM2) met catsupply.nl URLs |
| **CORS backend** | Development: localhost 3001/3002 toegestaan | Production: alleen https://catsupply.nl (geen localhost) |
| **Poorten lokaal** | Frontend 3002, Admin 3001, Backend 3101 | Productie: nginx → 3101/3102/3103 |

---

## Code-safeguards

1. **Backend** (`backend/src/config/env.config.ts` en `server-database.ts`):  
   Bij `NODE_ENV=production` worden alleen `process.cwd()/.env` en `process.env` gebruikt. Geen `../.env` of `../.env.development`. `server-database.ts` laadt in productie expliciet alleen `path.resolve(process.cwd(), '.env')`.

2. **Frontend** (`frontend/lib/config.ts`, `api-client.ts`, `api/returns.ts`):  
   Bij server-side **en** `NODE_ENV=production`: API URL is nooit localhost; bij ontbrekende/ongeldige env altijd `https://catsupply.nl/api/v1`.

3. **Client-side:**  
   API URL = `window.location.protocol + hostname + /api/v1`. Op catsupply.nl is dat dus altijd https://catsupply.nl/api/v1.

---

## Productie-deploy checklist

- [ ] `NODE_ENV=production` gezet op server of in build
- [ ] Geen lokale .env bestanden op de server (of alleen productie-.env met catsupply.nl)
- [ ] Backend: `DATABASE_URL`, `JWT_SECRET`, `MOLLIE_API_KEY` (live_), `ADMIN_*` uit process.env of productie-.env
- [ ] Frontend build met productie env: `NEXT_PUBLIC_API_URL=https://catsupply.nl/api/v1` en `NEXT_PUBLIC_SITE_URL=https://catsupply.nl` (of weglaten; code valt terug op catsupply.nl)
- [ ] CORS op backend: alleen https://catsupply.nl (geen localhost in productie)

---

## Lokaal vs productie – geen overlap

- **Lokaal:** Zie [LOKALE_SETUP.md](./LOKALE_SETUP.md). Poorten: frontend **3002**, admin **3001**, backend **3101**. Gebruikt `frontend/.env.development`, `backend/.env`, root `.env` (alle gitignored of lokaal). Geen productie-URLs.
- **Productie:** Alleen host-env of productie-.env; code weigert in productie expliciet localhost als API URL. Geen lokale poorten of .env van development.
