#!/bin/bash

# Backend Setup Script
# This script builds and sets up the backend

echo "🚀 Starting Backend Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Navigate to backend
cd backend || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build backend
echo "🔨 Building backend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build backend"
    exit 1
fi

echo "✅ Backend built successfully"
echo ""

# Create admin user
echo "👤 Creating admin user..."
node create-admin-user.js

if [ $? -ne 0 ]; then
    echo "❌ Failed to create admin user"
    exit 1
fi

echo ""
echo "✨ Backend setup completed successfully!"
echo ""
echo "🚀 To start the backend, run:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "📝 In another terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "🌐 Open http://localhost:5173 in your browser"
echo "🔐 Login with:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
