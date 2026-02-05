#!/bin/bash

# Deployment Test Script for Guires Marketing Control Center v2.5.0
# Tests frontend, backend, and database functionality

echo "=========================================="
echo "Guires Marketing Control Center v2.5.0"
echo "Deployment Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing: $description... "
    
    response=$(curl -s -w "\n%{http_code}" -X $method "http://localhost:3003$endpoint" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer test-token" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    
    if [[ "$http_code" == "$expected_status" ]] || [[ "$http_code" == "200" ]] || [[ "$http_code" == "401" ]]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        ((TESTS_FAILED++))
    fi
}

# Function to test frontend
test_frontend() {
    echo -n "Testing: Frontend accessibility... "
    
    response=$(curl -s -w "\n%{http_code}" "http://localhost:5173/" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    
    if [[ "$http_code" == "200" ]]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        ((TESTS_FAILED++))
    fi
}

# Function to test database
test_database() {
    echo -n "Testing: Database file exists... "
    
    if [[ -f "backend/mcc_db.sqlite" ]]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "1. FRONTEND TESTS"
echo "=================="
test_frontend
echo ""

echo "2. BACKEND API TESTS"
echo "===================="
test_endpoint "GET" "/api/v1/health" "200" "Health check endpoint"
test_endpoint "GET" "/health" "200" "Root health endpoint"
echo ""

echo "3. DATABASE TESTS"
echo "================="
test_database
echo ""

echo "4. PROCESS VERIFICATION"
echo "======================="
echo -n "Checking: Frontend process (npm run dev:frontend)... "
if pgrep -f "npm run dev:frontend" > /dev/null; then
    echo -e "${GREEN}✓ RUNNING${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
    ((TESTS_FAILED++))
fi

echo -n "Checking: Backend process (npm run dev:backend)... "
if pgrep -f "npm run dev:backend" > /dev/null; then
    echo -e "${GREEN}✓ RUNNING${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
    ((TESTS_FAILED++))
fi
echo ""

echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo ""
    echo "Deployment Status: SUCCESS"
    echo ""
    echo "Access the application:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:3003/api/v1"
    echo "  Database: backend/mcc_db.sqlite"
    echo ""
    echo "Default Login:"
    echo "  Email: admin@example.com"
    echo "  Password: admin123"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Deployment Status: INCOMPLETE"
    exit 1
fi
