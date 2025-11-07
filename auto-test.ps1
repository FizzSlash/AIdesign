# Automated Testing Script
$API_URL = "https://aidesign-production.up.railway.app"
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZDY4NTE3Ny0zZDBhLTQzMDUtODRiMC1jMGZiYmNjY2U5YzQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWJzY3JpcHRpb25UaWVyIjoiZnJlZSIsImlhdCI6MTc2MjQ3MTQ4NSwiZXhwIjoxNzYzMDc2Mjg1fQ.ZxKFiiDCNZEL5cUUqePXB1TmH37lFUHNjOZI_o5hZgg"

Write-Host ""
Write-Host "🤖 AI Email Designer - Auto Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Wait for deployment
Write-Host "⏰ Waiting 60 seconds for Railway deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Test email generation
Write-Host ""
Write-Host "📧 Generating AI email..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = '{"campaignBrief":"Holiday gift card promotion"}'

try {
    $response = Invoke-RestMethod -Method POST -Uri "$API_URL/api/v1/emails/generate" -Headers $headers -Body $body
    $jobId = $response.jobId
    
    Write-Host "✅ Generation started!" -ForegroundColor Green
    Write-Host "   Job ID: $jobId" -ForegroundColor Gray
    Write-Host ""
    
    # Poll for status
    Write-Host "⏰ Waiting for AI to generate email (30-60 seconds)..." -ForegroundColor Yellow
    Write-Host ""
    
    $maxAttempts = 20
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 5
        $attempt++
        
        try {
            $status = Invoke-RestMethod -Method GET -Uri "$API_URL/api/v1/emails/generation-status/$jobId" -Headers @{"Authorization"=$token}
            
            Write-Host "[$attempt] Status: $($status.status) | Progress: $($status.progress)% | Step: $($status.currentStep)" -ForegroundColor Gray
            
            if ($status.status -eq "completed") {
                Write-Host ""
                Write-Host "🎉 EMAIL GENERATED SUCCESSFULLY!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Email ID: $($status.emailId)" -ForegroundColor Cyan
                Write-Host ""
                
                # Get the email
                $email = Invoke-RestMethod -Method GET -Uri "$API_URL/api/v1/emails/$($status.emailId)" -Headers @{"Authorization"=$token}
                
                Write-Host "Subject: $($email.subject_line)" -ForegroundColor White
                Write-Host "Preview: $($email.preview_text)" -ForegroundColor White
                Write-Host "HTML Length: $($email.html_content.Length) characters" -ForegroundColor White
                Write-Host ""
                Write-Host "✅ YOUR AI EMAIL DESIGNER IS WORKING!" -ForegroundColor Green
                Write-Host ""
                
                break
            }
            
            if ($status.status -eq "failed") {
                Write-Host ""
                Write-Host "❌ Generation failed" -ForegroundColor Red
                Write-Host "   Error: $($status.error)" -ForegroundColor Red
                Write-Host ""
                break
            }
            
        } catch {
            Write-Host "   Checking..." -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ Failed to start generation" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
Write-Host ""

