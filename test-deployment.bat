@echo off
REM Deployment Testing Script for Windows
REM Tests all critical functionality after deployment to Vercel

setlocal enabledelayedexpansion

REM Configuration
set APP_URL=%1
if "!APP_URL!"=="" set APP_URL=https://your-app.vercel.app

set ADMIN_EMAIL=admin@example.com
set ADMIN_PASSWORD=admin123

REM Test counters
set TESTS_PASSED=0
set TESTS_FAILED=0

echo.
echo ========================================
echo Deployment Testing Script
echo ========================================
echo.
echo Testing: !APP_URL!
echo.

REM Test 1: Health Check
echo === Test 1: Health Check ===
echo Testing: Health endpoint
for /f %%A in ('powershell -Command "try { $response = Invoke-WebRequest -Uri '!APP_URL!/api/v1/health' -Method GET -ErrorAction Stop; Write-Host $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode.Value }"') do set STATUS=%%A
if "!STATUS!"=="200" (
    echo [PASS] Status: !STATUS!
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Expected: 200, Got: !STATUS!
    set /a TESTS_FAILED+=1
)
echo.

REM Test 2: Get Industry/Sectors
echo === Test 2: Get Industry/Sectors ===
echo Testing: Get all industry/sectors
for /f %%A in ('powershell -Command "try { $response = Invoke-WebRequest -Uri '!APP_URL!/api/v1/industry-sectors' -Method GET -ErrorAction Stop; Write-Host $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode.Value }"') do set STATUS=%%A
if "!STATUS!"=="200" (
    echo [PASS] Status: !STATUS!
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Expected: 200, Got: !STATUS!
    set /a TESTS_FAILED+=1
)
echo.

REM Test 3: Get Content Types
echo === Test 3: Get Content Types ===
echo Testing: Get all content types
for /f %%A in ('powershell -Command "try { $response = Invoke-WebRequest -Uri '!APP_URL!/api/v1/content-types' -Method GET -ErrorAction Stop; Write-Host $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode.Value }"') do set STATUS=%%A
if "!STATUS!"=="200" (
    echo [PASS] Status: !STATUS!
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Expected: 200, Got: !STATUS!
    set /a TESTS_FAILED+=1
)
echo.

REM Test 4: Get Asset Types
echo === Test 4: Get Asset Types ===
echo Testing: Get all asset types
for /f %%A in ('powershell -Command "try { $response = Invoke-WebRequest -Uri '!APP_URL!/api/v1/asset-types' -Method GET -ErrorAction Stop; Write-Host $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode.Value }"') do set STATUS=%%A
if "!STATUS!"=="200" (
    echo [PASS] Status: !STATUS!
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Expected: 200, Got: !STATUS!
    set /a TESTS_FAILED+=1
)
echo.

REM Test 5: Get Asset Categories
echo === Test 5: Get Asset Categories ===
echo Testing: Get all asset categories
for /f %%A in ('powershell -Command "try { $response = Invoke-WebRequest -Uri '!APP_URL!/api/v1/asset-categories' -Method GET -ErrorAction Stop; Write-Host $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode.Value }"') do set STATUS=%%A
if "!STATUS!"=="200" (
    echo [PASS] Status: !STATUS!
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Expected: 200, Got: !STATUS!
    set /a TESTS_FAILED+=1
)
echo.

REM Test 6: Get Asset Formats
echo === Test 6: Get Asset Formats ===
echo Testing: Get all asset formats
for /f %%A in ('powershell -Command "try { $response = Invoke-WebRequest -Uri '!APP_URL!/api/v1/asset-formats' -Method GET -ErrorAction Stop; Write-Host $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode.Value }"') do set STATUS=%%A
if "!STATUS!"=="200" (
    echo [PASS] Status: !STATUS!
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Expected: 200, Got: !STATUS!
    set /a TESTS_FAILED+=1
)
echo.

REM Test 7: Get Platforms
echo === Test 7: Get Platforms ===
echo Testing: Get all platforms
for /f %%A in ('powershell -Command "try { $response = Invoke-WebRequest -Uri '!APP_URL!/api/v1/platforms' -Method GET -ErrorAction Stop; Write-Host $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode.Value }"') do set STATUS=%%A
if "!STATUS!"=="200" (
    echo [PASS] Status: !STATUS!
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Expected: 200, Got: !STATUS!
    set /a TESTS_FAILED+=1
)
echo.

REM Test 8: Get Countries
echo === Test 8: Get Countries ===
echo Testing: Get all countries
for /f %%A in ('powershell -Command "try { $response = Invoke-WebRequest -Uri '!APP_URL!/api/v1/countries' -Method GET -ErrorAction Stop; Write-Host $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode.Value }"') do set STATUS=%%A
if "!STATUS!"=="200" (
    echo [PASS] Status: !STATUS!
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Expected: 200, Got: !STATUS!
    set /a TESTS_FAILED+=1
)
echo.

REM Test 9: Frontend Load
echo === Test 9: Frontend Load ===
echo Testing: Frontend loads successfully
for /f %%A in ('powershell -Command "try { $response = Invoke-WebRequest -Uri '!APP_URL!/' -Method GET -ErrorAction Stop; Write-Host $response.StatusCode } catch { Write-Host $_.Exception.Response.StatusCode.Value }"') do set STATUS=%%A
if "!STATUS!"=="200" (
    echo [PASS] Status: !STATUS!
    set /a TESTS_PASSED+=1
) else (
    echo [FAIL] Expected: 200, Got: !STATUS!
    set /a TESTS_FAILED+=1
)
echo.

REM Summary
echo ========================================
echo Test Summary
echo ========================================
echo Passed: !TESTS_PASSED!
echo Failed: !TESTS_FAILED!
echo.

if !TESTS_FAILED! equ 0 (
    echo [SUCCESS] All tests passed!
    exit /b 0
) else (
    echo [FAILURE] Some tests failed!
    exit /b 1
)
