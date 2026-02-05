#!/bin/bash
set -e

echo "🔨 Building Guries Marketing Control Center for Production..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

echo "✅ Build complete!"
echo "Frontend dist ready at: frontend/dist/"
