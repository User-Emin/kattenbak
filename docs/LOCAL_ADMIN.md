# Lokaal inloggen – Admin & poort

## Backend API (poort)

- **Poort:** `3101`
- **Base URL:** `http://localhost:3101`
- **Health:** `http://localhost:3101/api/v1/health` of `http://localhost:3101/health`

## Admin-panel (geen 404 meer)

- **URL:** `http://localhost:3002/admin`  
  De frontend proxyt `/admin` naar de admin-app (poort 3001). Gebruik dus **altijd** de frontend-URL.
- **Login-endpoint:** `POST http://localhost:3101/api/v1/admin/auth/login`

## Admin-credentials (lokaal)

| Veld         | Waarde               |
|--------------|----------------------|
| **E-mail**   | `admin@catsupply.nl` |
| **Wachtwoord** | `admin123456789` of `admin123`* |

*\* `admin123` als de database een bestaande admin-user heeft (oude setup). Nieuwe setups: gebruik `admin123456789` (min 12 tekens, SECURITY_POLICY).*

**Let op:** Stel in `backend/.env` of root `.env`: `ADMIN_EMAIL` en `ADMIN_PASSWORD` (min 12 tekens). Default: `admin@localhost` / `admin123456789`. Zie `docs/SECURITY_POLICY.md`.

## Snel lokaal starten (volgorde)

1. **Backend:** `cd backend && npm run dev` → poort **3101**
2. **Frontend:** `cd frontend && npm run dev` → poort **3002**
3. **Admin-app:** `cd admin-next && npm run dev` → poort **3001** (nodig voor de proxy)
4. Open **http://localhost:3002/admin** → doorverwezen naar login; log in met bovenstaande gegevens.

Zonder stap 3 krijg je bij `/admin` een verbindingsfout; start dan ook de admin-app.

## Deploy op server

- Zet de admin-app op de server op een vaste poort (bijv. 3001).
- Bij de frontend: `ADMIN_APP_ORIGIN=http://127.0.0.1:3001` (of de interne URL van de admin-app), zodat de rewrite naar `/admin` werkt.
- Nginx: laat `/admin` door de frontend afhandelen (frontend proxyt intern naar de admin-app).
