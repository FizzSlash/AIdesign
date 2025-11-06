# ⚡ Quick Start - AI Email Designer

Get up and running in 5 minutes!

## 🚀 Fastest Way (Docker)

If you have Docker installed:

```bash
# 1. Clone and enter directory
git clone https://github.com/yourusername/ai-email-designer.git
cd ai-email-designer

# 2. Set environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 3. Start everything with one command
docker-compose up -d

# 4. Test the API
curl http://localhost:3000/health

# Done! API is running at http://localhost:3000
```

## 🛠️ Manual Setup (Without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/ai-email-designer.git
cd ai-email-designer

# 2. Install dependencies
npm install

# 3. Generate secure secrets
npm run secrets:generate

# 4. Edit .env and add your API keys
nano .env  # or use your editor
# Required: OPENAI_API_KEY

# 5. Initialize database
npm run db:init

# 6. Start Redis
# macOS: brew services start redis
# Linux: sudo systemctl start redis

# 7. Start development server
npm run dev

# 8. Test the API (in another terminal)
npm run test:api
```

Server will be running at `http://localhost:3000`

## ✅ Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

## 🧪 Try It Out

### 1. Register a user

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "SecurePass123!",
    "fullName": "Your Name"
  }'
```

Save the `token` from the response!

### 2. Connect Klaviyo (Optional)

```bash
curl -X POST http://localhost:3000/api/v1/klaviyo/connect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "pk_your_klaviyo_key"
  }'
```

### 3. Analyze Your Brand

```bash
curl -X POST http://localhost:3000/api/v1/brand/analyze-website \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://yourbrand.com"
  }'
```

This will return a `jobId`. Check status:

```bash
curl http://localhost:3000/api/v1/brand/analysis-status/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Generate an Email! 🎉

```bash
curl -X POST http://localhost:3000/api/v1/emails/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignBrief": "25% off all products this weekend",
    "campaignType": "promotional",
    "tone": "professional"
  }'
```

Check generation status:

```bash
curl http://localhost:3000/api/v1/emails/generation-status/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Get the generated email:

```bash
curl http://localhost:3000/api/v1/emails \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎨 Build a Frontend

See `FRONTEND_EXAMPLE.md` for React components, or use your own!

## 🐛 Troubleshooting

### "Connection refused" error
- Make sure PostgreSQL is running: `pg_isready`
- Make sure Redis is running: `redis-cli ping`

### "Invalid API key" error
- Check your `.env` file has `OPENAI_API_KEY=sk-...`
- Verify the key works: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

### Database errors
- Run: `npm run db:init` to recreate the database
- Check connection: `psql postgresql://postgres:postgres@localhost:5432/ai_email_designer`

### Port 3000 already in use
- Change `PORT=3001` in `.env`
- Or kill the process: `lsof -ti:3000 | xargs kill`

## 📚 Next Steps

- Read `README.md` for full documentation
- See `SETUP_GUIDE.md` for detailed setup
- Check `PRODUCT_BRIEF.md` for technical specs
- Review `PROJECT_SUMMARY.md` for overview

## 🆘 Need Help?

- Check the documentation files
- Open an issue on GitHub
- Join our Discord community

---

**Ready to generate AI-powered emails!** 🚀

