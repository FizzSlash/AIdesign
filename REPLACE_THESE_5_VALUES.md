# 🔑 Replace These 5 Values in `production.env`

## ✅ **Quick Guide**

Open `production.env` and replace these 5 values:

---

### **1. SUPABASE_SERVICE_KEY**
```
Find this line:
SUPABASE_SERVICE_KEY=REPLACE_WITH_YOUR_SUPABASE_SERVICE_KEY

Replace with:
Your service_role key from Supabase → Settings → API
(starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
```

---

### **2. OPENAI_API_KEY**
```
Find this line:
OPENAI_API_KEY=REPLACE_WITH_YOUR_OPENAI_KEY

Replace with:
Your OpenAI key (starts with: sk-proj-... or sk-...)
```

---

### **3. ANTHROPIC_API_KEY**
```
Find this line:
ANTHROPIC_API_KEY=REPLACE_WITH_YOUR_CLAUDE_KEY

Replace with:
Your Claude key (starts with: sk-ant-...)
```

---

### **4. JWT_SECRET**
```
Find this line:
JWT_SECRET=REPLACE_WITH_GENERATED_JWT_SECRET

Generate it:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

Copy the output and paste it
```

---

### **5. ENCRYPTION_KEY**
```
Find this line:
ENCRYPTION_KEY=REPLACE_WITH_GENERATED_ENCRYPTION_KEY

Generate it:
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

Copy the output and paste it (should be exactly 32 characters)
```

---

## 🚀 **After Replacing:**

### **Upload to Vercel:**

```
1. Go to: https://vercel.com/dashboard
2. Your Project → Settings → Environment Variables
3. Click "Add New" → "Plaintext"
4. Copy ENTIRE contents of production.env
5. Paste into the text box
6. Click "Save"
7. Redeploy your project
```

**Done!** ✅

---

## 📋 **Quick Checklist:**

```
☐ Replaced SUPABASE_SERVICE_KEY
☐ Replaced OPENAI_API_KEY
☐ Replaced ANTHROPIC_API_KEY
☐ Generated & replaced JWT_SECRET
☐ Generated & replaced ENCRYPTION_KEY
☐ Uploaded to Vercel
☐ Redeployed
```

**That's it!** 🎉

