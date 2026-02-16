# Deployment via Git – Volledige flow

## Principes

1. **Alleen git als bron** – Op de server wordt uitsluitend `origin/main` gebruikt. Geen handmatige bestandswijzigingen op de server.
2. **Schone install** – Voor elke deploy: `node_modules` (root, backend, frontend) worden verwijderd, daarna `npm ci`. Voorkomt EEXIST (symlink) en corrupte/cache van TypeScript.
3. **Vaste volgorde** – Git sync → root deps → backend deps + Prisma + build → frontend deps + build → PM2 restart.
4. **Verificatie** – Na deploy altijd E2E-checks: `scripts/e2e-deployment-verification.sh` (health, product-API, frontend-pagina’s, assets).

## Flow (volledig)

1. **Lokaal**: wijzigingen committen en pushen naar `origin main`.
2. **Deploy uitvoeren** (één van beide):
   - **Vanaf je machine** (met credentials):
     ```bash
     # .env.server: SERVER_HOST=185.224.139.74, SSHPASS=...
     bash scripts/deploy-secure.sh
     ```
   - **Op de server** (na SSH):
     ```bash
     ssh root@185.224.139.74
     cd /var/www/kattenbak
     bash scripts/deploy-from-git-server.sh
     ```
     Daarna lokaal (optioneel) verificatie draaien:
     ```bash
     bash scripts/e2e-deployment-verification.sh
     ```
3. **Verificatie** – `deploy-secure.sh` roept na deploy automatisch `e2e-deployment-verification.sh` aan. Draag je alleen op de server uit, run dan lokaal: `BASE_URL=https://catsupply.nl bash scripts/e2e-deployment-verification.sh`.

## Scripts

| Script | Waar | Doel |
|--------|------|------|
| `scripts/deploy-secure.sh` | Lokaal | Credentials + SSH + run server-deploy + E2E verificatie |
| `scripts/deploy-from-git-server.sh` | Server | Git sync, schone install, build, pm2 restart |
| `scripts/e2e-deployment-verification.sh` | Lokaal (of CI) | Health, API, frontend-pagina’s, assets – volledige check |

## Checks

- **Pre-check** (in deploy-secure.sh): toont huidige git-branch; deploy gebruikt altijd `origin/main` op de server.
- **Post-deploy**: E2E script controleert o.a.:
  - Backend health, product-API, product-by-slug
  - Frontend homepage, productpagina, cart, checkout
  - Productpagina-inhoud (geen lege pagina)
  - Static assets, error handling

Bevestiging: als alle E2E-tests slagen, is de deployment via git volledig bevestigd.
