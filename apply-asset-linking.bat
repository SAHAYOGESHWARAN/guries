@echo off
echo ========================================
echo Asset Library Linking - Database Migration
echo ========================================
echo.
echo This script will add linking columns to the assets table
echo allowing assets to be linked to services and sub-services.
echo.
pause

echo.
echo Running database migration...
echo.

psql -U postgres -d mcc_db -f add-asset-linking-columns.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Restart your backend server: cd backend ^&^& npm run dev
    echo 2. Restart your frontend: npm run dev
    echo 3. Navigate to Service Master ^> Edit a service ^> Linking tab
    echo 4. You should now see assets from the Asset Library
    echo.
) else (
    echo.
    echo ========================================
    echo Migration failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. PostgreSQL is running
    echo 2. Database 'mcc_db' exists
    echo 3. You have the correct permissions
    echo.
)

pause
