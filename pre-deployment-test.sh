#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PRE-DEPLOYMENT API TESTS
# Run deze tests VOOR elke deployment om API errors te voorkomen
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 PRE-DEPLOYMENT API TESTING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if backend is running
if ! curl -s http://localhost:3101/health > /dev/null 2>&1; then
  echo -e "${RED}❌ Backend not running on port 3101${NC}"
  echo -e "${YELLOW}Start backend first:${NC}"
  echo "  cd backend && npm run dev"
  exit 1
fi

echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Run comprehensive API tests
./test-api-endpoints.sh

# If tests pass, check data integrity
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}📊 DATA INTEGRITY CHECKS${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  # Check products
  PRODUCT_COUNT=$(curl -s http://localhost:3101/api/v1/products | jq '.data | length' 2>/dev/null || echo "0")
  echo -e "Products in database: ${GREEN}$PRODUCT_COUNT${NC}"
  
  # Check categories
  CATEGORY_COUNT=$(curl -s http://localhost:3101/api/v1/categories | jq '.data | length' 2>/dev/null || echo "0")
  echo -e "Categories in database: ${GREEN}$CATEGORY_COUNT${NC}"
  
  # Check featured products
  FEATURED_COUNT=$(curl -s http://localhost:3101/api/v1/products/featured | jq '.data | length' 2>/dev/null || echo "0")
  echo -e "Featured products: ${GREEN}$FEATURED_COUNT${NC}"
  
  # Check if products have videoUrl field
  HAS_VIDEO_FIELD=$(curl -s http://localhost:3101/api/v1/products/featured | jq '.data[0] | has("videoUrl")' 2>/dev/null || echo "false")
  if [ "$HAS_VIDEO_FIELD" = "true" ]; then
    echo -e "Video URL field: ${GREEN}✓ Present${NC}"
  else
    echo -e "Video URL field: ${RED}✗ Missing${NC}"
  fi
  
  echo ""
  
  # Warnings
  if [ "$CATEGORY_COUNT" = "0" ]; then
    echo -e "${YELLOW}⚠️  Warning: No categories in database${NC}"
    echo -e "${YELLOW}   Run: ./seed-database.sh${NC}"
    echo ""
  fi
  
  if [ "$PRODUCT_COUNT" = "0" ]; then
    echo -e "${YELLOW}⚠️  Warning: No products in database${NC}"
    echo -e "${YELLOW}   Add products via admin panel${NC}"
    echo ""
  fi
  
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ PRE-DEPLOYMENT CHECKS PASSED!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}Ready to deploy:${NC}"
  echo "  git push origin main"
  echo ""
  exit 0
else
  echo ""
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ PRE-DEPLOYMENT CHECKS FAILED!${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}Fix errors before deploying!${NC}"
  echo ""
  exit 1
fi
