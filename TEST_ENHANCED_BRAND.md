# 🧪 Testing Enhanced Brand Profile

## Setup

### 1. Run Database Migration

```bash
# Connect to your database
psql $DATABASE_URL

# Or if using local database
psql ai_email_designer

# Run the migration
\i src/db/migrations/002_enhanced_brand_profile.sql

# Verify columns were added
\d brand_profiles
```

You should see new columns:
- `brand_personality`
- `visual_style`
- `messaging_preferences`
- `example_emails`
- `competitor_urls`
- `target_audience_primary`
- `brand_keywords`

### 2. Start Server

```bash
npm run dev
```

Server should start on `http://localhost:3000`

---

## Test Endpoints

### Step 1: Register/Login

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Save the token from response
export TOKEN="your-jwt-token-here"
```

### Step 2: Start Enhanced Brand Analysis

```bash
# Analyze a website (example: Lysse - from the video)
curl -X POST http://localhost:3000/api/v1/brand/analyze-enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://www.lysse.com"
  }'

# Response:
# {
#   "success": true,
#   "jobId": "uuid-here",
#   "message": "Brand analysis started. This will take 2-5 minutes.",
#   "estimatedTime": "2-5 minutes"
# }

# Save the jobId
export JOB_ID="your-job-id-here"
```

### Step 3: Check Analysis Status

```bash
# Check status (run this every 30 seconds)
curl -X GET http://localhost:3000/api/v1/brand/analysis/$JOB_ID \
  -H "Authorization: Bearer $TOKEN"

# While processing:
# {
#   "status": "processing",
#   "message": "Analysis in progress...",
#   "updatedAt": "2024-01-01T00:00:00.000Z"
# }

# When complete:
# {
#   "status": "completed",
#   "completedAt": "2024-01-01T00:05:00.000Z",
#   "profile": { ... full profile ... }
# }
```

### Step 4: Get Brand Profile

```bash
# Get full profile
curl -X GET http://localhost:3000/api/v1/brand/profile \
  -H "Authorization: Bearer $TOKEN"

# Get friendly summary
curl -X GET http://localhost:3000/api/v1/brand/summary \
  -H "Authorization: Bearer $TOKEN"
```

### Step 5: Update Profile (Optional)

```bash
# Refine the brand profile manually
curl -X PATCH http://localhost:3000/api/v1/brand/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_personality": {
      "tone": "luxury",
      "adjectives": ["elegant", "sophisticated", "timeless"]
    },
    "visual_style": {
      "overlay_style": "dark"
    },
    "messaging_preferences": {
      "cta_style": "benefit",
      "emoji_usage": "minimal"
    },
    "target_audience_primary": "vip"
  }'
```

### Step 6: Add Example Emails

```bash
# Add reference emails you like
curl -X POST http://localhost:3000/api/v1/brand/examples \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/email-screenshot.png",
    "notes": "Love the minimalist hero layout",
    "liked_elements": ["hero layout", "color scheme", "typography"]
  }'
```

---

## Expected Results

### Brand Personality Analysis

```json
{
  "brand_personality": {
    "tone": "luxury",
    "adjectives": ["elegant", "sophisticated", "timeless"],
    "voice_description": "Sophisticated and refined with a focus on quality and craftsmanship",
    "formality_level": 4,
    "example_phrases": [
      "Discover timeless elegance",
      "Crafted with care",
      "Elevate your style"
    ]
  }
}
```

### Visual Style Analysis

```json
{
  "visual_style": {
    "layout_preference": "minimal",
    "image_style": "lifestyle",
    "overlay_style": "dark",
    "spacing": "spacious"
  }
}
```

### Messaging Preferences

```json
{
  "messaging_preferences": {
    "cta_style": "benefit",
    "urgency_level": "low",
    "emoji_usage": "minimal",
    "sentence_length": "medium",
    "common_ctas": [
      "Discover More",
      "Shop the Collection",
      "Explore Now",
      "View Details",
      "Learn More"
    ]
  }
}
```

---

## Testing Different Websites

Try analyzing different types of brands to see how the AI adapts:

### Luxury Brand (e.g., Lysse)
```bash
curl -X POST http://localhost:3000/api/v1/brand/analyze-enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://www.lysse.com"}'
```

Expected: `tone: "luxury"`, `formality_level: 4-5`, `cta_style: "benefit"`

### Casual Brand (e.g., streetwear)
```bash
curl -X POST http://localhost:3000/api/v1/brand/analyze-enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://www.example-streetwear.com"}'
```

Expected: `tone: "casual"`, `formality_level: 1-2`, `emoji_usage: "moderate"`

### Professional Brand (e.g., B2B)
```bash
curl -X POST http://localhost:3000/api/v1/brand/analyze-enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://www.example-b2b.com"}'
```

Expected: `tone: "professional"`, `formality_level: 4`, `cta_style: "action"`

---

## Troubleshooting

### Error: "Analysis failed"

Check server logs for details:
```bash
# Server logs will show:
# [Brand Analysis] Starting for https://...
# [Brand Analysis] Step 1/5: Scraping website...
# [Brand Analysis] Step 2/5: Extracting visual assets...
# etc.
```

Common issues:
- **Website blocks scraping**: Some sites block Puppeteer. Try a different site.
- **Timeout**: Large sites may take longer. Increase timeout in code.
- **OpenAI API error**: Check your API key and credits.

### Error: "Brand profile not found"

You need to run the analysis first:
```bash
POST /api/v1/brand/analyze-enhanced
```

### Slow analysis (> 5 minutes)

This is normal for:
- Large websites with many pages
- Slow website response times
- High AI API latency

Optimization tips:
- Reduce pages scraped (currently: 5 pages)
- Cache AI responses
- Use faster AI model (gpt-3.5-turbo instead of gpt-4)

---

## Verify Database

```sql
-- Check if brand profile was saved
SELECT 
  id,
  user_id,
  brand_name,
  analysis_status,
  brand_personality->>'tone' as tone,
  visual_style->>'layout_preference' as layout,
  messaging_preferences->>'cta_style' as cta_style,
  analysis_completed_at
FROM brand_profiles
WHERE analysis_status = 'completed';

-- View full brand personality
SELECT 
  brand_name,
  jsonb_pretty(brand_personality) as personality
FROM brand_profiles
WHERE analysis_status = 'completed';
```

---

## Success Criteria

✅ **Analysis completes in < 5 minutes**  
✅ **Brand personality is accurate** (tone matches website)  
✅ **Visual style is detected** (layout, image style)  
✅ **Messaging style is captured** (CTAs, urgency, emoji usage)  
✅ **Colors and fonts extracted**  
✅ **Profile can be manually updated**

---

## Next Steps

Once brand profile is working:

1. ✅ **Test with 3-5 different websites**
2. ✅ **Verify AI analysis accuracy**
3. ✅ **Adjust prompts if needed**
4. 🔄 **Move to Product Selection** (Day 3-4)
5. 🔄 **Build Text Overlay** (Day 5-6)
6. 🔄 **Generate emails with brand profile** (Day 8-9)

---

## Example: Full Test Flow

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","fullName":"Test"}' \
  | jq -r '.token')

# 2. Start analysis
JOB_ID=$(curl -s -X POST http://localhost:3000/api/v1/brand/analyze-enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl":"https://www.lysse.com"}' \
  | jq -r '.jobId')

echo "Job ID: $JOB_ID"

# 3. Wait and check status
sleep 30
curl -X GET http://localhost:3000/api/v1/brand/analysis/$JOB_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Get summary
curl -X GET http://localhost:3000/api/v1/brand/summary \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

**Ready to test!** 🚀

Run the migration, start the server, and try analyzing a website!

