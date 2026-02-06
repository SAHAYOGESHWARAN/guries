#!/bin/bash

# Vercel PostgreSQL Database Deployment Script
# Run this after deploying to Vercel to initialize the database

set -e

echo "🚀 Starting Vercel Database Deployment..."
echo "=========================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo "Please set DATABASE_URL in your Vercel environment variables"
  exit 1
fi

echo "✅ DATABASE_URL found"
echo "🔄 Initializing database schema..."

# Run the initialization script
npx ts-node backend/database/init-vercel-db.ts

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Database deployment completed successfully!"
  echo "📊 All tables and indexes are ready"
  echo ""
  echo "Next steps:"
  echo "1. Verify data is persisting by creating a test asset"
  echo "2. Check Supabase dashboard for table creation"
  echo "3. Monitor logs for any connection issues"
else
  echo "❌ Database deployment failed"
  exit 1
fi
