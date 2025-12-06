#!/bin/bash

echo "========================================"
echo "Marketing Control Center - Backend"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found!"
    echo ""
    echo "Please create .env file from .env.example:"
    echo "  1. Copy .env.example to .env"
    echo "  2. Update database credentials in .env"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "[INFO] Installing dependencies..."
    npm install
    echo ""
fi

# Check if database is setup
echo "[INFO] Checking database connection..."
node -e "const {pool} = require('./config/db'); pool.query('SELECT 1').then(() => {console.log('[OK] Database connected'); pool.end();}).catch(err => {console.error('[ERROR] Database connection failed:', err.message); process.exit(1);});"

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Database connection failed!"
    echo ""
    echo "Please run database setup:"
    echo "  node setup-database.js"
    echo ""
    exit 1
fi

echo ""
echo "[INFO] Starting backend server..."
echo ""
echo "Server will be available at: http://localhost:3001"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev
