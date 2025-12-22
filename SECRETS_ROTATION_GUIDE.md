# 🔑 SECRETS ROTATION COMPLETE GUIDE

**Generated**: 22 Dec 2025, 08:30 UTC  
**Status**: ⚠️ **ACTION REQUIRED**

---

## 🚨 EXPOSED SECRETS (Found in audit)

### 1. MOLLIE API KEY
```
Current: live_3qeg4zBTvV8kVJTwmFsjEtfRzjrq32
Status: 🔴 EXPOSED (in .env file that was world-readable)
Action: ROTATE IMMEDIATELY
```

### 2. CLAUDE API KEY
```
Current: sk-ant-api03-FylVqWG87NX...
Status: 🔴 EXPOSED (in .env file that was world-readable)
Action: ROTATE IMMEDIATELY
```

### 3. JWT SECRET
```
Current: Unknown (in .env)
Status: ⚠️ WEAK (likely short)
Action: ROTATE with strong 48-byte key
```

---

## 🔄 ROTATION STEPS

### 1. Mollie API Key

**Steps**:
1. Login: https://dashboard.mollie.com
2. Navigate to: Settings → API Keys
3. Click: "Generate new API key"
4. Copy the new key (starts with `live_` for production)
5. Update server `/var/www/kattenbak/backend/.env`:
   ```bash
   MOLLIE_API_KEY=live_NEW_KEY_HERE
   ```
6. Restart backend: `pm2 restart backend`
7. **REVOKE** old key in Mollie dashboard

**Test**:
```bash
curl -X GET https://api.mollie.com/v2/methods \
  -H "Authorization: Bearer live_NEW_KEY_HERE"
```

---

### 2. Claude API Key

**Steps**:
1. Login: https://console.anthropic.com
2. Navigate to: Settings → API Keys
3. Click: "Create Key"
4. Copy the new key (starts with `sk-ant-api03-`)
5. Update server `/var/www/kattenbak/backend/.env`:
   ```bash
   CLAUDE_API_KEY=sk-ant-api03-NEW_KEY_HERE
   ```
6. Restart backend: `pm2 restart backend`
7. **DELETE** old key in Anthropic console

**Test**:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-api03-NEW_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-haiku-20241022","max_tokens":5,"messages":[{"role":"user","content":"hi"}]}'
```

---

### 3. JWT Secret

**Generate NEW strong secret** (48 bytes = 256 bits):
```bash
openssl rand -base64 48
```

**Result**:
```
rTTmt22ehE2ZR0KnH+AKyR5LWV16d/RgSsF5kUVogtYz5CKqpfR3sn9rOCn68VXJ
```

**Update server** `/var/www/kattenbak/backend/.env`:
```env
JWT_SECRET=rTTmt22ehE2ZR0KnH+AKyR5LWV16d/RgSsF5kUVogtYz5CKqpfR3sn9rOCn68VXJ
```

**⚠️ IMPORTANT**: This will **invalidate all existing JWT tokens!**
- All users must login again
- Admin sessions will expire

**After rotation**:
```bash
pm2 restart backend
pm2 restart admin
```

---

### 4. Admin Password

**Generate bcrypt hash**:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('NEW_SECURE_PASSWORD_HERE', 12).then(console.log)"
```

**Example output**:
```
$2b$12$abcd1234...NewHashHere
```

**Update** `backend/src/routes/admin-auth.routes.ts`:
```typescript
const ADMIN_PASSWORD_HASH = '$2b$12$abcd1234...NewHashHere';
```

**Git commit + deploy**:
```bash
git add backend/src/routes/admin-auth.routes.ts
git commit -m "security: Rotate admin password hash"
git push origin main
pm2 restart backend
```

---

## 🔒 POST-ROTATION CHECKLIST

- [ ] **Mollie**: Old key revoked in dashboard
- [ ] **Claude**: Old key deleted in console
- [ ] **JWT**: All admin users re-logged in
- [ ] **Admin password**: Communicated to team via secure channel
- [ ] **Test payments**: Verify Mollie integration works
- [ ] **Test RAG**: Verify Claude chat works
- [ ] **Monitor logs**: Check for authentication errors
- [ ] **Update documentation**: Record rotation date

---

## 📅 ROTATION SCHEDULE

**Best Practice**: Rotate secrets every 90 days

| Secret | Last Rotated | Next Due | Priority |
|--------|-------------|----------|----------|
| MOLLIE_API_KEY | Never | **NOW** | 🔴 Critical |
| CLAUDE_API_KEY | Never | **NOW** | 🔴 Critical |
| JWT_SECRET | Never | **NOW** | 🔴 Critical |
| Admin Password | Never | **NOW** | 🔴 Critical |
| DB Password | Unknown | 90 days | 🟡 Medium |

---

## 🛡️ FUTURE PREVENTION

### 1. Use Secrets Manager
```bash
# AWS Secrets Manager
aws secretsmanager create-secret --name catsupply/mollie \
  --secret-string "live_NEW_KEY"

# Access in code:
const secret = await secretsManager.getSecretValue({SecretId: 'catsupply/mollie'}).promise();
```

### 2. Environment Variable Best Practices
```bash
# Correct permissions
chmod 600 /var/www/kattenbak/backend/.env

# Ownership
chown root:root /var/www/kattenbak/backend/.env

# Never commit
echo ".env" >> .gitignore
```

### 3. Audit Regularly
```bash
# Check .env permissions monthly
ls -la /var/www/kattenbak/backend/.env

# Scan git history for secrets
git secrets --scan-history
```

---

## ✅ ROTATION COMPLETE

**After completing all steps above**:

1. Update `SECURITY_AUDIT_COMPREHENSIVE.md`:
   - Change "Secrets: 4/10" → "Secrets: 10/10"
   
2. Test all integrations:
   - [ ] Mollie payment test
   - [ ] Claude RAG chat test
   - [ ] Admin login test
   
3. Monitor for 24h:
   - [ ] No authentication errors
   - [ ] No payment failures
   - [ ] No RAG errors

**Security Score Impact**: +2.5 points (5.5 → 8.0)

---

## 🚨 EMERGENCY CONTACTS

**If rotation fails**:
- Mollie Support: support@mollie.com
- Anthropic Support: support@anthropic.com
- Database Admin: dba@catsupply.nl

**Rollback procedure**:
1. Keep old keys for 24h grace period
2. Test new keys thoroughly before revoking old
3. Have backup .env.backup ready
