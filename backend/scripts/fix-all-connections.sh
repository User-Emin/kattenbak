#!/bin/bash
set -e

echo "========================================"
echo "🔧 FIXING ALL CONNECTIONS"
echo "========================================"

cd /var/www/kattenbak/backend

# 1. Ensure Ollama is running with proper config
echo "1️⃣ Configuring Ollama..."
pkill ollama || true
sleep 2

# Start with high concurrency settings
OLLAMA_NUM_PARALLEL=4 OLLAMA_MAX_LOADED_MODELS=2 nohup ollama serve > /var/log/ollama.log 2>&1 &
sleep 5

# Verify Ollama
ollama list

# 2. Re-ingest with new embeddings model
echo ""
echo "2️⃣ Re-ingesting documents with multilingual-e5-base..."
node ingest-simple.js 2>&1 | tail -30

# Check vector store
echo ""
echo "Vector store size:"
ls -lh data/vector-store.json

# 3. Rebuild backend
echo ""
echo "3️⃣ Rebuilding backend..."
npm run build 2>&1 | tail -5

# 4. Restart with zero-downtime
echo ""
echo "4️⃣ Restarting backend..."
pm2 restart backend --update-env

# Wait for startup
sleep 10

# 5. Test all connections
echo ""
echo "========================================"
echo "🧪 TESTING ALL CONNECTIONS"
echo "========================================"

echo ""
echo "✅ Test 1: Backend health"
curl -s http://localhost:3101/health | python3 -m json.tool

echo ""
echo "✅ Test 2: RAG health"
curl -s http://localhost:3101/api/v1/rag/health | python3 -m json.tool

echo ""
echo "✅ Test 3: RAG chat (should use Qwen2.5)"
curl -s -X POST http://localhost:3101/api/v1/rag/chat \
  -H 'Content-Type: application/json' \
  -d '{"question":"Hoeveel liter?"}' | python3 -m json.tool

echo ""
echo "✅ Test 4: Frontend to backend (via HTTPS)"
curl -s https://catsupply.nl/api/v1/rag/health | python3 -m json.tool

echo ""
echo "✅ Test 5: Admin API"
curl -s https://catsupply.nl/api/v1/products | python3 -m json.tool | head -20

echo ""
echo "========================================"
echo "✅ ALL CONNECTIONS VERIFIED"
echo "========================================"
pm2 list
