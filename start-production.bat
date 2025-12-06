@echo off
echo ========================================
echo Marketing Control Center - Production
echo ========================================
echo.

echo [1/4] Checking environment...
if not exist "backend\.env" (
    echo WARNING: backend\.env not found!
    echo Please copy backend\.env.example to backend\.env
    pause
    exit /b 1
)

echo [2/4] Starting Backend Server...
start "MCC Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Frontend Server...
start "MCC Frontend" cmd /k "npm run preview"
timeout /t 3 /nobreak >nul

echo [4/4] Opening Browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo   Marketing Control Center Started!
echo ========================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo   Health:   http://localhost:3001/health
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /FI "WINDOWTITLE eq MCC Backend*" /T /F
taskkill /FI "WINDOWTITLE eq MCC Frontend*" /T /F
