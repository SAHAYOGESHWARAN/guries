@echo off
REM Admin User Setup Script for Windows
REM This script creates the admin user in the database

echo.
echo 🚀 Starting Admin User Setup...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Run the admin creation script
echo 📝 Creating admin user...
node create-admin-user.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✨ Admin setup completed successfully!
    echo.
    echo 🔐 You can now login with:
    echo    Email: admin@example.com
    echo    Password: admin123
    echo.
    echo ⚠️  IMPORTANT: Change this password after first login!
) else (
    echo.
    echo ❌ Admin setup failed. Please check the error above.
    pause
    exit /b 1
)

pause
