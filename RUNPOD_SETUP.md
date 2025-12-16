# 🚀 RUNPOD vLLM SETUP GUIDE

## ✅ **STAP 1: RUNPOD TEMPLATE SELECTEREN**

1. **Ga naar RunPod Dashboard**
   - https://www.runpod.io/console/serverless

2. **Klik: "+ New Endpoint"**

3. **Zoek Template: "vLLM"**
   - Filter: "Inference"
   - Selecteer: **"vLLM - OpenAI Compatible"**

---

## ⚙️ **STAP 2: CONFIGURATIE**

### **Model Settings:**
```
Model: Qwen/Qwen2.5-3B-Instruct
```

### **GPU Type:**
```
Aanbevolen: RTX 4090 (€0.50/uur actief)
Alternatief: RTX 3090 (€0.35/uur actief)
Budget: RTX 3080 (€0.25/uur actief)

Voor Qwen2.5-3B: Elke GPU is ruim voldoende (model = ~6GB VRAM)
```

### **Workers (Auto-scaling):**
```
Min Workers: 0 (betaal niks als idle)
Max Workers: 3 (max 3 parallel bij piek verkeer)
Idle Timeout: 30 seconds
Execution Timeout: 60 seconds
```

### **Environment Variables:**
```bash
MODEL=Qwen/Qwen2.5-3B-Instruct
MAX_MODEL_LEN=2048
DTYPE=auto
GPU_MEMORY_UTILIZATION=0.8
```

### **Advanced (optioneel):**
```bash
# Voor snellere inference (quantization):
QUANTIZATION=awq

# Voor streaming:
ENABLE_STREAMING=true
```

---

## 🚀 **STAP 3: DEPLOY**

1. **Klik: "Deploy"**
2. **Wacht: 2-3 minuten**
   - Model wordt gedownload
   - Container wordt gestart
   - GPU wordt geïnitialiseerd

3. **Status: "Running" ✅**

---

## 🔑 **STAP 4: CREDENTIALS OPHALEN**

Na deployment krijg je:

```
Endpoint URL: https://api.runpod.ai/v2/[jouw-endpoint-id]/runsync
API Key: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**BELANGRIJK:** Kopieer deze naar `.env.production`

---

## 🔧 **STAP 5: BACKEND CONFIGURATIE**

### **Lokaal testen (op je Mac):**

```bash
cd /Users/emin/kattenbak/backend

# Voeg toe aan .env
echo "USE_RUNPOD=true" >> .env
echo "RUNPOD_ENDPOINT=https://api.runpod.ai/v2/[jouw-id]" >> .env
echo "RUNPOD_API_KEY=jouw-api-key-hier" >> .env

# Test
npm run build
npm start

# In andere terminal:
curl -X POST http://localhost:3101/api/v1/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Hoeveel liter is de afvalbak?"}'
```

### **Op server deployen:**

```bash
# SSH naar server
ssh root@185.224.139.74

cd /var/www/kattenbak/backend

# Voeg credentials toe (VEILIG, niet in git)
echo "USE_RUNPOD=true" >> .env.production
echo "RUNPOD_ENDPOINT=https://api.runpod.ai/v2/[jouw-id]" >> .env.production
echo "RUNPOD_API_KEY=jouw-api-key" >> .env.production

# Deploy nieuwe code
git pull
npm run build
pm2 restart backend

# Test
curl -s -X POST https://catsupply.nl/api/v1/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Test"}' | python3 -m json.tool
```

---

## 🧪 **STAP 6: TESTEN**

### **Test 1: Direct RunPod API**
```bash
curl -X POST https://api.runpod.ai/v2/[jouw-id]/runsync \
  -H "Authorization: Bearer [jouw-api-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "model": "Qwen/Qwen2.5-3B-Instruct",
      "prompt": "Hoeveel is 2+2?",
      "max_tokens": 20
    }
  }'
```

### **Test 2: Via onze backend**
```bash
# Moet "backend": "runpod" teruggeven
curl -s -X POST https://catsupply.nl/api/v1/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Hoeveel liter?"}' | grep backend
```

### **Test 3: Concurrent (10 parallel)**
```bash
for i in {1..10}; do
  curl -s -X POST https://catsupply.nl/api/v1/rag/chat \
    -H "Content-Type: application/json" \
    -d "{\"question\":\"Test $i\"}" &
done
wait
```

### **Test 4: Fallback (zet RunPod uit)**
```bash
# In .env.production:
USE_RUNPOD=false

pm2 restart backend

# Moet "backend": "ollama" teruggeven
curl -s -X POST https://catsupply.nl/api/v1/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Test"}' | grep backend
```

---

## 📊 **STAP 7: MONITORING**

### **RunPod Dashboard:**
- **Requests**: Zie hoeveel queries
- **Latency**: Gemiddelde response tijd
- **Cost**: Real-time kosten tracking
- **Logs**: Error debugging

### **Backend Logs:**
```bash
# Zie welke backend gebruikt wordt
pm2 logs backend | grep -E "RunPod|Ollama|backend"
```

---

## 💰 **KOSTEN TRACKING**

### **Verwachte kosten:**
```
Scenario 1: Licht gebruik (100 queries/dag)
- Queries: 3000/maand
- GPU tijd: ~100 minuten/maand
- Kosten: ~€3-5/maand

Scenario 2: Normaal gebruik (500 queries/dag)  
- Queries: 15000/maand
- GPU tijd: ~500 minuten/maand
- Kosten: ~€15-20/maand

Scenario 3: Druk gebruik (2000 queries/dag)
- Queries: 60000/maand
- GPU tijd: ~2000 minuten/maand  
- Kosten: ~€60-80/maand
```

### **Cost optimization:**
- ✅ Min workers = 0 (geen kosten als idle)
- ✅ Idle timeout = 30s (snel shutdown)
- ✅ Fallback to Ollama (bij low priority queries)
- ✅ Batch small queries lokaal

---

## 🔄 **HYBRIDE STRATEGIE**

```typescript
// Slimme routing in backend:

if (isPriorityUser || isRealUser) {
  // GPU voor echte gebruikers (snel)
  return await RAGRunPodService.answerQuestion(question);
} else {
  // CPU voor test queries (gratis)
  return await RAGOllamaService.answerQuestion(question);
}
```

---

## ✅ **SUCCESS METRICS**

Na deployment check:

```
✅ RunPod health: true
✅ Concurrent queries: 10+ simultaneous
✅ Latency P50: <2s (was ~13s)
✅ Latency P95: <5s
✅ First token: <500ms
✅ Fallback works: Ollama kicks in if RunPod fails
✅ Cost: <€20/maand voor normale load
```

---

## 🚨 **TROUBLESHOOTING**

### **"RunPod timeout"**
- Check: Workers > 0 (of wait voor cold start)
- Check: Endpoint URL correct
- Check: API key correct

### **"Ollama fallback always"**
- Check: `USE_RUNPOD=true` in .env
- Check: RunPod health endpoint
- Check: Backend logs

### **"High costs"**
- Check: Min workers = 0
- Check: Idle timeout = 30s
- Implement: Smart routing (priority queries only)

---

## 🎯 **VOLGENDE STAP**

**Na RunPod deployment:**

1. ✅ RunPod endpoint geconfigureerd
2. ✅ Backend geüpdatet met hybride systeem
3. ⏭️ Routes updaten naar `RAGRunPodService`
4. ⏭️ Comprehensive E2E testing
5. ⏭️ Production deployment
6. ⏭️ Monitor costs & performance

Klaar om routes te updaten en te testen?
