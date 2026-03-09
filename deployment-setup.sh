#!/bin/bash
# deployment-setup.sh
# Quick setup script for Supabase + Vercel deployment
# Usage: bash deployment-setup.sh

echo "==================================="
echo "Marketing Control Center Deployment"
echo "==================================="
echo ""

# Check if we have git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Step 1: Commit changes
echo "📝 Step 1: Preparing repository..."
git add .
git commit -m "Production deployment - Supabase + Vercel"
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Repository committed and pushed"
else
    echo "⚠️  Repository already up to date or no changes"
fi

echo ""
echo "==================================="
echo "NEXT STEPS:"
echo "==================================="
echo ""
echo "1️⃣  RUN SUPABASE MIGRATIONS"
echo "   - Go to: https://app.supabase.com"
echo "   - Select project: dsglniwrrkylniphwygc"
echo "   - SQL Editor → New Query"
echo "   - Paste content of: backend/migrations/postgres-complete-schema.sql"
echo "   - Click RUN"
echo ""

echo "2️⃣  GET SUPABASE CREDENTIALS"
echo "   - Project settings: https://app.supabase.com"
echo "   - Settings → Database → Copy connection string"
echo "   - Settings → API → Copy Anon Key & Service Role Key"
echo ""

echo "3️⃣  CREATE VERCEL PROJECT"
echo "   - Go to: https://vercel.com/new"
echo "   - Import GitHub repository: guires-marketing-control-center"
echo "   - Configure settings (should auto-detect)"
echo ""

echo "4️⃣  SET VERCEL ENVIRONMENT VARIABLES"
echo "   - Settings → Environment Variables"
echo "   - Add all variables from: backend/.env.production"
echo "   - Update DATABASE_URL with your Supabase connection string"
echo "   - Generate JWT_SECRET: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""

echo "5️⃣  DEPLOY"
echo "   - Click Deploy button"
echo "   - Wait for completion (2-3 minutes)"
echo "   - Get your Vercel URL"
echo ""

echo "6️⃣  UPDATE CORS VARIABLES"
echo "   - Update FRONTEND_URL, CORS_ORIGIN, CORS_ORIGINS"
echo "   - Use your Vercel URL"
echo "   - Trigger Redeploy"
echo ""

echo "7️⃣  TEST DEPLOYMENT"
echo "   - Health: curl https://your-url.vercel.app/api/v1/health"
echo "   - Login: POST /api/v1/auth/login"
echo "   - Assets: GET /api/v1/assets"
echo ""

echo "✅ Setup script complete!"
echo "📖 Read DEPLOYMENT_GUIDE_SUPABASE_VERCEL.md for detailed instructions"
