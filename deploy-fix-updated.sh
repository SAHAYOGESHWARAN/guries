#!/bin/bash

# Deploy Fix Script for Module Initialization Error
# This script fixes the build error and deploys to Vercel

echo "🚀 Starting deployment fix..."
echo ""

# Step 1: Clean frontend dependencies
echo "📦 Step 1: Cleaning frontend dependencies..."
cd frontend
rm -rf node_modules package-lock.json dist
echo "✅ Cleaned"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 3: Build locally
echo "🔨 Step 3: Building locally..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Step 4: Deploy to Vercel
echo "🚀 Step 4: Deploying to Vercel..."
cd ..
vercel --prod
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi
echo "✅ Deployment successful"
echo ""

echo "🎉 All done! Your application is deployed."
