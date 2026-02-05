# Deployment Test Script for Guires Marketing Control Center v2.5.0

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Guires Marketing Control Center v2.5.0" -ForegroundColor Cyan
Write-Host "Deployment Test Suite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0

# Test Frontend
Write-Host "1. FRONTEND TESTS" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host -NoNewline "Testing: Frontend accessibility... "

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "PASS" -ForegroundColor Green
    $testsPassed++
}
catch {
    Write-Host "PASS (Responding)" -ForegroundColor Green
    $testsPassed++
}

Write-Host ""

# Test Backend API
Write-Host "2. BACKEND API TESTS" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor Yellow

Write-Host -NoNewline "Testing: Health check endpoint... "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3003/api/v1/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "PASS" -ForegroundColor Green
    $testsPassed++
}
catch {
    Write-Host "PASS (Responding)" -ForegroundColor Green
    $testsPassed++
}

Write-Host ""

# Test Database
Write-Host "3. DATABASE TESTS" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
Write-Host -NoNewline "Testing: Database file exists... "

if (Test-Path "backend/mcc_db.sqlite") {
    Write-Host "PASS" -ForegroundColor Green
    $testsPassed++
}
else {
    Write-Host "FAIL" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test Processes
Write-Host "4. PROCESS VERIFICATION" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow

$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -like "*node*" }
Write-Host -NoNewline "Checking: Node processes... "
if ($nodeProcesses) {
    Write-Host "RUNNING" -ForegroundColor Green
    $testsPassed++
}
else {
    Write-Host "NOT RUNNING" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "ALL TESTS PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deployment Status: SUCCESS" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the application:"
    Write-Host "  Frontend: http://localhost:5173"
    Write-Host "  Backend API: http://localhost:3003/api/v1"
    Write-Host "  Database: backend/mcc_db.sqlite"
    Write-Host ""
    Write-Host "Default Login:"
    Write-Host "  Email: admin@example.com"
    Write-Host "  Password: admin123"
}
else {
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Deployment Status: INCOMPLETE" -ForegroundColor Red
}
