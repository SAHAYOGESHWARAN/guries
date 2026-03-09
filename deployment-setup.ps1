# deployment-setup.ps1
# Quick setup script for Supabase + Vercel deployment (PowerShell)
# Usage: .\deployment-setup.ps1

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Marketing Control Center Deployment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install git first." -ForegroundColor Red
    exit 1
}

# Step 1: Commit changes
Write-Host "📝 Step 1: Preparing repository..." -ForegroundColor Yellow

git add .
git commit -m "Production deployment - Supabase + Vercel"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repository committed and pushed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Repository already up to date or no changes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  RUN SUPABASE MIGRATIONS" -ForegroundColor Green
Write-Host "   - Go to: https://app.supabase.com" -ForegroundColor White
Write-Host "   - Select project: dsglniwrrkylniphwygc" -ForegroundColor White
Write-Host "   - SQL Editor → New Query" -ForegroundColor White
Write-Host "   - Paste content of: backend/migrations/postgres-complete-schema.sql" -ForegroundColor White
Write-Host "   - Click RUN" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  GET SUPABASE CREDENTIALS" -ForegroundColor Green
Write-Host "   - Project settings: https://app.supabase.com" -ForegroundColor White
Write-Host "   - Settings → Database → Copy connection string" -ForegroundColor White
Write-Host "   - Settings → API → Copy Anon Key & Service Role Key" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  CREATE VERCEL PROJECT" -ForegroundColor Green
Write-Host "   - Go to: https://vercel.com/new" -ForegroundColor White
Write-Host "   - Import GitHub repository: guires-marketing-control-center" -ForegroundColor White
Write-Host "   - Configure settings (should auto-detect)" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  SET VERCEL ENVIRONMENT VARIABLES" -ForegroundColor Green
Write-Host "   - Settings → Environment Variables" -ForegroundColor White
Write-Host "   - Add all variables from: backend/.env.production" -ForegroundColor White
Write-Host "   - Update DATABASE_URL with your Supabase connection string" -ForegroundColor White
Write-Host "   - Generate JWT_SECRET:" -ForegroundColor White
$jwtSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Write-Host "   - JWT_SECRET: $jwtSecret" -ForegroundColor Yellow
Write-Host ""

Write-Host "5️⃣  DEPLOY" -ForegroundColor Green
Write-Host "   - Click Deploy button" -ForegroundColor White
Write-Host "   - Wait for completion (2-3 minutes)" -ForegroundColor White
Write-Host "   - Get your Vercel URL" -ForegroundColor White
Write-Host ""

Write-Host "6️⃣  UPDATE CORS VARIABLES" -ForegroundColor Green
Write-Host "   - Update FRONTEND_URL, CORS_ORIGIN, CORS_ORIGINS" -ForegroundColor White
Write-Host "   - Use your Vercel URL" -ForegroundColor White
Write-Host "   - Trigger Redeploy" -ForegroundColor White
Write-Host ""

Write-Host "7️⃣  TEST DEPLOYMENT" -ForegroundColor Green
Write-Host "   - Health: curl https://your-url.vercel.app/api/v1/health" -ForegroundColor White
Write-Host "   - Login: POST /api/v1/auth/login" -ForegroundColor White
Write-Host "   - Assets: GET /api/v1/assets" -ForegroundColor White
Write-Host ""

Write-Host "✅ Setup script complete!" -ForegroundColor Green
Write-Host "📖 Read DEPLOYMENT_GUIDE_SUPABASE_VERCEL.md for detailed instructions" -ForegroundColor Cyan
