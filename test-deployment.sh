#!/bin/bash

# Deployment Testing Script
# Tests all critical functionality after deployment to Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_URL="${1:-https://your-app.vercel.app}"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deployment Testing Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Testing: ${APP_URL}${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local data=$4
    local description=$5

    echo -e "${BLUE}Testing: ${description}${NC}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "${APP_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "${APP_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} - Status: $status_code"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} - Expected: $expected_status, Got: $status_code"
        echo "Response: $body"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test 1: Health Check
echo -e "${YELLOW}=== Test 1: Health Check ===${NC}"
test_endpoint "GET" "/api/v1/health" "200" "" "Health endpoint"
echo ""

# Test 2: Get Industry/Sectors
echo -e "${YELLOW}=== Test 2: Get Industry/Sectors ===${NC}"
test_endpoint "GET" "/api/v1/industry-sectors" "200" "" "Get all industry/sectors"
echo ""

# Test 3: Create Industry/Sector
echo -e "${YELLOW}=== Test 3: Create Industry/Sector ===${NC}"
create_data='{
  "industry": "Test Industry",
  "sector": "Test Sector",
  "application": "Test Application",
  "country": "Test Country",
  "status": "active"
}'
test_endpoint "POST" "/api/v1/industry-sectors" "201" "$create_data" "Create new industry/sector"
echo ""

# Test 4: Get Content Types
echo -e "${YELLOW}=== Test 4: Get Content Types ===${NC}"
test_endpoint "GET" "/api/v1/content-types" "200" "" "Get all content types"
echo ""

# Test 5: Get Asset Types
echo -e "${YELLOW}=== Test 5: Get Asset Types ===${NC}"
test_endpoint "GET" "/api/v1/asset-types" "200" "" "Get all asset types"
echo ""

# Test 6: Get Asset Categories
echo -e "${YELLOW}=== Test 6: Get Asset Categories ===${NC}"
test_endpoint "GET" "/api/v1/asset-categories" "200" "" "Get all asset categories"
echo ""

# Test 7: Get Asset Formats
echo -e "${YELLOW}=== Test 7: Get Asset Formats ===${NC}"
test_endpoint "GET" "/api/v1/asset-formats" "200" "" "Get all asset formats"
echo ""

# Test 8: Get Platforms
echo -e "${YELLOW}=== Test 8: Get Platforms ===${NC}"
test_endpoint "GET" "/api/v1/platforms" "200" "" "Get all platforms"
echo ""

# Test 9: Get Countries
echo -e "${YELLOW}=== Test 9: Get Countries ===${NC}"
test_endpoint "GET" "/api/v1/countries" "200" "" "Get all countries"
echo ""

# Test 10: Frontend Load
echo -e "${YELLOW}=== Test 10: Frontend Load ===${NC}"
frontend_response=$(curl -s -w "\n%{http_code}" "${APP_URL}/")
frontend_status=$(echo "$frontend_response" | tail -n1)
if [ "$frontend_status" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} - Frontend loads successfully"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - Frontend failed to load (Status: $frontend_status)"
    ((TESTS_FAILED++))
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    exit 1
fi
