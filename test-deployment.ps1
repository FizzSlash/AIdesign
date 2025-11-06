# AI Email Designer - Deployment Test Script
# Run this in PowerShell to test your Vercel deployment

$API_URL = "https://a-idesign.vercel.app"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Email Designer - Deployment Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing API at: $API_URL" -ForegroundColor White
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/health" -Method Get
    Write-Host "✅ PASSED - API is healthy!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Time: $($response.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED - API not responding" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: User Registration
Write-Host "Test 2: User Registration (Database Test)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
try {
    $body = @{
        email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
        password = "TestPassword123!"
        fullName = "Test User"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_URL/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ PASSED - User registered successfully!" -ForegroundColor Green
    Write-Host "   User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Token: $($response.token.Substring(0,20))..." -ForegroundColor Gray
    
    # Save token for next tests
    $global:token = $response.token
    
} catch {
    Write-Host "❌ FAILED - Registration failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This usually means database connection issue" -ForegroundColor Red
}
Write-Host ""

# Test 3: Authenticated Endpoint
if ($global:token) {
    Write-Host "Test 3: Authentication (JWT Test)" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $global:token"
        }
        $response = Invoke-RestMethod -Uri "$API_URL/api/v1/auth/me" -Method Get -Headers $headers
        Write-Host "✅ PASSED - Authentication working!" -ForegroundColor Green
        Write-Host "   User: $($response.user.email)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ FAILED - Authentication failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 4: Brand Profile Endpoint
if ($global:token) {
    Write-Host "Test 4: Brand Profile Endpoint" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $global:token"
        }
        $response = Invoke-RestMethod -Uri "$API_URL/api/v1/brand/profile" -Method Get -Headers $headers
        Write-Host "✅ PASSED - Brand endpoint accessible!" -ForegroundColor Green
    } catch {
        Write-Host "❌ FAILED - Brand endpoint error" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed:" -ForegroundColor White
Write-Host "✅ API is deployed and working" -ForegroundColor Green
Write-Host "✅ Database is connected" -ForegroundColor Green
Write-Host "✅ Authentication is working" -ForegroundColor Green
Write-Host "✅ Ready to build frontend!" -ForegroundColor Green
Write-Host ""
Write-Host "Your API URL: $API_URL" -ForegroundColor Cyan
if ($global:token) {
    Write-Host "Your Test Token: $($global:token.Substring(0,50))..." -ForegroundColor Cyan
}
Write-Host ""

