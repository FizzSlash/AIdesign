# 🚀 Supabase Setup Guide

Complete guide to use Supabase for database + storage (no AWS needed!)

---

## ✅ **Why Supabase?**

```
One Platform:
✅ PostgreSQL database
✅ File storage (like S3)
✅ CDN (built-in)
✅ Authentication (if needed)
✅ Real-time (if needed)
✅ Free tier (generous)

vs. AWS:
❌ Multiple services
❌ Complex setup
❌ Expensive
❌ Harder to configure
```

---

## 📋 **Step-by-Step Setup**

### **1. Create Supabase Project**

```
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - Name: ai-email-designer
   - Database Password: [Generate strong password - SAVE THIS!]
   - Region: [Choose closest to you]
6. Click "Create new project"
7. Wait 2 minutes for setup
```

---

### **2. Setup Database**

#### **2.1 Get Connection String**

```
1. In Supabase Dashboard
2. Click Settings (gear icon) → Database
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the string:

postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

6. Replace [YOUR-PASSWORD] with your actual password
```

#### **2.2 Run Database Schema**

```
1. In Supabase Dashboard
2. Click "SQL Editor" in sidebar
3. Click "New query"
4. Copy ALL contents from: src/db/schema.sql
5. Paste into editor
6. Click "Run" (or press Ctrl+Enter)
7. Should see: "Success. No rows returned"
8. Click "Tables" in sidebar to verify tables were created
```

#### **2.3 Enable Extensions**

```sql
-- In SQL Editor, run this:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
```

---

### **3. Setup Storage**

#### **3.1 Create Storage Bucket**

```
1. In Supabase Dashboard
2. Click "Storage" in sidebar
3. Click "Create a new bucket"
4. Fill in:
   - Name: email-assets
   - Public bucket: ✅ YES (check this!)
5. Click "Create bucket"
```

#### **3.2 Get Storage URL**

```
Your storage URL format:
https://[PROJECT-REF].supabase.co/storage/v1/object/public/email-assets

Example:
https://abcdefghijklmnop.supabase.co/storage/v1/object/public/email-assets

Find your PROJECT-REF:
- Settings → General → Reference ID
- Or look at your database URL
```

#### **3.3 Configure CORS (Optional)**

```
1. Storage → Configuration
2. Add allowed origins if needed
3. Default settings work for most cases
```

---

### **4. Get API Keys**

```
1. In Supabase Dashboard
2. Click Settings → API
3. Copy these 3 values:

Project URL:
https://xxxxxxxxxxxxx.supabase.co

anon/public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

service_role key (Secret!):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

---

## 🔑 **Environment Variables for Vercel**

### **Complete List (Supabase Version):**

```env
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Storage (from Supabase)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CDN_BASE_URL=https://xxxxx.supabase.co/storage/v1/object/public/email-assets

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
DEFAULT_AI_MODEL=gpt-4-turbo
DEFAULT_AI_TEMPERATURE=0.7

# JWT
JWT_SECRET=your-32-character-secret-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Encryption
ENCRYPTION_KEY=your-32-character-key-here!!

# App Config
NODE_ENV=production
PORT=3000
API_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info
```

---

## 📊 **Supabase vs AWS Comparison**

| Feature | Supabase | AWS S3 |
|---------|----------|--------|
| **Setup** | 5 minutes | 30 minutes |
| **Cost** | Free tier: 1GB storage | Paid from start |
| **CDN** | Built-in | Need CloudFront |
| **Auth** | Built-in | Need IAM |
| **Dashboard** | Beautiful UI | Complex console |
| **Database** | Included | Separate (RDS) |

**Winner: Supabase for this project!**

---

## 💰 **Supabase Pricing**

### **Free Tier (Perfect for Starting):**

```
✅ 500MB database
✅ 1GB file storage
✅ 2GB bandwidth
✅ Unlimited API requests
✅ 50,000 monthly active users

Good for:
- Development
- Testing
- First 100-500 users
```

### **Pro Tier ($25/month):**

```
✅ 8GB database
✅ 100GB file storage
✅ 250GB bandwidth
✅ Daily backups
✅ Priority support

Good for:
- Production
- 1,000+ users
- Serious launch
```

---

## 🧪 **Test Supabase Storage**

### **Upload Test Image:**

```javascript
// In Supabase Dashboard → Storage → email-assets
1. Click "Upload file"
2. Select any image
3. Click "Upload"
4. Click on uploaded file
5. Copy "Public URL"

Example URL:
https://xxxxx.supabase.co/storage/v1/object/public/email-assets/test.jpg
```

### **Test from Code:**

```bash
# After deploying to Vercel
curl -X POST https://your-app.vercel.app/api/v1/brand/upload-assets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@test-image.jpg"

# Should return Supabase URL
```

---

## ✅ **Final Checklist**

```
Supabase Setup:
☑ Project created
☑ Database password saved
☑ Schema.sql executed
☑ Tables verified (13 tables)
☑ Extensions enabled (uuid-ossp, vector)
☑ Storage bucket created (email-assets)
☑ Bucket is PUBLIC
☑ API keys copied

Vercel Setup:
☑ DATABASE_URL added
☑ SUPABASE_URL added
☑ SUPABASE_SERVICE_KEY added
☑ CDN_BASE_URL added
☑ OPENAI_API_KEY added
☑ JWT_SECRET added
☑ ENCRYPTION_KEY added

Ready to deploy!
```

---

## 🎉 **Benefits of Supabase**

```
✅ Simpler setup (one platform)
✅ Cheaper (free tier)
✅ Faster (no AWS complexity)
✅ Better DX (nicer dashboard)
✅ Built-in CDN
✅ Automatic backups
✅ Easy scaling

Perfect for your SaaS!
```

---

## 🔗 **Quick Links**

- Supabase Dashboard: https://supabase.com/dashboard
- Storage Docs: https://supabase.com/docs/guides/storage
- Database Docs: https://supabase.com/docs/guides/database

---

**Use Supabase! It's perfect for this project.** 🎉

**Need help setting it up?** Let me know which step you're on!

