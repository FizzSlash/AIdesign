# 🚀 Quick Start: Enhanced Brand Profile

## 5-Minute Setup

### Step 1: Run Migration (30 seconds)

```bash
# If using Railway/Heroku
psql $DATABASE_URL < src/db/migrations/002_enhanced_brand_profile.sql

# If using local database
psql ai_email_designer < src/db/migrations/002_enhanced_brand_profile.sql
```

**Expected output:**
```
ALTER TABLE
ALTER TABLE
ALTER TABLE
...
CREATE INDEX
COMMENT
```

### Step 2: Start Server (10 seconds)

```bash
npm run dev
```

**Expected output:**
```
Server running on port 3000
Database connected
```

### Step 3: Test It! (3 minutes)

**Option A: Using curl (Terminal)**

```bash
# 1. Register (save the token!)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Copy the token from response, then:
export TOKEN="paste-token-here"

# 2. Start brand analysis
curl -X POST http://localhost:3000/api/v1/brand/analyze-enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://www.lysse.com"}'

# Copy the jobId from response, then:
export JOB_ID="paste-job-id-here"

# 3. Wait 3 minutes, then check status
sleep 180
curl -X GET http://localhost:3000/api/v1/brand/analysis/$JOB_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Get the profile
curl -X GET http://localhost:3000/api/v1/brand/summary \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Option B: Using Postman/Insomnia**

1. **POST** `http://localhost:3000/api/v1/auth/register`
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "fullName": "Test User"
   }
   ```
   → Save the `token`

2. **POST** `http://localhost:3000/api/v1/brand/analyze-enhanced`
   - Header: `Authorization: Bearer YOUR_TOKEN`
   ```json
   {
     "websiteUrl": "https://www.lysse.com"
   }
   ```
   → Save the `jobId`

3. Wait 3 minutes...

4. **GET** `http://localhost:3000/api/v1/brand/analysis/{jobId}`
   - Header: `Authorization: Bearer YOUR_TOKEN`

5. **GET** `http://localhost:3000/api/v1/brand/summary`
   - Header: `Authorization: Bearer YOUR_TOKEN`

---

## ✅ What You Should See

### After Analysis Completes:

```json
{
  "success": true,
  "summary": {
    "brandName": "Lysse",
    "personality": {
      "tone": "luxury",
      "description": "Sophisticated and refined with a focus on quality...",
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

## 🎯 Success Checklist

- [ ] Migration ran without errors
- [ ] Server started successfully
- [ ] User registered and got token
- [ ] Brand analysis started (got jobId)
- [ ] Analysis completed in < 5 minutes
- [ ] Profile data looks accurate
- [ ] Can get summary

---

## 🐛 Troubleshooting

### "Migration failed"
```bash
# Check if you're connected to the right database
psql $DATABASE_URL -c "SELECT current_database();"

# Try running migration again
psql $DATABASE_URL < src/db/migrations/002_enhanced_brand_profile.sql
```

### "Analysis status: failed"
Check server logs for details. Common causes:
- OpenAI API key not set or invalid
- Website blocks scraping
- Timeout (try a faster website)

### "Brand profile not found"
You need to wait for analysis to complete first. Check status:
```bash
curl -X GET http://localhost:3000/api/v1/brand/analysis/$JOB_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Next Steps

Once this works:

1. ✅ **Test with 2-3 different websites**
   - Luxury brand (e.g., Lysse)
   - Casual brand (e.g., streetwear)
   - Professional brand (e.g., B2B)

2. ✅ **Verify AI accuracy**
   - Does tone match the website?
   - Are adjectives accurate?
   - Are CTAs captured correctly?

3. 🔄 **Move to Product Selection** (Days 3-4)
   - Build smart product picker
   - AI explains selections

4. 🔄 **Build Text Overlay** (Days 5-6)
   - Analyze images for text color
   - Generate overlays

5. 🔄 **Generate Emails** (Days 8-9)
   - Use brand profile
   - Create beautiful emails

---

## 🎉 You're Done!

**Days 1-2 Complete:** Enhanced Brand Profile ✅

**What you built:**
- ✅ Deep brand analysis (personality + style + messaging)
- ✅ AI-powered insights
- ✅ 6 API endpoints
- ✅ Full TypeScript service
- ✅ Database migration

**Time invested:** ~2 days  
**Value created:** Core differentiator vs. Backstroke

---

**Ready for Days 3-4?** Let's build Smart Product Selection! 🚀

