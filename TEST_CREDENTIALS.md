# 🧪 Test Credentials & API Access

## 🌐 **Production URL**

**Railway Deployment:**
```
https://aidesign-production.up.railway.app
```

---

## 🔑 **Test Account Credentials**

### **Option 1: Create Your Own Test Account**

```bash
# Register a new test account
curl -X POST https://aidesign-production.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Response will include:
# {
#   "user": { ... },
#   "token": "eyJhbGc...",  ← Save this!
#   "refreshToken": "..."
# }
```

### **Option 2: Use Existing Test Account**

If you want to use the same test account:
```
Email: test@test.com
Password: test123
```

**Login:**
```bash
curl -X POST https://aidesign-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }'

# Save the token from response
```

---

## ✅ **Quick Test (5 Minutes)**

### **Step 1: Health Check**

```bash
# Check if server is running
curl https://aidesign-production.up.railway.app/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **Step 2: Register/Login**

```bash
# Register new user
curl -X POST https://aidesign-production.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@example.com",
    "password": "yourpassword",
    "fullName": "Your Name"
  }'

# Copy the token from response
export TOKEN="paste-your-token-here"
```

---

### **Step 3: Test Enhanced Brand Analysis**

```bash
# Start brand analysis
curl -X POST https://aidesign-production.up.railway.app/api/v1/brand/analyze-enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://www.lysse.com"}'

# Response:
# {
#   "success": true,
#   "jobId": "uuid-here",
#   "message": "Brand analysis started. This will take 2-5 minutes."
# }

# Save the jobId
export JOB_ID="paste-job-id-here"
```

---

### **Step 4: Check Analysis Status**

```bash
# Wait 3 minutes, then check status
sleep 180

curl -X GET https://aidesign-production.up.railway.app/api/v1/brand/analysis/$JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### **Step 5: Get Brand Summary**

```bash
# Get the analyzed brand profile
curl -X GET https://aidesign-production.up.railway.app/api/v1/brand/summary \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Output:**
```json
{
  "success": true,
  "summary": {
    "brandName": "Lysse",
    "personality": {
      "tone": "luxury",
      "description": "Sophisticated and refined...",
      "adjectives": ["elegant", "sophisticated", "timeless"]
    },
    "visualStyle": {
      "layout": "minimal",
      "imageStyle": "lifestyle",
      "overlayStyle": "dark"
    },
    "messaging": {
      "ctaStyle": "benefit",
      "urgency": "low",
      "emojiUsage": "minimal",
      "commonCTAs": ["Discover More", "Shop the Collection"]
    },
    "colors": {
      "primary": "#000000",
      "secondary": "#666666",
      "accent": "#0066cc"
    }
  }
}
```

---

## 🔗 **All API Endpoints**

### **Base URL:**
```
https://aidesign-production.up.railway.app/api/v1
```

### **Authentication:**
```
POST   /auth/register
POST   /auth/login
GET    /auth/me
POST   /auth/refresh-token
POST   /auth/logout
```

### **Enhanced Brand Profile (NEW!):**
```
POST   /brand/analyze-enhanced
GET    /brand/analysis/:jobId
GET    /brand/profile
GET    /brand/summary
PATCH  /brand/profile
POST   /brand/examples
```

### **Shopify:**
```
POST   /shopify/connect
GET    /shopify/products
POST   /shopify/sync
```

### **Klaviyo:**
```
POST   /klaviyo/connect
GET    /klaviyo/status
POST   /klaviyo/push-template
```

### **Email Generation:**
```
POST   /emails/generate
GET    /emails
GET    /emails/:id
```

---

## 🧪 **Using Postman/Insomnia**

### **1. Import Collection**

Create a new collection with:
- **Base URL:** `https://aidesign-production.up.railway.app`
- **Authorization:** Bearer Token (add after login)

### **2. Test Sequence**

1. **Register** → `POST /api/v1/auth/register`
2. **Save Token** → Copy from response
3. **Analyze Brand** → `POST /api/v1/brand/analyze-enhanced`
4. **Wait 3 min** → ⏰
5. **Check Status** → `GET /api/v1/brand/analysis/:jobId`
6. **Get Summary** → `GET /api/v1/brand/summary`

---

## 📊 **Test Different Brands**

Try analyzing different types of brands:

### **Luxury Brand:**
```json
{"websiteUrl": "https://www.lysse.com"}
```
Expected: `tone: "luxury"`, `formality: 4-5`

### **Casual Brand:**
```json
{"websiteUrl": "https://www.patagonia.com"}
```
Expected: `tone: "casual"`, `emoji: "moderate"`

### **Professional Brand:**
```json
{"websiteUrl": "https://www.salesforce.com"}
```
Expected: `tone: "professional"`, `formality: 4`

---

## 🐛 **Troubleshooting**

### **"Unauthorized" Error**
```bash
# Your token expired or is invalid
# Login again to get a new token
curl -X POST https://aidesign-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

### **"Analysis failed"**
- Check Railway logs for details
- Try a different website
- Website might be blocking scraping

### **"Brand profile not found"**
- Wait for analysis to complete (2-5 minutes)
- Check status with `/brand/analysis/:jobId`

---

## 🎯 **Quick Copy-Paste Test**

```bash
# 1. Register
TOKEN=$(curl -s -X POST https://aidesign-production.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test'$(date +%s)'@example.com","password":"test123","fullName":"Test"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. Start analysis
JOB_ID=$(curl -s -X POST https://aidesign-production.up.railway.app/api/v1/brand/analyze-enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl":"https://www.lysse.com"}' \
  | grep -o '"jobId":"[^"]*' | cut -d'"' -f4)

echo "Job ID: $JOB_ID"
echo "Waiting 3 minutes for analysis..."

# 3. Wait and check
sleep 180

# 4. Get summary
curl -X GET https://aidesign-production.up.railway.app/api/v1/brand/summary \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 **Browser Testing**

### **Health Check:**
Open in browser:
```
https://aidesign-production.up.railway.app/health
```

### **API Documentation:**
Coming soon - Swagger/OpenAPI docs

---

## 🔐 **Security Notes**

- ✅ All passwords are hashed (bcrypt)
- ✅ API keys are encrypted (AES-256-GCM)
- ✅ JWT tokens expire after 24 hours
- ✅ Rate limiting enabled (100 requests per 15 min)
- ✅ HTTPS only in production

---

## 🎉 **You're Ready!**

**Production URL:**
```
https://aidesign-production.up.railway.app
```

**Test it now:**
```bash
curl https://aidesign-production.up.railway.app/health
```

**Questions?** Check the other documentation files or Railway logs! 🚀

