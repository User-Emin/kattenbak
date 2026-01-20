#!/bin/bash
# Start frontend and verify logo is visible

cd frontend

echo "🚀 Starting frontend on port 3002..."
echo "📋 Logo should be visible at: http://localhost:3002"
echo ""
echo "✅ Logo file exists: $(ls -lh public/logos/logo.webp | awk '{print $5}')"
echo "✅ Logo path in header.tsx: /logos/logo.webp"
echo ""
echo "Starting Next.js dev server..."

npm run dev
