#!/bin/bash

# Quick Start - Kattenbak op poorten 3100/3101/3102

echo "🚀 KATTENBAK START (poorten 3100/3101/3102)"
echo ""

# Database via Docker Desktop UI starten of via command
echo "✅ Database moet draaien (Docker Desktop)"
echo "✅ Poorten: Frontend 3100, Backend 3101, Admin 3102" 
echo ""
echo "Open in browser: http://localhost:3100"
echo "Admin: admin@localhost / admin123"
echo ""
echo "Druk Ctrl+C om te stoppen"
echo ""

cd "$(dirname "$0")"
npm run dev
