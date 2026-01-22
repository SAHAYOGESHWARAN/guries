#!/bin/bash

# Admin User Setup Script
# This script creates the admin user in the database

echo "🚀 Starting Admin User Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Run the admin creation script
echo "📝 Creating admin user..."
node create-admin-user.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✨ Admin setup completed successfully!"
    echo ""
    echo "🔐 You can now login with:"
    echo "   Email: admin@example.com"
    echo "   Password: admin123"
    echo ""
    echo "⚠️  IMPORTANT: Change this password after first login!"
else
    echo ""
    echo "❌ Admin setup failed. Please check the error above."
    exit 1
fi
