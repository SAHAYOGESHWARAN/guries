@echo off
REM Complete Deployment Script for Windows
REM Sets up everything needed for production deployment
REM Usage: deploy-complete.bat

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          Complete Deployment Setup Script                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Step 1: Initialize Database
echo [Step 1] Initializing Database...
if exist "init-production-db.js" (
    node init-production-db.js
    echo ✅ Database initialized
) else (
    echo ❌ init-production-db.js not found
    exit /b 1
)

echo.

REM Step 2: Install Dependencies
echo [Step 2] Installing Dependencies...
call npm install
echo ✅ Dependencies installed

echo.

REM Step 3: Build Backend
echo [Step 3] Building Backend...
call npm run build
echo ✅ Backend built

echo.

REM Step 4: Setup Admin Credentials
echo [Step 4] Setting Up Admin Credentials...
echo.
echo You will now be prompted to enter admin credentials.
echo Press Enter to use default values.
echo.
node setup-admin-credentials.js

echo.

REM Step 5: Verify Setup
echo [Step 5] Verifying Setup...
node verify-qc-fix.js
echo ✅ Verification complete

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          Deployment Setup Complete!                           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Start backend: npm start
echo 2. Build frontend: cd ..\frontend ^&^& npm run build
echo 3. Serve frontend: npm run preview
echo 4. Access application at http://localhost:5174
echo.

endlocal
