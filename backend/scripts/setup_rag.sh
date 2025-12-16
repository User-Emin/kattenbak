#!/bin/bash
#
# RAG SETUP SCRIPT
# Installs all dependencies for RAG system
#

set -e

echo "=================================="
echo "RAG SYSTEM SETUP"
echo "=================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is required"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"

# Install Python dependencies
echo ""
echo "Installing Python dependencies..."
pip3 install --quiet sentence-transformers torch numpy

echo "✓ sentence-transformers installed"

# Test embedding generation
echo ""
echo "Testing embedding generation..."
python3 scripts/generate_embedding.py "test message" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Embeddings generation working"
else
    echo "ERROR: Embeddings test failed"
    exit 1
fi

# Install Ollama
echo ""
echo "Checking Ollama installation..."

if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "✓ Ollama installed"
else
    echo "✓ Ollama already installed: $(ollama --version)"
fi

# Download Llama 3.2 model
echo ""
echo "Downloading Llama 3.2 (3B) model..."
echo "This may take a few minutes..."

ollama pull llama3.2:3b

if [ $? -eq 0 ]; then
    echo "✓ Llama 3.2 model ready"
else
    echo "ERROR: Failed to download Llama 3.2"
    exit 1
fi

# Test Ollama
echo ""
echo "Testing Ollama..."
ollama run llama3.2:3b "Say 'test'" --verbose false 2>&1 | head -1

if [ $? -eq 0 ]; then
    echo "✓ Ollama working"
else
    echo "ERROR: Ollama test failed"
    exit 1
fi

echo ""
echo "=================================="
echo "✅ RAG SYSTEM SETUP COMPLETE"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Run migrations: npx prisma migrate deploy"
echo "2. Ingest documents: npm run rag:ingest"
echo "3. Test RAG: npm run rag:test"
