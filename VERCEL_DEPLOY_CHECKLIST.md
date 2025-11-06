# ✅ Vercel Deployment Checklist

## 📝 **What You Need to Replace in `env-template-for-vercel.txt`**

### **1. Supabase Service Key**
```
SUPABASE_SERVICE_KEY=PASTE_YOUR_SERVICE_ROLE_KEY_HERE
```
**Where to find:**
- Supabase Dashboard → Settings → API
- Copy the **service_role** key (the secret one)

---

### **2. OpenAI API Key**
```
OPENAI_API_KEY=PASTE_YOUR_OPENAI_KEY_HERE
```
**Where to find:**
- https://platform.openai.com/api-keys
- Copy your key (starts with `sk-proj-` or `sk-`)

---

### **3. Claude API Key**
```
ANTHROPIC_API_KEY=PASTE_YOUR_CLAUDE_KEY_HERE
```
**Where to find:**
- https://console.anthropic.com/settings/keys
- Copy your key (starts with `sk-ant-`)

---

### **4. JWT Secret (Generate)**
```
JWT_SECRET=PASTE_GENERATED_JWT_SECRET_HERE
```
**Generate it:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy the output

---

### **5. Encryption Key (Generate)**
```
ENCRYPTION_KEY=PASTE_GENERATED_ENCRYPTION_KEY_HERE
```
**Generate it:**
```powershell
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
Copy the output (should be exactly 32 characters)

---

### **6. App URLs (Update After Deploy)**
```
API_URL=https://your-app-name.vercel.app
FRONTEND_URL=https://your-frontend-name.vercel.app
```
**First deployment:**
- Leave as is or use placeholder
- After Vercel gives you URL, come back and update these
- Redeploy

---

## 🚀 **Deployment Steps**

### **Step 1: Generate Secrets**
```powershell
# Run these in PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Save both outputs
```

### **Step 2: Fill Template**
```
1. Open: env-template-for-vercel.txt
2. Replace all "PASTE_YOUR_..." with actual values
3. Replace "PASTE_GENERATED_..." with generated values
4. Save your filled version
```

### **Step 3: Deploy to Vercel**
```
1. Go to: https://vercel.com/new
2. Import Git repository (or drag & drop folder)
3. Project name: ai-email-designer
4. Framework Preset: Other
5. Build Command: npm run build
6. Output Directory: dist
7. Click "Deploy"
```

### **Step 4: Add Environment Variables**
```
1. After deploy, go to: Project → Settings → Environment Variables
2. For each variable in your filled template:
   - Click "Add New"
   - Name: DATABASE_URL
   - Value: [paste your value]
   - Environment: Production, Preview, Development (select all)
   - Click "Save"
3. Repeat for all 10+ variables
```

### **Step 5: Redeploy**
```
1. Go to: Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete
```

### **Step 6: Test**
```powershell
# Replace with your actual Vercel URL
curl https://ai-email-designer.vercel.app/health

# Should return:
# {"status":"healthy",...}
```

---

## 📋 **Quick Reference**

### **What You Already Have:**
- ✅ Claude API key
- ✅ OpenAI API key
- ✅ Supabase URL
- ✅ Supabase service key
- ✅ Database password

### **What to Generate:**
- ⏳ JWT_SECRET (run crypto command)
- ⏳ ENCRYPTION_KEY (run crypto command)

### **What to Update Later:**
- ⏳ API_URL (after Vercel gives you URL)
- ⏳ FRONTEND_URL (when you deploy frontend)

---

## 🆘 **Common Issues**

### **"Database connection failed"**
```
Check:
- Password is URL-encoded (! = %21)
- No spaces in DATABASE_URL
- Database exists in Supabase
```

### **"Module not found"**
```
Fix:
- Make sure package.json is correct
- Run: npm install locally first
- Check vercel.json exists
```

### **"OpenAI API error"**
```
Check:
- API key is correct
- Key has credits ($5+ recommended)
- Key starts with sk-proj- or sk-
```

---

## ✅ **You're Ready!**

**Files you need:**
1. ✅ `env-template-for-vercel.txt` (created - fill this in)
2. ✅ All your keys (you have them)
3. ⏳ Generate 2 secrets (run the commands above)

**Then just deploy to Vercel!** 🚀

Need help with the actual Vercel deployment?

