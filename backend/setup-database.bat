@echo off
REM Database Setup Script for Windows
REM This script runs all necessary migrations to set up the database

echo.
echo 🚀 Starting Database Setup...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Run migrations
echo 📋 Running migrations...
echo.

REM Create missing master tables
echo 1️⃣  Creating missing master tables...
node backend/create-missing-master-tables-migration.js
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to create master tables
    pause
    exit /b 1
)

echo.
echo ✨ Database setup completed successfully!
echo.
echo 📊 Summary:
echo    ✅ asset_category_master table created
echo    ✅ asset_type_master table created
echo    ✅ Default data inserted
echo.
echo 🎯 Next steps:
echo    1. Start the backend server: npm start
echo    2. Start the frontend: npm start (in frontend directory)
echo    3. Open http://localhost:3000 in your browser
echo.
pause
