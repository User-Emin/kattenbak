# 🔒 ADMIN LOGIN - COMPLETE TROUBLESHOOTING GUIDE

## ✅ CURRENT STATUS

### **Services:**
```
✓ Backend:  http://localhost:3101 (RUNNING)
✓ Admin:    http://localhost:3001 (RUNNING)
✓ API:      http://localhost:3101/api/v1 (WORKING)
```

### **Login Endpoint:**
```bash
POST http://localhost:3101/api/v1/admin/auth/login

Valid Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "admin-1",
      "email": "admin@localhost",
      "role": "ADMIN"
    }
  }
}

Invalid Credentials (401):
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## 🐛 IF YOU SEE `{}` IN CONSOLE

### **Problem:**
```
API Error interceptor: {}
loginApi error: {}
```

### **Root Causes:**

#### **1. Admin niet gerestart na .env.local change**
```bash
# Fix:
pkill -f 'admin-next'
cd admin-next && npm run dev
```

#### **2. Browser cache oude code**
```bash
# Fix:
- Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- Clear browser cache
- Close all admin tabs
- Open new incognito window
```

#### **3. API URL incorrect in .env.local**
```bash
# Check:
cat admin-next/.env.local

# Should be:
NEXT_PUBLIC_API_URL=http://localhost:3101/api/v1

# Fix if wrong:
echo "NEXT_PUBLIC_API_URL=http://localhost:3101/api/v1" > admin-next/.env.local
pkill -f 'admin-next'
cd admin-next && npm run dev
```

#### **4. Old build cache**
```bash
# Fix:
cd admin-next
rm -rf .next
npm run dev
```

---

## 🔍 DEBUGGING STEPS

### **Step 1: Verify API Works**
```bash
curl -X POST http://localhost:3101/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@localhost","password":"admin123"}' | jq

# Expected: 200 OK with token
```

### **Step 2: Check Admin Config**
```bash
# In browser console (F12):
console.log(process.env.NEXT_PUBLIC_API_URL)

# Expected: "http://localhost:3101/api/v1"
# If wrong or undefined: restart admin!
```

### **Step 3: Monitor Network Tab**
```
1. Open DevTools (F12)
2. Network tab
3. Try login
4. Look for: POST /admin/auth/login
5. Check:
   - Status: 200 or 401
   - Response: { success, data/error }
```

### **Step 4: Check Console Logs**
```javascript
// Expected on SUCCESS:
API Response interceptor: {
  url: "/admin/auth/login",
  status: 200,
  data: { success: true, data: { token, user } }
}

// Expected on ERROR:
API Error interceptor: {
  message: "Invalid credentials",
  status: 401,
  url: "/admin/auth/login",
  details: { error: "Invalid credentials" }
}
```

---

## 🎯 TESTING PROTOCOL

### **Test 1: Valid Credentials**
```
URL:      http://localhost:3001/login
Email:    admin@localhost
Password: admin123

Expected:
✓ Toast: "Login successful!"
✓ Redirect to /dashboard
✓ Console: Full response logged
✓ No {} errors
```

### **Test 2: Invalid Credentials**
```
Email:    wrong@test.com
Password: wrongpass

Expected:
✓ Toast: "Ongeldige email of wachtwoord"
✓ Console: Error details logged
✓ No {} errors
✓ HTTP 401 in Network tab
```

### **Test 3: Backend Down**
```
1. Stop backend: pkill -f 'node.*backend'
2. Try login
3. Expected:
   ✓ Toast: "Kan geen verbinding maken..."
   ✓ Console: Network error logged
   ✓ No {} errors
```

---

## 🔧 COMPLETE FIX CHECKLIST

- [ ] Backend running on 3101
- [ ] Admin running on 3001
- [ ] `.env.local` exists with correct URL
- [ ] Admin restarted after .env change
- [ ] Browser hard refreshed (Cmd+Shift+R)
- [ ] Browser cache cleared
- [ ] `.next` folder deleted and rebuilt
- [ ] Network tab shows 200/401 responses
- [ ] Console shows full error objects (not {})
- [ ] Valid login redirects to dashboard
- [ ] Invalid login shows friendly error

---

## 🚀 QUICK FIX COMMANDS

```bash
# Complete restart:
pkill -f 'node.*dev'
cd /Users/emin/kattenbak

# Start backend:
cd backend && npm run dev &

# Fix admin config:
echo "NEXT_PUBLIC_API_URL=http://localhost:3101/api/v1" > admin-next/.env.local

# Clean & start admin:
cd admin-next
rm -rf .next
npm run dev &

# Wait 10 seconds, then test:
sleep 10
./test-login-complete.sh
```

---

## 📝 CREDENTIALS (DEVELOPMENT)

```
Email:    admin@localhost
Password: admin123
```

**These are hardcoded in:**
`backend/src/routes/admin/auth.routes.ts` (line ~13-14)

---

## ✅ SUCCESS CRITERIA

### **API Test:**
```bash
$ ./test-login-complete.sh

✓ Backend running
✓ Admin running
✓ API URL correct
✓ Valid login: 200 OK + token
✓ Invalid login: 401 + error message
```

### **Browser Test:**
```
✓ Open http://localhost:3001/login
✓ Enter credentials
✓ Click "Inloggen"
✓ See: "Login successful!"
✓ Redirect to: /dashboard
✓ Console: Full logs (no {})
✓ Network: 200 OK response
```

---

## 🎉 IF STILL ISSUES

1. **Run complete test:**
   ```bash
   ./test-login-complete.sh
   ```

2. **Check logs:**
   ```bash
   tail -f /tmp/admin-fresh.log
   tail -f /tmp/backend-new.log
   ```

3. **Nuclear option (complete clean restart):**
   ```bash
   pkill -f 'node'
   rm -rf admin-next/.next
   rm -rf backend/.next
   ./quick-start.sh
   ```

---

**STATUS:** ✅ **API WORKS - Check browser cache if {} persists!**


