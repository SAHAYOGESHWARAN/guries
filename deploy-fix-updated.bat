@echo off
REM Deploy Fix Script for Module Initialization Error (Windows)
REM This script fixes the build error and deploys to Vercel

echo.
echo 🚀 Starting deployment fix...
echo.

REM Step 1: Clean frontend dependencies
echo 📦 Step 1: Cleaning frontend dependencies...
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist dist rmdir /s /q dist
echo ✅ Cleaned
echo.

REM Step 2: Install dependencies
echo 📦 Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 3: Build locally
echo 🔨 Step 3: Building locally...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build successful
echo.

REM Step 4: Deploy to Vercel
echo 🚀 Step 4: Deploying to Vercel...
cd ..
call vercel --prod
if errorlevel 1 (
    echo ❌ Deployment failed
    exit /b 1
)
echo ✅ Deployment successful
echo.

echo 🎉 All done! Your application is deployed.
pause
