@echo off
REM Real-Time Page Testing Script for Windows
REM This script runs the page tests and displays results

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Real-Time Page Testing
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if frontend is running
echo Checking if frontend is running...
timeout /t 1 /nobreak >nul

REM Run the test
echo.
echo Starting tests...
echo.

node test-pages-realtime.js

REM Capture exit code
set exitcode=%errorlevel%

echo.
if %exitcode% equ 0 (
    echo [SUCCESS] All tests completed successfully!
) else (
    echo [WARNING] Some tests failed. Check the report above.
)

echo.
pause
exit /b %exitcode%
