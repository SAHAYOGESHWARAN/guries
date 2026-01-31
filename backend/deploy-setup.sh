#!/bin/bash

# Production Deployment Setup Script
# Run this on the deployment server to initialize the database

echo "🚀 Starting production deployment setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Initialize production database
echo "🗄️  Initializing production database..."
node init-production-db.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database initialization completed!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Verify database file exists: ls -lh mcc_db.sqlite"
    echo "   2. Start the backend server: npm run dev"
    echo "   3. Test API endpoints"
    echo ""
    echo "🎉 Deployment setup complete!"
else
    echo ""
    echo "❌ Database initialization failed!"
    exit 1
fi
