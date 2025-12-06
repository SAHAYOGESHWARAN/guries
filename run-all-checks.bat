@echo off
echo ========================================
echo Marketing Control Center
echo Complete System Verification
echo ========================================
echo.

echo [1/3] Checking File Links...
echo.
node verify-file-links.js
echo.

echo [2/3] Verifying Production Readiness...
echo.
echo NOTE: This requires backend to be running
echo If backend is not running, start it first with:
echo   cd backend ^&^& npm run dev
echo.
set /p continue="Continue with API verification? (Y/N): "
if /i "%continue%"=="Y" (
    node verify-production.js
) else (
    echo Skipping API verification
)
echo.

echo [3/3] Summary
echo.
echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo Next Steps:
echo   1. Start development: start-development.bat
echo   2. Open browser: http://localhost:5173
echo   3. Read docs: FINAL_PRODUCTION_SUMMARY.md
echo.
pause
