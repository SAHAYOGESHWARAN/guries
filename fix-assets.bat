@echo off
echo ========================================
echo Asset System Fix
echo ========================================
echo.

echo This will add the assets table to your database.
echo.
echo Database: mcc_db
echo User: postgres
echo.
set /p continue="Continue? (Y/N): "

if /i not "%continue%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Adding assets table...
psql -U postgres -d mcc_db -f add-assets-table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Assets table added.
    echo ========================================
    echo.
    echo Next steps:
    echo   1. Restart backend: cd backend ^&^& npm run dev
    echo   2. Open frontend: http://localhost:5173
    echo   3. Navigate to Assets page
    echo   4. Test upload functionality
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR! Failed to add assets table.
    echo ========================================
    echo.
    echo Please check:
    echo   1. PostgreSQL is running
    echo   2. Database 'mcc_db' exists
    echo   3. User 'postgres' has permissions
    echo.
)

pause
