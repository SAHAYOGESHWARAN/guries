@echo off
echo ========================================
echo Marketing Control Center - Backend
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo.
    echo Please create .env file from .env.example:
    echo   1. Copy .env.example to .env
    echo   2. Update database credentials in .env
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
    echo.
)

REM Check if database is setup
echo [INFO] Checking database connection...
node -e "const {pool} = require('./config/db'); pool.query('SELECT 1').then(() => {console.log('[OK] Database connected'); pool.end();}).catch(err => {console.error('[ERROR] Database connection failed:', err.message); process.exit(1);});"

if errorlevel 1 (
    echo.
    echo [ERROR] Database connection failed!
    echo.
    echo Please run database setup:
    echo   node setup-database.js
    echo.
    pause
    exit /b 1
)

echo.
echo [INFO] Starting backend server...
echo.
echo Server will be available at: http://localhost:3001
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm run dev
