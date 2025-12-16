#!/bin/bash
set -e

echo "========================================"
echo "🚀 UPGRADING TO BEST MODELS"
echo "========================================"

cd /var/www/kattenbak/backend

# 1. Install best embedding model (multilingual-e5-base)
echo ""
echo "1️⃣ Installing multilingual-e5-base embedding model..."
python3 -c "
from sentence_transformers import SentenceTransformer
print('Downloading multilingual-e5-base...')
model = SentenceTransformer('intfloat/multilingual-e5-base')
print('✅ Model downloaded and cached')
test = model.encode('test', normalize_embeddings=True)
print(f'✅ Test embedding generated: {len(test)} dimensions')
"

# 2. Pull best LLM (Qwen2.5:3b)
echo ""
echo "2️⃣ Pulling Qwen2.5:3b LLM (best for Dutch)..."
ollama pull qwen2.5:3b

# 3. Test models
echo ""
echo "3️⃣ Testing models..."
python3 << 'PYTEST'
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('intfloat/multilingual-e5-base')
embedding = model.encode("Dit is een test", normalize_embeddings=True)
print(f"✅ Embedding: {len(embedding)} dimensions")
PYTEST

ollama run qwen2.5:3b "Wat is 2+2?" --verbose=false | head -3

echo ""
echo "========================================"
echo "✅ BEST MODELS INSTALLED"
echo "========================================"
echo "Embedding: intfloat/multilingual-e5-base (768 dim)"
echo "LLM: Qwen2.5:3b"
echo "========================================"
