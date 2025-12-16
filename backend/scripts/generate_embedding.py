#!/usr/bin/env python3
"""
Generate text embeddings using sentence-transformers
Model: all-MiniLM-L6-v2 (384 dimensions)
"""

import sys
import json
from sentence_transformers import SentenceTransformer

def generate_embedding(text: str) -> list:
    """Generate embedding for text"""
    try:
        # Load BEST model for Dutch (cached after first load)
        model = SentenceTransformer('intfloat/multilingual-e5-base')
        
        # Generate embedding
        embedding = model.encode(text, normalize_embeddings=True)
        
        # Convert to list
        return embedding.tolist()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: generate_embedding.py <text>", file=sys.stderr)
        sys.exit(1)
    
    text = sys.argv[1]
    embedding = generate_embedding(text)
    
    # Output as JSON
    print(json.dumps(embedding))
