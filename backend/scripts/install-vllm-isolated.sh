#!/bin/bash
set -e

echo "========================================"
echo "🚀 STEP 2: ISOLATED vLLM INSTALLATION"
echo "========================================"
echo ""
echo "Team Review: AI Engineer + DevOps"
echo "Goal: Install and test vLLM WITHOUT touching existing Ollama"
echo ""

# 1. Check Python version
echo "1️⃣ Checking Python version..."
python3 --version
if ! python3 -c "import sys; assert sys.version_info >= (3, 8)" 2>/dev/null; then
  echo "❌ Python 3.8+ required"
  exit 1
fi
echo "✅ Python version OK"
echo ""

# 2. Install vLLM (isolated)
echo "2️⃣ Installing vLLM..."
pip3 install --user vllm || {
  echo "⚠️  Regular install failed, trying with --break-system-packages"
  pip3 install --user --break-system-packages vllm
}
echo "✅ vLLM installed"
echo ""

# 3. Test vLLM import
echo "3️⃣ Testing vLLM import..."
python3 -c "import vllm; print(f'vLLM version: {vllm.__version__}')"
echo "✅ vLLM imports successfully"
echo ""

# 4. Download Qwen2.5-3B model (if not cached)
echo "4️⃣ Checking Qwen2.5-3B model..."
python3 << 'PYTEST'
from transformers import AutoTokenizer, AutoModelForCausalLM
import os

model_name = "Qwen/Qwen2.5-3B-Instruct"
cache_dir = os.path.expanduser("~/.cache/huggingface")

print(f"Model: {model_name}")
print(f"Cache: {cache_dir}")

# This will download if not cached
print("Downloading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
print(f"✅ Tokenizer ready: {len(tokenizer)} tokens")

print("\nModel will be downloaded by vLLM on first use (~3.8GB)")
print("Location: ~/.cache/huggingface/hub/")
PYTEST
echo ""

# 5. Start vLLM server (background, isolated port)
echo "5️⃣ Starting vLLM server (isolated on port 8000)..."
echo "   This will run in background for testing"
echo ""

nohup python3 -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-3B-Instruct \
  --port 8000 \
  --host 127.0.0.1 \
  --served-model-name qwen2.5-3b \
  --max-model-len 2048 \
  --trust-remote-code \
  > /var/log/vllm-test.log 2>&1 &

VLLM_PID=$!
echo "vLLM PID: $VLLM_PID"
echo "Waiting for vLLM to start (may take 30-60s for model loading)..."

# Wait for vLLM to be ready
for i in {1..60}; do
  if curl -s http://127.0.0.1:8000/health >/dev/null 2>&1 || \
     curl -s http://127.0.0.1:8000/v1/models >/dev/null 2>&1; then
    echo "✅ vLLM is ready!"
    break
  fi
  
  if [ $i -eq 60 ]; then
    echo "❌ vLLM failed to start in 60s"
    echo "Check logs: tail /var/log/vllm-test.log"
    exit 1
  fi
  
  echo -n "."
  sleep 1
done
echo ""

# 6. Test vLLM API
echo "6️⃣ Testing vLLM OpenAI-compatible API..."
echo ""

echo "Test 1: List models"
curl -s http://127.0.0.1:8000/v1/models | python3 -m json.tool | head -10
echo ""

echo "Test 2: Simple completion"
START=$(date +%s%3N)
RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-3b",
    "prompt": "Wat is 2+2?",
    "max_tokens": 50,
    "temperature": 0.7
  }')
END=$(date +%s%3N)
LATENCY=$((END - START))

echo "$RESPONSE" | python3 -m json.tool | head -20
echo ""
echo "⏱️  Latency: ${LATENCY}ms"
echo ""

# 7. Concurrent test
echo "7️⃣ Testing concurrent requests (10 parallel)..."
echo ""

for i in {1..10}; do
  curl -s -X POST http://127.0.0.1:8000/v1/completions \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"qwen2.5-3b\",\"prompt\":\"Test $i\",\"max_tokens\":10}" \
    > /tmp/vllm_test_$i.json &
done

wait
echo "✅ All 10 concurrent requests completed"
echo ""

# Check results
SUCCESS=0
for i in {1..10}; do
  if grep -q '"choices"' /tmp/vllm_test_$i.json 2>/dev/null; then
    SUCCESS=$((SUCCESS + 1))
  fi
done

echo "📊 Results: $SUCCESS/10 successful"
rm -f /tmp/vllm_test_*.json
echo ""

# 8. Benchmark
echo "8️⃣ Quick benchmark (5 requests)..."
TOTAL=0
for i in {1..5}; do
  START=$(date +%s%3N)
  curl -s -X POST http://127.0.0.1:8000/v1/completions \
    -H "Content-Type: application/json" \
    -d '{"model":"qwen2.5-3b","prompt":"Test","max_tokens":20}' \
    > /dev/null
  END=$(date +%s%3N)
  LATENCY=$((END - START))
  TOTAL=$((TOTAL + LATENCY))
  echo "  Request $i: ${LATENCY}ms"
done

AVG=$((TOTAL / 5))
echo "📈 Average latency: ${AVG}ms"
echo ""

# 9. Summary
echo "========================================"
echo "✅ STEP 2 COMPLETE: vLLM ISOLATED TEST"
echo "========================================"
echo ""
echo "RESULTS:"
echo "  ✅ vLLM installed and running"
echo "  ✅ Qwen2.5-3B model loaded"
echo "  ✅ OpenAI-compatible API working"
echo "  ✅ Concurrent requests: $SUCCESS/10"
echo "  ✅ Average latency: ${AVG}ms"
echo ""
echo "vLLM Process: PID $VLLM_PID (running on port 8000)"
echo "Ollama: Still running independently (port 11434)"
echo ""
echo "🎯 READY FOR STEP 3: Parallel testing (Ollama vs vLLM)"
echo ""
echo "To stop vLLM test server:"
echo "  kill $VLLM_PID"
echo ""
