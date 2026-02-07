#!/bin/bash

# Build script for Vercel deployment
# This script builds both backend and frontend

set -e

echo "🔨 Starting build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps

# Build backend
echo "🔨 Building backend..."
cd backend
npm install --legacy-peer-deps
npm run build
cd ..

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

echo "✅ Build completed successfully!"
