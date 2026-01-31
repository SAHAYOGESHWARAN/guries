#!/bin/bash

# Complete Deployment Script
# Sets up everything needed for production deployment
# Usage: ./deploy-complete.sh

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Complete Deployment Setup Script                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Initialize Database
echo -e "${YELLOW}Step 1: Initializing Database...${NC}"
if [ -f "init-production-db.js" ]; then
    node init-production-db.js
    echo -e "${GREEN}✅ Database initialized${NC}"
else
    echo -e "${RED}❌ init-production-db.js not found${NC}"
    exit 1
fi

echo ""

# Step 2: Install Dependencies
echo -e "${YELLOW}Step 2: Installing Dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""

# Step 3: Build Backend
echo -e "${YELLOW}Step 3: Building Backend...${NC}"
npm run build
echo -e "${GREEN}✅ Backend built${NC}"

echo ""

# Step 4: Setup Admin Credentials
echo -e "${YELLOW}Step 4: Setting Up Admin Credentials...${NC}"
echo ""
echo "You will now be prompted to enter admin credentials."
echo "Press Enter to use default values."
echo ""
node setup-admin-credentials.js

echo ""

# Step 5: Verify Setup
echo -e "${YELLOW}Step 5: Verifying Setup...${NC}"
node verify-qc-fix.js
echo -e "${GREEN}✅ Verification complete${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Deployment Setup Complete!                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "1. Start backend: npm start"
echo "2. Build frontend: cd ../frontend && npm run build"
echo "3. Serve frontend: npm run preview"
echo "4. Access application at http://localhost:5174"
echo ""
