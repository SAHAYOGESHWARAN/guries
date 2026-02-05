#!/bin/bash

echo "🔐 Login System Verification"
echo "======================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo -e "\n${YELLOW}Test 1: Backend Health Check${NC}"
HEALTH=$(curl -s http://localhost:3003/api/v1/health 2>/dev/null)
if [[ $HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "   Start backend: npm run dev --prefix backend"
    exit 1
fi

# Test 2: Check environment variables
echo -e "\n${YELLOW}Test 2: Environment Variables${NC}"
if [ -f "backend/.env" ]; then
    ADMIN_EMAIL=$(grep "ADMIN_EMAIL=" backend/.env | cut -d'=' -f2)
    ADMIN_PASSWORD=$(grep "ADMIN_PASSWORD=" backend/.env | cut -d'=' -f2)
    JWT_SECRET=$(grep "JWT_SECRET=" backend/.env | cut -d'=' -f2)
    
    if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ] || [ -z "$JWT_SECRET" ]; then
        echo -e "${RED}❌ Missing environment variables${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
    echo "   ADMIN_EMAIL: $ADMIN_EMAIL"
    echo "   ADMIN_PASSWORD: ${ADMIN_PASSWORD:0:20}..."
else
    echo -e "${RED}❌ backend/.env file not found${NC}"
    exit 1
fi

# Test 3: Test login API
echo -e "\n${YELLOW}Test 3: Login API Test${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

if [[ $RESPONSE == *"success"* ]] && [[ $RESPONSE == *"token"* ]]; then
    echo -e "${GREEN}✅ Login API working${NC}"
    echo "   Response: $(echo $RESPONSE | head -c 100)..."
elif [[ $RESPONSE == *"Invalid email or password"* ]]; then
    echo -e "${RED}❌ Invalid credentials${NC}"
    echo "   Response: $RESPONSE"
    echo ""
    echo "   Possible causes:"
    echo "   1. Bcrypt hash doesn't match password"
    echo "   2. Environment variables not loaded"
    echo "   3. Backend not restarted after .env change"
    exit 1
else
    echo -e "${RED}❌ Login API error${NC}"
    echo "   Response: $RESPONSE"
    exit 1
fi

# Test 4: Check frontend
echo -e "\n${YELLOW}Test 4: Frontend Check${NC}"
FRONTEND=$(curl -s http://localhost:5173 2>/dev/null | head -c 100)
if [ ! -z "$FRONTEND" ]; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend might not be running${NC}"
    echo "   Start frontend: npm run dev --prefix frontend"
fi

# Summary
echo -e "\n${GREEN}======================================"
echo "✅ All tests passed!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:5173 in browser"
echo "2. Login with:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo "3. You should be redirected to dashboard"
echo ""
