# 📊 SCRIPTS ANALYSE - KATTENBAK PROJECT

**Totaal aantal scripts:** 98  
**Datum analyse:** 20 Januari 2026

---

## ✅ ACTIEF GEBRUIKTE SCRIPTS

### 1. GitHub Actions Workflows

#### `.github/workflows/production-deploy.yml`
- ✅ **`stabilize-uploads.sh`** - Stabiliseert uploads na deployment
- ✅ **`e2e-admin-test.sh`** - E2E tests voor admin panel
- ✅ **`verify-product-data.sh`** - Verifieert product data consistency
- ✅ **`restore-product-data.sh`** - Restore product data bij failures
- ✅ **`verify-data-consistency.sh`** - Verifieert data consistency
- ✅ **`verify-database-consistency.sh`** - Verifieert database consistency
- ✅ **`test-product-api.sh`** - Test product API endpoints

#### `.github/workflows/admin-e2e-test.yml`
- ✅ **`e2e-admin-test.sh`** - E2E tests voor admin
- ✅ **`fix-admin-deploy.sh`** - Fix admin deployment issues

### 2. Cron Jobs (via `setup-cronjobs.sh`)

- ✅ **`comprehensive-monitoring.sh`** - Comprehensive monitoring & alerting
  - Gebruikt via: `setup-monitoring-cron.sh`
  - Email alerts naar: `emin@digihand.nl`
  - Health checks: Backend, Frontend, Admin, Database, Nginx
  - Resource monitoring: CPU, Memory, Disk
  - 502 error detection
  - Automatic service recovery

- ✅ **`server-monitoring-cron.sh`** - Server health monitoring
  - Gebruikt via: `setup-cronjobs.sh`
  - Daily health checks
  - SSL certificate expiry checks
  - PM2 service checks

### 3. Manual/On-Demand Scripts

- ✅ **`build-cpu-friendly.sh`** - CPU-vriendelijke build (nieuw, actief)
- ✅ **`fix-ssl-certificate.sh`** - SSL certificate fix
- ✅ **`fix-nginx-images-config.sh`** - Nginx images config fix
- ✅ **`deploy-secure.sh`** - Secure deployment script
- ✅ **`setup-cronjobs.sh`** - Setup cron jobs
- ✅ **`setup-monitoring-cron.sh`** - Setup monitoring cron

---

## ⚠️ REDUNDANTE / LEGACY SCRIPTS

### Deployment Scripts (veel duplicaten)
- ❌ `deploy-production.sh` - Legacy, vervangen door GitHub Actions
- ❌ `deploy-production-robust.sh` - Legacy
- ❌ `deploy-production-with-password.sh` - Legacy
- ❌ `deploy-production-with-verification.sh` - Legacy
- ❌ `deploy-production-git.sh` - Legacy
- ❌ `deploy-git-automated.sh` - Legacy
- ❌ `deploy-git-automated-frontend.sh` - Legacy
- ❌ `deploy-git-optimized.sh` - Legacy
- ❌ `deploy-git-secure.sh` - Legacy
- ❌ `deploy-to-server-identical.sh` - Legacy
- ❌ `deploy-ssl-and-fix.sh` - Mogelijk redundant
- ❌ `deploy-with-health-checks.sh` - Legacy

**Reden:** GitHub Actions doet nu alle deployment automatisch.

### Verification Scripts (veel duplicaten)
- ❌ `verify-production-deployment.sh` - Legacy
- ❌ `verify-server-production-identical.sh` - Legacy
- ❌ `verify-github-deployment.sh` - Legacy
- ❌ `verify-admin-deployment.sh` - Mogelijk redundant
- ❌ `verify-deployment-stability.sh` - Mogelijk redundant
- ❌ `verify-css-build.sh` - Legacy
- ❌ `verify-uploads-stability.sh` - Mogelijk redundant
- ❌ `verify-security-complete.sh` - Legacy
- ❌ `verify-data-consistency.sh` - ✅ **ACTIEF** (gebruikt in GitHub Actions)
- ❌ `verify-database-consistency.sh` - ✅ **ACTIEF** (gebruikt in GitHub Actions)
- ❌ `verify-product-data.sh` - ✅ **ACTIEF** (gebruikt in GitHub Actions)

**Reden:** Veel verificatie scripts zijn vervangen door GitHub Actions checks.

### E2E Test Scripts (veel duplicaten)
- ❌ `e2e-verification.sh` - Legacy
- ❌ `e2e-verify-catsupply.sh` - Legacy
- ❌ `e2e-verify-no-data-loss.sh` - Legacy
- ❌ `e2e-mcp-browser-test.sh` - Legacy
- ❌ `e2e-chat-verification.sh` - Legacy
- ❌ `complete-e2e-verification.sh` - Legacy
- ❌ `frontend-e2e-test.sh` - Mogelijk redundant
- ✅ **`e2e-admin-test.sh`** - ✅ **ACTIEF** (gebruikt in GitHub Actions)

**Reden:** E2E tests zijn geconsolideerd in GitHub Actions.

### Email Setup Scripts (veel duplicaten)
- ❌ `setup-email-on-server.sh` - Mogelijk redundant
- ❌ `setup-email-and-verify.sh` - Mogelijk redundant
- ❌ `setup-email-config.sh` - Mogelijk redundant
- ❌ `execute-email-setup-local.sh` - Legacy
- ❌ `run-email-setup.sh` - Legacy
- ❌ `send-test-email-secure.sh` - Legacy
- ❌ `test-email-send.sh` - Legacy
- ❌ `check-email-config.sh` - Legacy
- ❌ `deep-verify-order-email.sh` - Legacy

**Reden:** Email setup is eenmalig gedaan, scripts zijn niet meer nodig.

### Security Audit Scripts (veel duplicaten)
- ❌ `security-audit.sh` - Legacy
- ❌ `security-audit-complete.sh` - Legacy
- ❌ `security-audit-deep.sh` - Legacy
- ❌ `comprehensive-security-audit.sh` - Legacy
- ❌ `security-verification-complete.sh` - Legacy
- ❌ `automated-security-checks.sh` - Mogelijk redundant

**Reden:** Security checks zijn geautomatiseerd in GitHub Actions (TruffleHog, npm audit).

### Server Setup Scripts (veel duplicaten)
- ❌ `server-setup-optimized.sh` - Legacy (eenmalig setup)
- ❌ `server-setup-ubuntu-optimized.sh` - Legacy (eenmalig setup)
- ❌ `server-monitor.sh` - Legacy
- ❌ `server-security-monitor.sh` - Mogelijk redundant
- ❌ `server-rag-monitor.sh` - Legacy
- ❌ `server-e2e-verification.sh` - Legacy
- ❌ `critical-server-cleanup.sh` - Legacy
- ❌ `comprehensive-cleanup.sh` - Legacy
- ❌ `anti-miner-cleanup.sh` - Legacy
- ❌ `kill-rogue-processes.sh` - Legacy

**Reden:** Server setup is eenmalig gedaan, monitoring gebeurt via cron.

### Health Check Scripts (veel duplicaten)
- ❌ `health-check.sh` - Legacy
- ❌ `health-check-automation.sh` - Legacy
- ❌ `backend-health-check.sh` - Mogelijk redundant
- ❌ `monitor-services.sh` - Legacy
- ❌ `monitor-overload.sh` - Legacy
- ❌ `monitor-frontend-overload.sh` - Legacy
- ❌ `auto-heal.sh` - Legacy

**Reden:** Health checks zijn geautomatiseerd in `comprehensive-monitoring.sh`.

### Database Scripts
- ❌ `postgres-backup.sh` - Legacy (backup gebeurt in GitHub Actions)
- ❌ `postgres-connection-stability.sh` - Legacy
- ❌ `configure-db-encryption.sh` - Legacy (eenmalig setup)
- ❌ `configure-redis-security.sh` - Legacy (eenmalig setup)

**Reden:** Database backups gebeuren automatisch in GitHub Actions deployment.

### Product Data Scripts
- ❌ `restore-product-data.sh` - ✅ **ACTIEF** (gebruikt in GitHub Actions)
- ❌ `restore-product-data.ts` - TypeScript versie (mogelijk redundant)
- ❌ `fix-product-data-consistency.sh` - Mogelijk redundant
- ❌ `test-product-api.sh` - ✅ **ACTIEF** (gebruikt in GitHub Actions)
- ❌ `test-product-api-e2e.sh` - Mogelijk redundant

### Other Scripts
- ❌ `pull-and-verify.sh` - Legacy
- ❌ `cleanup-old-deploys.sh` - Legacy
- ❌ `optimize-logo.sh` - Legacy
- ❌ `optimize-all-images-server.sh` - Legacy
- ❌ `optimize-large-images.sh` - Legacy
- ❌ `optimize-npm-install.sh` - Legacy
- ❌ `start-frontend-standalone-cpu-friendly.sh` - Legacy
- ❌ `start-frontend-with-logo-check.sh` - Legacy
- ❌ `check-logo-display.sh` - Legacy
- ❌ `stabilize-uploads.sh` - ✅ **ACTIEF** (gebruikt in GitHub Actions)
- ❌ `deep-verification.sh` - Legacy
- ❌ `full-deployment-verification.sh` - Legacy
- ❌ `update-github-ssh-secret.sh` - Legacy (eenmalig setup)
- ❌ `ssh-execute-with-password.sh` - Legacy

---

## 📊 SAMENVATTING

### Actief Gebruikt: ~15 scripts
1. `stabilize-uploads.sh` (GitHub Actions)
2. `e2e-admin-test.sh` (GitHub Actions)
3. `fix-admin-deploy.sh` (GitHub Actions)
4. `verify-product-data.sh` (GitHub Actions)
5. `restore-product-data.sh` (GitHub Actions)
6. `verify-data-consistency.sh` (GitHub Actions)
7. `verify-database-consistency.sh` (GitHub Actions)
8. `test-product-api.sh` (GitHub Actions)
9. `comprehensive-monitoring.sh` (Cron)
10. `server-monitoring-cron.sh` (Cron)
11. `build-cpu-friendly.sh` (Manual)
12. `fix-ssl-certificate.sh` (Manual)
13. `fix-nginx-images-config.sh` (Manual)
14. `deploy-secure.sh` (Manual)
15. `setup-cronjobs.sh` (Manual)
16. `setup-monitoring-cron.sh` (Manual)

### Redundant/Legacy: ~82 scripts
- Deployment scripts: ~12 (vervangen door GitHub Actions)
- Verification scripts: ~15 (vervangen door GitHub Actions)
- E2E test scripts: ~8 (geconsolideerd in GitHub Actions)
- Email setup scripts: ~9 (eenmalig setup)
- Security audit scripts: ~6 (geautomatiseerd in GitHub Actions)
- Server setup scripts: ~10 (eenmalig setup)
- Health check scripts: ~7 (geautomatiseerd in comprehensive-monitoring.sh)
- Database scripts: ~4 (geautomatiseerd in GitHub Actions)
- Other scripts: ~11

---

## 🎯 AANBEVELINGEN

### 1. Cleanup Redundante Scripts
Verwijder ~82 legacy scripts die niet meer gebruikt worden:
- Deployment scripts (vervangen door GitHub Actions)
- Legacy verification scripts
- Eenmalig setup scripts (na setup niet meer nodig)
- Duplicate E2E test scripts

### 2. Documenteer Actieve Scripts
Maak een `SCRIPTS_README.md` met:
- Welke scripts actief gebruikt worden
- Wanneer ze gebruikt worden (GitHub Actions, Cron, Manual)
- Hoe ze te gebruiken

### 3. Consolidatie
- Overweeg om legacy scripts te archiveren in `scripts/archive/`
- Of verwijder ze volledig als ze niet meer nodig zijn

---

## ✅ CONCLUSIE

**Van de 98 scripts worden er ~15 actief gebruikt:**
- 8 scripts in GitHub Actions workflows
- 2 scripts in Cron jobs
- 6 scripts voor manual/on-demand gebruik

**~82 scripts zijn redundant/legacy** en kunnen worden opgeschoond.
