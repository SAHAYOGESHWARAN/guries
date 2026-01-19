#!/bin/bash

# Database Setup Script
# This script runs all necessary migrations to set up the database

echo "🚀 Starting Database Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found"
echo ""

# Run migrations
echo "📋 Running migrations..."
echo ""

# Create missing master tables
echo "1️⃣  Creating missing master tables..."
node backend/create-missing-master-tables-migration.js
if [ $? -ne 0 ]; then
    echo "❌ Failed to create master tables"
    exit 1
fi

echo ""
echo "✨ Database setup completed successfully!"
echo ""
echo "📊 Summary:"
echo "   ✅ asset_category_master table created"
echo "   ✅ asset_type_master table created"
echo "   ✅ Default data inserted"
echo ""
echo "🎯 Next steps:"
echo "   1. Start the backend server: npm start"
echo "   2. Start the frontend: npm start (in frontend directory)"
echo "   3. Open http://localhost:3000 in your browser"
