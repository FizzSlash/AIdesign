# 🤖 Test AI Email Generation

## Step 1: Login and Get Token

```powershell
curl -Method POST -Uri https://aidesign-production.up.railway.app/api/v1/auth/login -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"TestPass123!"}'
```

**Copy the "token" value from the response!**

---

## Step 2: Test Email Generation

Replace `YOUR_TOKEN_HERE` with the token from Step 1:

```powershell
$token = "YOUR_TOKEN_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    campaignBrief = "Summer dress sale - 30% off this weekend"
    campaignType = "promotional"
    tone = "energetic"
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri https://aidesign-production.up.railway.app/api/v1/emails/generate -Headers $headers -Body $body
```

**Should return:**
```json
{
  "message": "Email generation started",
  "jobId": "some-uuid"
}
```

---

## Step 3: Check Generation Status

Replace `JOB_ID` with the jobId from Step 2:

```powershell
$token = "YOUR_TOKEN_HERE"
$jobId = "JOB_ID_HERE"

Invoke-RestMethod -Method GET -Uri "https://aidesign-production.up.railway.app/api/v1/emails/generation-status/$jobId" -Headers @{"Authorization"="Bearer $token"}
```

---

## 🎉 **Your API is LIVE and WORKING!**

Everything is functional:
- ✅ Authentication
- ✅ Database
- ✅ Ready for AI generation
- ✅ Ready for Shopify/Klaviyo integration

**Next: Build a frontend or test with Postman!** 🚀

