#!/bin/bash

# Vercel Deployment Script
# This script deploys the marketing control center to Vercel without 404 errors

echo "🚀 Starting Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building project..."
npm run build:all

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Check the DEPLOYMENT_GUIDE.md for troubleshooting if you encounter any issues."
