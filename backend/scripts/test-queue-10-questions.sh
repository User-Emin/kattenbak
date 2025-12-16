#!/bin/bash
# Test RAG Queue with 10 sequential questions

echo "========================================="
echo "🧪 TESTING RAG QUEUE: 10 QUESTIONS"
echo "========================================="

BASE_URL="https://catsupply.nl"

QUESTIONS=(
  "Hoeveel liter is de afvalbak?"
  "Heeft het een app?"
  "Is het veilig voor mijn kat?"
  "Hoeveel lawaai maakt het?"
  "Werkt het met mijn vulling?"
  "Geschikt voor grote kat?"
  "Kan ik het voor 2 katten gebruiken?"
  "Hoe vaak moet ik legen?"
  "Is het makkelijk schoon te maken?"
  "Heeft het automatische reiniging?"
)

SUCCESS=0
FAILED=0

for i in "${!QUESTIONS[@]}"; do
  NUM=$((i+1))
  Q="${QUESTIONS[$i]}"
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📝 Question $NUM/10: $Q"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  START=$(date +%s)
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/rag/chat" \
    -H "Content-Type: application/json" \
    -d "{\"question\":\"$Q\"}" 2>&1)
  
  END=$(date +%s)
  DURATION=$((END - START))
  
  # Check if success
  if echo "$RESPONSE" | grep -q '"success":true'; then
    ANSWER=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('answer','')[:100])" 2>/dev/null)
    echo "✅ SUCCESS ($DURATION s)"
    echo "💬 Answer: $ANSWER"
    SUCCESS=$((SUCCESS + 1))
  else
    ERROR=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error','Unknown'))" 2>/dev/null || echo "Parse error")
    echo "❌ FAILED ($DURATION s)"
    echo "⚠️  Error: $ERROR"
    FAILED=$((FAILED + 1))
  fi
  
  # Small delay between questions
  sleep 2
done

echo ""
echo "========================================="
echo "📊 TEST RESULTS"
echo "========================================="
echo "✅ Success: $SUCCESS/10"
echo "❌ Failed:  $FAILED/10"
echo "📈 Success Rate: $((SUCCESS * 10))%"
echo "========================================="

# Get final queue stats
echo ""
echo "🔍 Queue Statistics:"
curl -s "$BASE_URL/api/v1/rag/health" | python3 -m json.tool | grep -A 5 "queue"

if [ $SUCCESS -eq 10 ]; then
  echo ""
  echo "🎉 ALL TESTS PASSED! Queue system working perfectly."
  exit 0
else
  echo ""
  echo "⚠️  Some tests failed. Check logs for details."
  exit 1
fi
