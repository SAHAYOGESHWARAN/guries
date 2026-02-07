# Quick Database Verification Test Script (PowerShell)
# Run this to verify all database functionality

$BaseUrl = "https://guries.vercel.app"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ResultsFile = "test_results_$Timestamp.txt"

function Write-TestResult {
    param([string]$Message)
    Write-Host $Message
    Add-Content -Path $ResultsFile -Value $Message
}

# Initialize results file
Write-TestResult "=== Database Verification Test Suite ==="
Write-TestResult "Started: $(Get-Date)"
Write-TestResult ""

# Test 1: Health Check
Write-TestResult "Test 1: Health Check"
Write-TestResult "---"
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get
    Write-TestResult ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-TestResult "FAILED: $($_.Exception.Message)"
}
Write-TestResult ""

# Test 2: Connection
Write-TestResult "Test 2: Database Connection"
Write-TestResult "---"
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/test-endpoints?test=connection" -Method Get
    Write-TestResult ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-TestResult "FAILED: $($_.Exception.Message)"
}
Write-TestResult ""

# Test 3: Create Asset
Write-TestResult "Test 3: Create Asset"
Write-TestResult "---"
try {
    $body = @{
        asset_name = "Test Asset $(Get-Date -Format 'yyyyMMddHHmmss')"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/test-endpoints?test=create-asset" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    Write-TestResult ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-TestResult "FAILED: $($_.Exception.Message)"
}
Write-TestResult ""

# Test 4: Read Assets
Write-TestResult "Test 4: Read Assets"
Write-TestResult "---"
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/test-endpoints?test=read-assets" -Method Get
    Write-TestResult ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-TestResult "FAILED: $($_.Exception.Message)"
}
Write-TestResult ""

# Test 5: Persistence
Write-TestResult "Test 5: Data Persistence"
Write-TestResult "---"
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/test-endpoints?test=persistence" -Method Get
    Write-TestResult ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-TestResult "FAILED: $($_.Exception.Message)"
}
Write-TestResult ""

# Test 6: Schema Validation
Write-TestResult "Test 6: Schema Validation"
Write-TestResult "---"
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/test-endpoints?test=schema" -Method Get
    Write-TestResult ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-TestResult "FAILED: $($_.Exception.Message)"
}
Write-TestResult ""

# Test 7: Performance
Write-TestResult "Test 7: Performance Test"
Write-TestResult "---"
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/test-endpoints?test=performance" -Method Post
    Write-TestResult ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-TestResult "FAILED: $($_.Exception.Message)"
}
Write-TestResult ""

# Summary
Write-TestResult "=== Test Suite Complete ==="
Write-TestResult "Completed: $(Get-Date)"
Write-TestResult "Results saved to: $ResultsFile"

Write-Host "`nResults saved to: $ResultsFile"
