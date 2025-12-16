#!/bin/bash
set -e

echo "===== COMPLETE RAG DEPLOYMENT ====="
cd /var/www/kattenbak/backend

# 1. Ollama model
echo "1. Ollama model check..."
pgrep ollama || (nohup ollama serve &> /var/log/ollama.log &)
sleep 3
ollama list | grep llama3.2 || ollama pull llama3.2:3b

# 2. Test embeddings
echo "2. Testing embeddings..."
python3 scripts/generate_embedding.py "test" | head -1

# 3. Build backend
echo "3. Building backend..."
npm run build 2>&1 | tail -3

# 4. Document ingestion
echo "4. Ingesting documents..."
npm run rag:ingest 2>&1 | tail -10

# 5. Restart
echo "5. Restarting backend..."
pm2 restart backend
sleep 5

# 6. Tests
echo "6. Running tests..."
curl -s http://localhost:3101/api/v1/rag/health
echo ""
curl -s -X POST http://localhost:3101/api/v1/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Hoeveel liter is de afvalbak?"}' | head -10

echo ""
echo "✅ DEPLOYMENT COMPLETE"
pm2 list | grep backend
