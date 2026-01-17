#!/bin/bash

# 🚀 GitHub Deployment Verification Script
# ============================================================================
# Verifies all deployment files are in GitHub and workflow is correct
# ============================================================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 GITHUB DEPLOYMENT VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASSED=0
FAILED=0

check_pass() {
    echo -e "\033[0;32m✅ PASS\033[0m: $1"
    PASSED=$((PASSED + 1))
}

check_fail() {
    echo -e "\033[0;31m❌ FAIL\033[0m: $1"
    FAILED=$((FAILED + 1))
}

# Check if in git repository
if [ ! -d ".git" ]; then
    check_fail "Not in a git repository"
    exit 1
fi

check_pass "Git repository: Found"

# Check workflow file exists
if [ -f ".github/workflows/production-deploy.yml" ]; then
    check_pass "Workflow file: Exists"
    
    # Check workflow content
    if grep -q "build-backend\|build-frontend\|build-admin" .github/workflows/production-deploy.yml; then
        check_pass "Build jobs: Found (backend, frontend, admin)"
    else
        check_fail "Build jobs: Missing"
    fi
    
    if grep -q "Deploy to Production\|deploy:" .github/workflows/production-deploy.yml; then
        check_pass "Deploy job: Found"
    else
        check_fail "Deploy job: Missing"
    fi
    
    if grep -q "SSH_PRIVATE_KEY\|SERVER_HOST\|SERVER_USER" .github/workflows/production-deploy.yml; then
        check_pass "Server secrets: Referenced in workflow"
    else
        check_fail "Server secrets: Not referenced"
    fi
    
    if grep -q "CPU\|Miner\|security.*check" .github/workflows/production-deploy.yml; then
        check_pass "Security checks: In workflow"
    else
        check_fail "Security checks: Missing"
    fi
    
    if grep -q "catsupply.nl" .github/workflows/production-deploy.yml; then
        check_pass "Production URL: catsupply.nl configured"
    else
        check_fail "Production URL: Not configured"
    fi
else
    check_fail "Workflow file: Not found"
fi

# Check setup scripts
if [ -f ".github/setup-github-secrets.sh" ]; then
    check_pass "GitHub secrets setup: Script exists"
else
    check_fail "GitHub secrets setup: Script not found"
fi

# Check security monitor script
if [ -f "scripts/server-security-monitor.sh" ]; then
    check_pass "Security monitor script: Exists"
else
    check_fail "Security monitor script: Not found"
fi

# Check E2E verification script
if [ -f "scripts/e2e-verification.sh" ]; then
    check_pass "E2E verification script: Exists"
else
    check_fail "E2E verification script: Not found"
fi

# Check if files are tracked by git
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 GIT TRACKING VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if git ls-files --error-unmatch .github/workflows/production-deploy.yml > /dev/null 2>&1; then
    check_pass "Workflow file: Tracked by git"
else
    check_fail "Workflow file: NOT tracked by git (needs git add)"
fi

if git ls-files --error-unmatch .github/setup-github-secrets.sh > /dev/null 2>&1; then
    check_pass "Secrets setup: Tracked by git"
else
    check_fail "Secrets setup: NOT tracked by git"
fi

if git ls-files --error-unmatch scripts/server-security-monitor.sh > /dev/null 2>&1; then
    check_pass "Security monitor: Tracked by git"
else
    check_fail "Security monitor: NOT tracked by git"
fi

if git ls-files --error-unmatch scripts/e2e-verification.sh > /dev/null 2>&1; then
    check_pass "E2E verification: Tracked by git"
else
    check_fail "E2E verification: NOT tracked by git"
fi

# Check remote
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 GITHUB REMOTE VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REMOTE=$(git remote -v | grep origin | head -1 | awk '{print $2}')
if [ -n "$REMOTE" ]; then
    check_pass "Git remote: $REMOTE"
    
    if echo "$REMOTE" | grep -q "github.com"; then
        check_pass "GitHub remote: Valid"
    else
        check_fail "GitHub remote: Not a GitHub repository"
    fi
else
    check_fail "Git remote: Not configured"
fi

# Check if there are uncommitted changes
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 GIT STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

UNTRACKED=$(git status --porcelain | grep "^??" | wc -l)
MODIFIED=$(git status --porcelain | grep "^ M" | wc -l)
UNSTAGED=$(git status --porcelain | grep "^ M\|^ D" | wc -l)

if [ "$UNTRACKED" -gt 0 ]; then
    echo -e "\033[1;33m⚠️  WARNING\033[0m: $UNTRACKED untracked file(s)"
    echo "   Run 'git add .' to track them"
fi

if [ "$MODIFIED" -gt 0 ] || [ "$UNSTAGED" -gt 0 ]; then
    echo -e "\033[1;33m⚠️  WARNING\033[0m: $UNSTAGED uncommitted change(s)"
    echo "   Run 'git add .' and 'git commit' to commit them"
fi

if [ "$UNTRACKED" -eq 0 ] && [ "$MODIFIED" -eq 0 ] && [ "$UNSTAGED" -eq 0 ]; then
    check_pass "Git status: Clean (all changes committed)"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Passed:  $PASSED"
echo "❌ Failed:  $FAILED"
echo ""

TOTAL=$((PASSED + FAILED))
SCORE=$((PASSED * 100 / TOTAL))

echo "Score: $SCORE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "\033[0;32m✅ VERIFICATION PASSED - READY FOR GITHUB\033[0m"
    echo ""
    echo "Next steps:"
    echo "  1. git add ."
    echo "  2. git commit -m 'feat: Complete deployment setup'"
    echo "  3. git push origin main"
    exit 0
else
    echo -e "\033[0;31m❌ VERIFICATION FAILED - FIX ISSUES FIRST\033[0m"
    exit 1
fi
