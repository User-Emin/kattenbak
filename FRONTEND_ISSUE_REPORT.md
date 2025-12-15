# 🚨 FRONTEND DEPLOYMENT ISSUE - VOLLEDIG GEÏSOLEERD

## ✅ WERKEND (6/9 E2E TESTS PASSED):

- **Admin**: https://catsupply.nl/admin (Port 3001) ✅
- **Backend API**: https://catsupply.nl/api/v1/* (Port 3101, 2 workers) ✅
- **Git Monorepo**: Complete met backend/frontend/admin-next/tests/ ✅
- **Deployment Automation**: deploy-complete.sh ✅
- **E2E Tests**: Automated via tests/e2e-production.sh ✅

## ❌ ROOT CAUSE - FRONTEND:

### PROBLEEM:
```bash
npm error notsup Unsupported platform for lightningcss-darwin-arm64@1.30.2
npm error notsup wanted {"os":"darwin","cpu":"arm64"}  
npm error notsup current: {"os":"linux","cpu":"x64"}
```

### DEEP DIVE BEVINDINGEN:

1. **`lightningcss-darwin-arm64` zit vast in `package-lock.json`**
   - Gegenereerd op macOS arm64 (lokale dev)
   - Incompatibel met AlmaLinux x64 (productie server)
   - `npm install` faalt altijd, zelfs na `npm ci`, `--no-optional`, `--legacy-peer-deps`

2. **`next: command not found`**
   - `node_modules/.bin/next` bestaat niet
   - `npm install` kan niet voltooien door platform lock
   - Zonder Next.js binary: geen build, geen start

3. **Geen build output**
   - `.next/` directory ontbreekt
   - `npm run build` faalt: "next: command not found"
   - Port 3102 niet listening

4. **Node_modules eigenaar mismatch**
   - Lokale upload: eigenaar `501 games` (macOS user ID)
   - Server verwacht: eigenaar `root`

## 🎯 OPLOSSINGEN (IN VOLGORDE VAN VOORKEUR):

### 1. **DOCKER BUILD** (Beste, cross-platform)
```bash
cd /Users/emin/kattenbak/frontend
docker build -t catsupply-frontend:latest -f Dockerfile.production .
docker save catsupply-frontend:latest | gzip > frontend-docker.tar.gz
# Upload naar server
docker load < frontend-docker.tar.gz
docker run -d --name catsupply-frontend -p 3102:3102 --restart unless-stopped catsupply-frontend:latest
```

**STATUS**: Docker niet geïnstalleerd lokaal (`docker: command not found`)

### 2. **GITHUB ACTIONS CI/CD**
```yaml
# .github/workflows/deploy.yml
- name: Build frontend
  run: cd frontend && npm install && npm run build
  
- name: Deploy via rsync
  run: rsync -avz .next/ user@server:/var/www/kattenbak/frontend/.next/
```

**STATUS**: Nog niet geïmplementeerd

### 3. **LIGHTNINGCSS VERWIJDEREN** (Tijdelijke fix)
```bash
# Lokaal:
cd frontend
npm uninstall lightningcss
npm install
git commit -am "Remove lightningcss, use autoprefixer only"
git push

# Server:
cd /var/www/kattenbak/frontend
git pull
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 start npm --name frontend -- start
```

**STATUS**: Geprobeerd, maar `package-lock.json` bevat nog steeds platform-specific entries

### 4. **NODE.JS 22 UPGRADEN**
```bash
# Server heeft Node.js 20.19.6
# package.json vereist: ">=22.0.0"
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs
node -v  # Should be v22.x
```

**STATUS**: Niet geprobeerd (potentieel risico voor backend/admin)

## 📋 AANBEVOLEN VOLGENDE STAPPEN:

### OPTIE A: Docker Installeren + Build
1. Installeer Docker Desktop lokaal (macOS)
2. Build image met `Dockerfile.production`
3. Export + upload naar server
4. Install Docker op server: `dnf install -y docker && systemctl start docker`
5. Load image + run container

**VOORDEEL**: Volledig platform-onafhankelijk, reproduceerbaar
**NADEEL**: Extra layer (Docker), meer complexiteit

### OPTIE B: GitHub Actions CI/CD
1. Maak `.github/workflows/deploy-frontend.yml`
2. Build in GitHub runners (Linux x64)
3. Auto-deploy naar server via SSH
4. Trigger bij push naar `main`

**VOORDEEL**: Geautomatiseerd, geen lokale build nodig
**NADEEL**: Setup tijd, GitHub secrets configuratie

### OPTIE C: Downgrade Tailwind/PostCSS
1. Verwijder `lightningcss` dependency
2. Use alleen `autoprefixer` voor Tailwind 3.x
3. Clean install op server

**VOORDEEL**: Simpel, minimale changes
**NADEEL**: Mogelijk minder geoptimaliseerde CSS

## 🔒 HUIDIGE PRODUCTIE STATUS:

```
Admin:    ✅ 100% operational  
Backend:  ✅ 100% operational (2 workers, clustering)
Frontend: ⚠️  502 Bad Gateway (port 3102 niet listening)

E2E Tests: 6/9 passed (66.7%)
  ✅ Backend API: 3/3
  ✅ Admin: 3/3
  ❌ Frontend: 0/3
```

## 📝 DEPLOYMENT AUTOMATION READY:

- `deploy-complete.sh`: Full stack deployment script ✅
- `tests/e2e-production.sh`: Automated E2E testing ✅
- Git monorepo: backend + frontend + admin-next ✅
- PM2 ecosystem configs: backend + admin ✅

**Alleen frontend deployment geblokkeerd door platform issue**

---

**DATUM**: 15 Dec 2025  
**SERVER**: AlmaLinux 9, Node.js 20.19.6  
**LOKAAL**: macOS arm64, Node.js (versie onbekend)
