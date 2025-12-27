# 🔑 CLAUDE API KEY SETUP - REQUIRED FOR RAG

## ❌ CURRENT STATUS: Claude API Key MISSING

**Error**: `401 authentication_error - invalid x-api-key`

**Impact**: RAG chat systeem werkt NIET zonder geldige Claude API key.

---

## 🔧 HOW TO FIX

### Option 1: Create `/root/claudekey` file (RECOMMENDED)

```bash
# SSH to server
ssh root@185.224.139.74

# Create key file (replace with your actual Claude API key)
echo "sk-ant-api03-YOUR_CLAUDE_API_KEY_HERE" > /root/claudekey
chmod 600 /root/claudekey

# Verify
cat /root/claudekey | head -c 30
```

### Option 2: Add to `.env` file

```bash
# SSH to server
ssh root@185.224.139.74

# Edit backend .env
cd /var/www/kattenbak/backend
nano .env

# Add this line (replace with your actual key):
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_CLAUDE_API_KEY_HERE

# Save and exit (Ctrl+X, Y, Enter)

# Restart backend
pm2 restart backend --update-env
```

### Option 3: PM2 Ecosystem Config

```bash
# Edit ecosystem.config.js
nano /var/www/kattenbak/ecosystem.config.js

# Add to backend app env:
env: {
  ANTHROPIC_API_KEY: 'sk-ant-api03-YOUR_KEY_HERE',
  // ... other vars
}

# Restart
pm2 restart backend
```

---

## 🔐 SECURITY REQUIREMENTS

### ✅ DO:
- Store key in `/root/claudekey` (chmod 600)
- Add `ANTHROPIC_API_KEY` to backend `.env`
- Ensure `.gitignore` contains `.env`
- Use environment variables ONLY
- Rotate keys every 90 days

### ❌ DON'T:
- ❌ NEVER commit key to git repo
- ❌ NEVER hardcode in source files
- ❌ NEVER expose in frontend/client
- ❌ NEVER log full key value
- ❌ NEVER share key in chat/email

---

## 📊 WHERE TO GET CLAUDE API KEY

1. Go to: https://console.anthropic.com/
2. Login with your account
3. Navigate to: **API Keys** section
4. Click: **Create Key**
5. Name: `Kattenbak Production RAG`
6. Copy the key (starts with `sk-ant-api03-`)
7. **SAVE IT IMMEDIATELY** (can't view again!)

---

## 🧪 VERIFY KEY WORKS

```bash
# Test Claude API directly
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-api03-YOUR_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-haiku-20241022",
    "max_tokens": 100,
    "messages": [{"role":"user","content":"Hi"}]
  }'

# Expected: JSON response with "content" array
# Error: 401 = invalid key
# Error: 429 = rate limit
```

---

## 🚀 AFTER ADDING KEY

Run complete setup:

```bash
cd /var/www/kattenbak/backend

# 1. Ingest documents
node ingest-simple.js

# 2. Restart backend
pm2 restart backend --update-env

# 3. Test RAG health
curl http://localhost:3101/api/v1/rag/health

# 4. Test RAG chat
curl -X POST http://localhost:3101/api/v1/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Is de kattenbak veilig voor mijn kat?"}'
```

Expected: JSON response with `success: true` and answer.

---

## 💰 PRICING (as of Dec 2024)

**Claude 3.5 Haiku** (used in RAG):
- Input: $0.80 per 1M tokens
- Output: $4.00 per 1M tokens

**Estimated costs for kattenbak.nl:**
- ~100 tokens per query (input + output)
- 1000 queries = $0.50
- 10,000 queries = $5.00

Very affordable for e-commerce chatbot! 🎉

---

## 🔍 TROUBLESHOOTING

| Error | Solution |
|-------|----------|
| `401 authentication_error` | Key is invalid or missing |
| `404 not_found_error` | Wrong model name |
| `429 rate_limit_error` | Too many requests (wait) |
| `500 overloaded_error` | Claude API down (retry) |
| `No relevant documents` | Run ingestion script |

---

## 📞 CONTACT

Issues? Check:
1. Backend logs: `pm2 logs backend`
2. RAG health: `curl localhost:3101/api/v1/rag/health`
3. GitHub issues: https://github.com/User-Emin/kattenbak/issues

