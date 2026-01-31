@echo off
REM Production Deployment Setup Script for Windows
REM Run this on the deployment server to initialize the database

echo.
echo 🚀 Starting production deployment setup...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Initialize production database
echo 🗄️  Initializing production database...
call node init-production-db.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database initialization completed!
    echo.
    echo 📝 Next steps:
    echo    1. Verify database file exists: dir mcc_db.sqlite
    echo    2. Start the backend server: npm run dev
    echo    3. Test API endpoints
    echo.
    echo 🎉 Deployment setup complete!
) else (
    echo.
    echo ❌ Database initialization failed!
    exit /b 1
)
