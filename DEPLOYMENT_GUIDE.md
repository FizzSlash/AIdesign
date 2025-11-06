# 🚀 Deployment Guide: Vercel + Supabase

Complete guide to deploy your AI Email Designer to production.

---

## 📋 **Prerequisites**

- [ ] Vercel account ([Sign up](https://vercel.com/signup))
- [ ] Supabase account ([Sign up](https://supabase.com))
- [ ] OpenAI API key ([Get one](https://platform.openai.com/api-keys))
- [ ] GitHub repository (optional but recommended)

---

## 🗄️ **Step 1: Setup Supabase Database**

### **1.1 Create Project**

```
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter:
   - Name: ai-email-designer
   - Database Password: [Generate strong password]
   - Region: [Choose closest to your users]
4. Click "Create new project"
5. Wait 2-3 minutes for setup
```

### **1.2 Get Database URL**

```
1. Go to Project Settings → Database
2. Find "Connection string" section
3. Select "URI" format
4. Copy the connection string:

postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

5. Replace [YOUR-PASSWORD] with your actual password
```

### **1.3 Run Database Schema**

```
1. In Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy contents from: src/db/schema.sql
4. Paste into SQL editor
5. Click "Run"
6. Should see: "Success. No rows returned"
```

**Alternative (Local):**

```bash
# If you have psql installed
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" < src/db/schema.sql
```

### **1.4 Enable Extensions**

```sql
-- In Supabase SQL Editor, run:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## ☁️ **Step 2: Deploy to Vercel**

### **2.1 Install Vercel CLI**

```bash
npm install -g vercel
```

### **2.2 Login to Vercel**

```bash
vercel login
```

### **2.3 Deploy**

```bash
# From your project directory
cd C:\Users\Reid\Downloads\AIdesign

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - What's your project's name? ai-email-designer
# - In which directory is your code located? ./
# - Want to override settings? No
```

### **2.4 Add Environment Variables**

```bash
# Option A: Via CLI
vercel env add DATABASE_URL
# Paste your Supabase connection string

vercel env add OPENAI_API_KEY
# Paste your OpenAI key

vercel env add JWT_SECRET
# Paste generated secret

vercel env add ENCRYPTION_KEY
# Paste generated key

# Option B: Via Dashboard (Easier)
# Go to: https://vercel.com/dashboard
# → Your Project → Settings → Environment Variables
# Add each variable below
```

---

## 🔑 **Required Environment Variables**

### **Critical (Must Have):**

```env
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# OpenAI (from OpenAI dashboard)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# JWT Secret (generate new)
JWT_SECRET=your-secure-random-32-character-secret

# Encryption Key (generate new - exactly 32 chars)
ENCRYPTION_KEY=your-encryption-key-32-chars!!
```

### **Optional (Can Add Later):**

```env
# AWS S3 (or use Supabase Storage)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=ai-email-assets
AWS_REGION=us-east-1
CDN_BASE_URL=https://your-bucket.s3.amazonaws.com

# Frontend URL (if separate)
FRONTEND_URL=https://your-frontend.vercel.app

# API URL (your Vercel deployment)
API_URL=https://ai-email-designer.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info

# Other defaults
NODE_ENV=production
PORT=3000
DEFAULT_AI_MODEL=gpt-4-turbo
DEFAULT_AI_TEMPERATURE=0.7
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
BULL_CONCURRENCY=5
```

---

## 🔧 **Step 3: Configure Vercel Settings**

### **In Vercel Dashboard:**

```
Project Settings → General:

✅ Node.js Version: 20.x
✅ Build Command: npm run build
✅ Output Directory: dist
✅ Install Command: npm install
```

### **Add Build Script to package.json:**

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "vercel-build": "npm run build"
  }
}
```

---

## 🧪 **Step 4: Test Deployment**

### **4.1 Get Your URL**

```bash
# After deployment, Vercel gives you:
https://ai-email-designer.vercel.app

# Or
https://ai-email-designer-[random].vercel.app
```

### **4.2 Test Health Endpoint**

```bash
curl https://ai-email-designer.vercel.app/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

### **4.3 Test Registration**

```bash
curl -X POST https://ai-email-designer.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "fullName": "Test User"
  }'

# Should return user + token
```

---

## 🔒 **Security Checklist**

### **Before Going Live:**

- [ ] Change JWT_SECRET to strong random value
- [ ] Change ENCRYPTION_KEY to strong random value
- [ ] Set FRONTEND_URL to your actual frontend
- [ ] Enable CORS only for your domain
- [ ] Set up Supabase Row Level Security (RLS)
- [ ] Add Vercel password protection (optional)
- [ ] Set up monitoring (Vercel Analytics)

---

## 💾 **Alternative: Supabase Storage (Instead of AWS S3)**

### **Use Supabase for Images:**

```javascript
// In Supabase Dashboard:
1. Go to Storage
2. Create bucket: "email-assets"
3. Make it public
4. Get URL: https://[project].supabase.co/storage/v1/object/public/email-assets

// Update .env:
CDN_BASE_URL=https://[project].supabase.co/storage/v1/object/public/email-assets

// No AWS needed!
```

---

## 📊 **Minimal Required Variables**

### **Absolute Minimum to Work:**

```env
# These 4 are REQUIRED:
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
JWT_SECRET=your-32-char-secret
ENCRYPTION_KEY=your-32-char-key

# Everything else has defaults or can be added later
```

---

## 🎯 **Quick Deploy Checklist**

```
✅ Step 1: Create Supabase project
✅ Step 2: Copy DATABASE_URL
✅ Step 3: Run schema.sql in Supabase
✅ Step 4: Get OpenAI API key
✅ Step 5: Generate JWT_SECRET
✅ Step 6: Generate ENCRYPTION_KEY
✅ Step 7: Deploy to Vercel
✅ Step 8: Add 4 env variables to Vercel
✅ Step 9: Redeploy
✅ Step 10: Test /health endpoint
```

---

## 🆘 **Common Issues**

### **"Database connection failed"**

```
Check:
1. DATABASE_URL is correct
2. Password has no special characters (or is URL-encoded)
3. Supabase project is active
4. Database tables are created

Fix:
# Test connection:
psql "YOUR_DATABASE_URL"
```

### **"OpenAI API error"**

```
Check:
1. API key starts with sk-proj- or sk-
2. Key has credits ($5+ recommended)
3. Key is not expired

Test:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

### **"Module not found"**

```
Check:
1. package.json has all dependencies
2. Build command ran successfully
3. TypeScript compiled (check dist/ folder)

Fix:
vercel --prod --force
```

---

## 🎉 **After Deployment**

### **Your API will be live at:**

```
https://ai-email-designer.vercel.app
```

### **Test it:**

```bash
# Health check
curl https://ai-email-designer.vercel.app/health

# Register user
curl -X POST https://ai-email-designer.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"SecurePass123!"}'
```

---

## 📝 **Quick Reference Card**

```
┌─────────────────────────────────────────────┐
│ VERCEL ENVIRONMENT VARIABLES                │
├─────────────────────────────────────────────┤
│                                             │
│ DATABASE_URL                                │
│ → Get from: Supabase → Settings → Database │
│                                             │
│ OPENAI_API_KEY                              │
│ → Get from: platform.openai.com/api-keys   │
│                                             │
│ JWT_SECRET                                  │
│ → Generate: crypto.randomBytes(32).base64  │
│                                             │
│ ENCRYPTION_KEY                              │
│ → Generate: crypto.randomBytes(16).hex     │
│                                             │
└─────────────────────────────────────────────┘
```

**Just these 4 and you're live!** 🚀

Need help with any specific step?
