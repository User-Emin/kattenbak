#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 GITHUB ACTIONS STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get latest runs
echo "📊 Latest workflow runs:"
curl -s "https://api.github.com/repos/User-Emin/kattenbak/actions/runs?per_page=5" | python3 -c "
import sys, json
data = json.load(sys.stdin)
runs = data.get('workflow_runs', [])
for r in runs:
    status_icon = '✅' if r.get('conclusion') == 'success' else '❌' if r.get('conclusion') == 'failure' else '⏳'
    print(f\"{status_icon} Run #{r['run_number']}: {r['status']} ({r.get('conclusion', 'pending')})\")
    print(f\"   Title: {r.get('display_title', 'N/A')[:70]}\")
    print(f\"   URL: {r['html_url']}\")
    print()
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ Failed runs (last 10):"
curl -s "https://api.github.com/repos/User-Emin/kattenbak/actions/runs?per_page=20&status=completed" | python3 -c "
import sys, json
data = json.load(sys.stdin)
failed = [r for r in data.get('workflow_runs', []) if r.get('conclusion') == 'failure']
if failed:
    for r in failed[:10]:
        print(f\"  ❌ Run #{r['run_number']}: {r.get('display_title', 'N/A')[:60]}\")
        print(f\"     URL: {r['html_url']}\")
        print()
else:
    print('  ✅ No failed runs found!')
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Production Status:"
echo "  Frontend: $(curl -s -o /dev/null -w '%{http_code}' https://catsupply.nl)"
echo "  Backend: $(curl -s https://catsupply.nl/api/v1/health | python3 -c 'import sys, json; print(json.load(sys.stdin).get(\"success\", \"unknown\"))' 2>/dev/null || echo 'unknown')"
echo ""
