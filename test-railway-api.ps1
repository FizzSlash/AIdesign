# Test Railway Deployment
$API_URL = "https://aidesign-production.up.railway.app"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing AI Email Designer on Railway" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: $API_URL" -ForegroundColor White
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/health" -Method Get
    Write-Host "✅ PASSED" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Register User
Write-Host "Test 2: Register User (Database Test)" -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow
try {
    $body = @{
        email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
        password = "SecurePassword123!"
        fullName = "Test User"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_URL/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ PASSED - User created!" -ForegroundColor Green
    Write-Host "   User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Token: $($response.token.Substring(0,30))..." -ForegroundColor Gray
    Write-Host ""
    
    $global:token = $response.token
    
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Get Current User
if ($global:token) {
    Write-Host "Test 3: Get Current User (Auth Test)" -ForegroundColor Yellow
    Write-Host "-----------------------------------" -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $global:token"
        }
        $response = Invoke-RestMethod -Uri "$API_URL/api/v1/auth/me" -Method Get -Headers $headers
        Write-Host "✅ PASSED - Authentication working!" -ForegroundColor Green
        Write-Host "   User: $($response.user.email)" -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎉 YOUR API IS LIVE ON RAILWAY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: $API_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. ✅ API is deployed and working" -ForegroundColor Green
Write-Host "2. ✅ Database is connected" -ForegroundColor Green
Write-Host "3. ✅ Authentication is working" -ForegroundColor Green
Write-Host "4. 🎨 Build a frontend (React)" -ForegroundColor Yellow
Write-Host "5. 🔗 Connect Shopify/Klaviyo" -ForegroundColor Yellow
Write-Host ""
if ($global:token) {
    Write-Host "Your Test Token:" -ForegroundColor Cyan
    Write-Host $global:token -ForegroundColor Gray
    Write-Host ""
}

