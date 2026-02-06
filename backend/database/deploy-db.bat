@echo off
REM Vercel PostgreSQL Database Deployment Script for Windows
REM Run this after deploying to Vercel to initialize the database

setlocal enabledelayedexpansion

echo 🚀 Starting Vercel Database Deployment...
echo ==========================================

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
  echo ❌ ERROR: DATABASE_URL environment variable not set
  echo Please set DATABASE_URL in your Vercel environment variables
  exit /b 1
)

echo ✅ DATABASE_URL found
echo 🔄 Initializing database schema...

REM Run the initialization script
npx ts-node backend/database/init-vercel-db.ts

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ Database deployment completed successfully!
  echo 📊 All tables and indexes are ready
  echo.
  echo Next steps:
  echo 1. Verify data is persisting by creating a test asset
  echo 2. Check Supabase dashboard for table creation
  echo 3. Monitor logs for any connection issues
) else (
  echo ❌ Database deployment failed
  exit /b 1
)
