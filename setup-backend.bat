@echo off
REM Backend Setup Script for Windows

echo.
echo 🚀 Starting Backend Setup...
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

REM Navigate to backend
cd backend
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to navigate to backend directory
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Build backend
echo 🔨 Building backend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build backend
    pause
    exit /b 1
)

echo ✅ Backend built successfully
echo.

REM Create admin user
echo 👤 Creating admin user...
node create-admin-user.js

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to create admin user
    pause
    exit /b 1
)

echo.
echo ✨ Backend setup completed successfully!
echo.
echo 🚀 To start the backend, run:
echo    cd backend
echo    npm start
echo.
echo 📝 In another terminal, start the frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 🌐 Open http://localhost:5173 in your browser
echo 🔐 Login with:
echo    Email: admin@example.com
echo    Password: admin123
echo.
pause
