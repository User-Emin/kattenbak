# 🔧 FRONTEND CONSISTENCY FIX PLAN

## GEVONDEN INCONSISTENTIES:

### 1. ❌ PM2 COMMAND (KRITIEK!)
**Probleem:**
- Next.js config: `output: "standalone"`
- PM2 draait: `npm start` (geeft warnings)
- Correct: `node .next/standalone/server.js`

**Impact:** Warnings in logs, mogelijk performance issues

### 2. ❌ API URL MISMATCH
**Probleem:**
- Frontend .env.development: `NEXT_PUBLIC_API_URL=http://localhost:4000`
- Backend draait op: `PORT=3101`
- Mismatch: 4000 vs 3101

**Impact:** API calls kunnen falen lokaal

### 3. ⚠️  DUBBELE API CLIENT
**Probleem:**
- `frontend/lib/config.ts` (BASE_URL logic)
- `frontend/lib/api-client.ts` (mogelijk duplicate)

**Impact:** Inconsistente API calls, moeilijk te maintainen

### 4. ✅ BUILD STATUS
- Build slaagt lokaal
- TypeScript clean
- React 19 + Next.js 16 (modern stack)

---

## FIX STRATEGIE (DEFENSIEF):

### STAP 1: Fix PM2 Command
```bash
# Server
pm2 delete frontend
cd /var/www/kattenbak/frontend
pm2 start node --name frontend -- .next/standalone/server.js
pm2 save
```

### STAP 2: Fix API URL Consistency
```env
# frontend/.env.development
NEXT_PUBLIC_API_URL=http://localhost:3101  # ← Was 4000
NEXT_PUBLIC_SITE_URL=http://localhost:3102
```

### STAP 3: Consolidate API Clients
- Keep `lib/config.ts` (heeft defaults)
- Check `lib/api-client.ts` usage
- Merge or remove duplicate

### STAP 4: Production Verify
```bash
# Check .env.production heeft juiste URLs
NEXT_PUBLIC_API_URL=http://localhost:3101
NEXT_PUBLIC_SITE_URL=https://catsupply.nl
```

---

## TESTING CHECKLIST:
- [ ] PM2 geen warnings meer
- [ ] Frontend connect met backend (3101)
- [ ] Chat button werkt
- [ ] No restarts in PM2
- [ ] Lokaal: frontend (3102) + backend (3101) beiden bereikbaar

