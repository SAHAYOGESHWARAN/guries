$url = "https://guries-sahayogeshwarans-projects.vercel.app"

Write-Host "Testing Vercel Deployment..."
Write-Host "URL: $url"
Write-Host ""

# Test API endpoint
Write-Host "Testing API endpoint..."
try {
    $response = Invoke-WebRequest -Uri "$url/api/v1/assets" -Method GET -ErrorAction Stop
    Write-Host "✓ API endpoint is working (Status: $($response.StatusCode))"
    Write-Host "Response preview:"
    $response.Content | ConvertFrom-Json | Select-Object -First 1 | Format-List
} catch {
    Write-Host "✗ API endpoint failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Testing login endpoint..."
try {
    $loginData = @{
        email = "admin@example.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$url/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ Login endpoint is working (Status: $($response.StatusCode))"
    $loginResponse = $response.Content | ConvertFrom-Json
    Write-Host "Login successful: $($loginResponse.user.email)"
    Write-Host "Token: $($loginResponse.token.Substring(0, 20))..."
} catch {
    Write-Host "✗ Login endpoint failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Deployment test complete!"
