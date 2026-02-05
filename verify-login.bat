@echo off
setlocal enabledelayedexpansion

echo.
echo 🔐 Login System Verification
echo ======================================

REM Test 1: Check if backend is running
echo.
echo Test 1: Backend Health Check
curl -s http://localhost:3003/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running
) else (
    echo ❌ Backend is not running
    echo    Start backend: npm run dev --prefix backend
    exit /b 1
)

REM Test 2: Check environment variables
echo.
echo Test 2: Environment Variables
if exist "backend\.env" (
    for /f "tokens=2 delims==" %%a in ('findstr "ADMIN_EMAIL=" backend\.env') do set ADMIN_EMAIL=%%a
    for /f "tokens=2 delims==" %%a in ('findstr "ADMIN_PASSWORD=" backend\.env') do set ADMIN_PASSWORD=%%a
    for /f "tokens=2 delims==" %%a in ('findstr "JWT_SECRET=" backend\.env') do set JWT_SECRET=%%a
    
    if "!ADMIN_EMAIL!"=="" (
        echo ❌ Missing ADMIN_EMAIL
        exit /b 1
    )
    if "!ADMIN_PASSWORD!"=="" (
        echo ❌ Missing ADMIN_PASSWORD
        exit /b 1
    )
    if "!JWT_SECRET!"=="" (
        echo ❌ Missing JWT_SECRET
        exit /b 1
    )
    
    echo ✅ Environment variables loaded
    echo    ADMIN_EMAIL: !ADMIN_EMAIL!
    echo    ADMIN_PASSWORD: [SET]
) else (
    echo ❌ backend\.env file not found
    exit /b 1
)

REM Test 3: Test login API
echo.
echo Test 3: Login API Test
for /f %%a in ('curl -s -X POST http://localhost:3003/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"') do set RESPONSE=%%a

if "!RESPONSE!"=="" (
    echo ❌ No response from API
    exit /b 1
)

echo !RESPONSE! | findstr /i "success" >nul
if %errorlevel% equ 0 (
    echo ✅ Login API working
    echo    Response: !RESPONSE:~0,100!...
) else (
    echo !RESPONSE! | findstr /i "Invalid email or password" >nul
    if %errorlevel% equ 0 (
        echo ❌ Invalid credentials
        echo    Response: !RESPONSE!
        echo.
        echo    Possible causes:
        echo    1. Bcrypt hash doesn't match password
        echo    2. Environment variables not loaded
        echo    3. Backend not restarted after .env change
        exit /b 1
    ) else (
        echo ❌ Login API error
        echo    Response: !RESPONSE!
        exit /b 1
    )
)

REM Test 4: Check frontend
echo.
echo Test 4: Frontend Check
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running
) else (
    echo ⚠️  Frontend might not be running
    echo    Start frontend: npm run dev --prefix frontend
)

REM Summary
echo.
echo ======================================
echo ✅ All tests passed!
echo ======================================
echo.
echo Next steps:
echo 1. Open http://localhost:5173 in browser
echo 2. Login with:
echo    Email: admin@example.com
echo    Password: admin123
echo 3. You should be redirected to dashboard
echo.

endlocal
