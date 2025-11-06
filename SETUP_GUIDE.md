# Setup Guide - AI Email Designer

Complete setup instructions from scratch to production-ready.

## 📋 Prerequisites

### Required Software
- Node.js 20+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))
- Redis 7+ ([Download](https://redis.io/download))
- Git

### Required Accounts
- OpenAI API account ([Sign up](https://platform.openai.com/signup))
- AWS account (for S3 storage) or alternative CDN
- Klaviyo account (for integration)

## 🚀 Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-email-designer.git
cd ai-email-designer

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb ai_email_designer

# Or using psql
psql -U postgres
CREATE DATABASE ai_email_designer;
\q

# Install pgvector extension
psql ai_email_designer -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run schema migration
psql ai_email_designer < src/db/schema.sql

# Verify tables were created
psql ai_email_designer -c "\dt"
```

### 3. Redis Setup

```bash
# Start Redis (varies by OS)

# macOS (with Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 4. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

#### Required Environment Variables

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_email_designer

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret - Generate a secure random string
# macOS/Linux: openssl rand -base64 32
JWT_SECRET=your-secure-random-32-character-secret-here

# Encryption Key - Exactly 32 characters for AES-256
# macOS/Linux: openssl rand -hex 16
ENCRYPTION_KEY=your-encryption-key-32-chars!!

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# AWS S3 (or alternative CDN)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=ai-email-designer-assets
AWS_REGION=us-east-1
CDN_BASE_URL=https://your-cdn-url.com

# Frontend URL (update in production)
FRONTEND_URL=http://localhost:5173
```

### 5. Verify Setup

```bash
# Start the development server
npm run dev

# In another terminal, test the health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"..."}
```

## 🧪 Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "fullName": "Test User",
    "companyName": "Test Company"
  }'
```

Save the returned `token` for subsequent requests.

### 2. Connect Klaviyo

```bash
# Get your Klaviyo API key from:
# https://www.klaviyo.com/settings/account/api-keys

curl -X POST http://localhost:3000/api/v1/klaviyo/connect \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "pk_your_klaviyo_private_key_here"
  }'
```

### 3. Analyze Brand

```bash
curl -X POST http://localhost:3000/api/v1/brand/analyze-website \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://www.jonathanadler.com"
  }'

# Save the jobId from response
# Check status:
curl http://localhost:3000/api/v1/brand/analysis-status/JOB_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Generate Email

```bash
curl -X POST http://localhost:3000/api/v1/emails/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignBrief": "25% off all pottery for spring sale",
    "campaignType": "promotional",
    "tone": "luxury"
  }'

# Check generation status
curl http://localhost:3000/api/v1/emails/generation-status/JOB_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# When complete, get the email
curl http://localhost:3000/api/v1/emails \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql "postgresql://postgres:password@localhost:5432/ai_email_designer"

# View logs
tail -f /usr/local/var/log/postgres.log  # macOS
journalctl -u postgresql  # Linux
```

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Check connection
redis-cli
> INFO
> exit
```

### OpenAI API Issues

```bash
# Test your API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 PID  # macOS/Linux
taskkill /PID PID /F  # Windows

# Or change port in .env
PORT=3001
```

## 🔧 Development Tools

### Database Management

```bash
# View all users
psql ai_email_designer -c "SELECT id, email, created_at FROM users;"

# View generated emails
psql ai_email_designer -c "SELECT id, campaign_brief, status, created_at FROM generated_emails ORDER BY created_at DESC LIMIT 5;"

# Clear test data
psql ai_email_designer -c "DELETE FROM generated_emails WHERE campaign_brief LIKE '%test%';"
```

### Redis Management

```bash
# View all keys
redis-cli KEYS '*'

# Clear all cache (use carefully!)
redis-cli FLUSHALL

# Monitor Redis commands
redis-cli MONITOR
```

### Log Monitoring

```bash
# Watch application logs
npm run dev | bunyan  # if you have bunyan installed

# Or use grep for filtering
npm run dev 2>&1 | grep ERROR
```

## 📦 Production Deployment

### Environment Setup

```bash
# Set NODE_ENV
export NODE_ENV=production

# Build TypeScript
npm run build

# Start production server
npm start
```

### Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Change ENCRYPTION_KEY to a strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Configure CORS for production domain
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure log rotation
- [ ] Use managed PostgreSQL (AWS RDS, etc.)
- [ ] Use managed Redis (AWS ElastiCache, etc.)

### Deployment Platforms

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis

# Deploy
railway up
```

#### Heroku
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Create app
heroku create ai-email-designer

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set OPENAI_API_KEY=sk-your-key

# Deploy
git push heroku main
```

#### Docker
```bash
# Build image
docker build -t ai-email-designer .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name ai-email-designer \
  ai-email-designer

# View logs
docker logs -f ai-email-designer
```

## 📊 Monitoring

### Health Checks

```bash
# API health
curl https://your-domain.com/health

# Database health
psql $DATABASE_URL -c "SELECT 1;"

# Redis health
redis-cli -u $REDIS_URL ping
```

### Metrics to Monitor

- API response times (p50, p95, p99)
- Error rates
- Email generation success rate
- Database connection pool usage
- Redis memory usage
- AI API call costs
- Active users
- Emails generated per day

## 🆘 Getting Help

- **Documentation**: See README.md
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-email-designer/issues)
- **Email**: support@aiemaildesigner.com
- **Discord**: Join our community

## 🎉 Next Steps

Once setup is complete:

1. Build a frontend (React, Vue, or use our example)
2. Customize email templates in `src/services/mjml.service.ts`
3. Add more AI models or providers
4. Implement WebSocket for real-time updates
5. Add team collaboration features
6. Set up analytics and monitoring
7. Configure automated backups
8. Implement caching strategies

---

**Questions?** Open an issue or reach out to the community!

