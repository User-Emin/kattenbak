# Deploy en SSH – server toegang

## Snelkoppeling: naadloze deploy (frontend only, geen backend crash)

```bash
./deploy
```

Of expliciet:

```bash
./deploy-frontend-only.sh
```

Dit doet: pull op server + frontend build + `pm2 restart frontend`. Backend blijft draaien.  
Gebruikt automatisch `.env.server` (SSHPASS) als die bestaat. Bestand `.env.server` staat in `.gitignore`.

---

## Inloggen op de server

```bash
# Met key
ssh -i ~/.ssh/id_ed25519_mewsimqr root@catsupply.nl
```

Of via sshpass (wachtwoord in .env.server):

```bash
source .env.server && sshpass -e ssh -o StrictHostKeyChecking=no root@catsupply.nl
```

---

## Deploy naar productie

| Script | Doet |
|--------|------|
| `./deploy` | Pull + frontend only (backend blijft draaien) |
| `./deploy-frontend-only.sh` | Idem |
| `./deploy-to-production.sh` | Volledige deploy (backend + frontend build + restart all) |

1. **Lokaal:** commit en push naar `main`.
2. **Deploy:** `./deploy` voor snelle frontend-update zonder backend crash.

---

## Deploy handmatig op de server

Als je al op de server zit:

```bash
ssh -i ~/.ssh/id_ed25519_mewsimqr root@catsupply.nl
cd /var/www/kattenbak && ./scripts/deploy-on-server.sh
```

---

## Key op server zetten (eenmalig)

Als je een nieuwe key wilt gebruiken:

1. Lokaal een key aanmaken (als je die nog niet hebt):
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_mewsimqr -C "jouw@email"
   ```
2. Publieke key op server zetten (inloggen met wachtwoord of bestaande key):
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519_mewsimqr.pub root@catsupply.nl
   ```
3. Daarna: `ssh -i ~/.ssh/id_ed25519_mewsimqr root@catsupply.nl` en `./deploy-to-production.sh` werken met deze key.
