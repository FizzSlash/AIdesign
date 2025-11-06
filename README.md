# AI Email Designer

> AI-powered email designer that integrates with Klaviyo to automatically generate on-brand, responsive HTML emails.

## 🎯 Overview

Transform your email marketing workflow from hours to minutes. Connect your Klaviyo account, let AI learn your brand, and generate campaign-ready emails with a simple prompt.

### Key Features

- **🔌 Klaviyo Integration**: Seamless connection to Klaviyo for template sync and deployment
- **🎨 Automatic Brand Learning**: AI analyzes your website to extract colors, fonts, and brand voice
- **✨ AI-Powered Generation**: Generate complete emails from simple campaign briefs
- **📱 Mobile + Desktop Optimized**: MJML-based responsive design for all devices
- **🖼️ Smart Asset Management**: Automatic image selection and optimization
- **🔄 Template Library**: Save and reuse successful email designs

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- OpenAI API key
- Klaviyo account (for integration)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ai-email-designer.git
cd ai-email-designer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Set up database
npm run db:migrate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

## 📖 Documentation

### Environment Setup

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_email_designer

# AI Services
OPENAI_API_KEY=sk-your-openai-key

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-32-character-secret

# Encryption Key (exactly 32 characters)
ENCRYPTION_KEY=your-encryption-key-32-chars!!
```

### Database Setup

```bash
# Create database
createdb ai_email_designer

# Run migrations
psql ai_email_designer < src/db/schema.sql

# Or use the migration script
npm run db:migrate
```

### API Endpoints

#### Authentication
```
POST   /api/v1/auth/register    - Create new account
POST   /api/v1/auth/login       - Login
GET    /api/v1/auth/me          - Get current user
```

#### Klaviyo Integration
```
POST   /api/v1/klaviyo/connect          - Connect Klaviyo account
GET    /api/v1/klaviyo/status           - Connection status
POST   /api/v1/klaviyo/sync-templates   - Sync templates
POST   /api/v1/klaviyo/push-template    - Push email to Klaviyo
```

#### Brand Profile
```
POST   /api/v1/brand/analyze-website    - Analyze website
POST   /api/v1/brand/upload-assets      - Upload brand assets
GET    /api/v1/brand/profile            - Get brand profile
GET    /api/v1/brand/assets             - List assets
```

#### Email Generation
```
POST   /api/v1/emails/generate          - Generate email
GET    /api/v1/emails                   - List generated emails
GET    /api/v1/emails/:id               - Get email details
PATCH  /api/v1/emails/:id               - Update email
DELETE /api/v1/emails/:id               - Delete email
```

## 🎨 Usage Examples

### 1. Register & Login

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "fullName": "John Doe",
    "companyName": "Example Co"
  }'

# Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    ...
  },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### 2. Connect Klaviyo

```bash
curl -X POST http://localhost:3000/api/v1/klaviyo/connect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "pk_your_klaviyo_private_key"
  }'
```

### 3. Analyze Website (Brand Learning)

```bash
curl -X POST http://localhost:3000/api/v1/brand/analyze-website \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://yourbrand.com"
  }'

# Response:
{
  "message": "Brand analysis started",
  "jobId": "job-uuid"
}

# Check status
curl http://localhost:3000/api/v1/brand/analysis-status/job-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Generate Email

```bash
curl -X POST http://localhost:3000/api/v1/emails/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignBrief": "25% off all pottery for spring sale",
    "campaignType": "promotional",
    "tone": "luxury"
  }'

# Response:
{
  "message": "Email generation started",
  "jobId": "job-uuid"
}

# Check generation status
curl http://localhost:3000/api/v1/emails/generation-status/job-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get generated email
curl http://localhost:3000/api/v1/emails/email-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Push to Klaviyo

```bash
curl -X POST http://localhost:3000/api/v1/klaviyo/push-template \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailId": "email-uuid",
    "templateName": "Spring Sale 2025"
  }'
```

## 🏗️ Architecture

```
┌─────────────────┐
│   React App     │  Frontend (separate repo or /client)
└────────┬────────┘
         │ REST API
┌────────┴────────┐
│   Express API   │  Backend (this repo)
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬─────────┐
    │          │          │         │
┌───┴───┐ ┌───┴───┐ ┌────┴────┐ ┌─┴──┐
│  AI   │ │ MJML  │ │ Klaviyo │ │ DB │
│Engine │ │Service│ │   API   │ │    │
└───────┘ └───────┘ └─────────┘ └────┘
```

### Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL with pgvector
- **Cache**: Redis
- **AI**: OpenAI GPT-4
- **Email**: MJML for responsive templates
- **Storage**: AWS S3 (configurable)

## 📊 Database Schema

See `src/db/schema.sql` for the complete schema.

Key tables:
- `users` - User accounts
- `klaviyo_accounts` - Klaviyo integration
- `brand_profiles` - Brand settings & assets
- `brand_assets` - Image library
- `email_templates` - Saved templates
- `generated_emails` - AI-generated emails
- `background_jobs` - Async job tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Test specific endpoint
curl -X GET http://localhost:3000/health
```

## 🔒 Security

- JWT-based authentication
- API keys encrypted at rest (AES-256-GCM)
- Rate limiting on all endpoints
- Input validation with Zod
- SQL injection protection with parameterized queries
- CORS configuration

## 💰 Cost Estimation

### Per Email Generated
- AI API calls: ~$0.038
- Infrastructure: ~$0.012
- **Total: ~$0.05 per email**

### Monthly (1000 users generating 100 emails each)
- AI costs: $3,800
- Infrastructure: $1,050
- **Total: ~$4,850/month**
- **Revenue potential (at $29/user): $29,000/month**

## 🚢 Deployment

### Docker

```bash
# Build
docker build -t ai-email-designer .

# Run
docker run -p 3000:3000 --env-file .env ai-email-designer
```

### Production Checklist

- [ ] Set strong JWT_SECRET and ENCRYPTION_KEY
- [ ] Configure production database
- [ ] Set up S3 for asset storage
- [ ] Enable HTTPS
- [ ] Configure monitoring (Sentry, DataDog)
- [ ] Set up automated backups
- [ ] Configure rate limits appropriately
- [ ] Review CORS settings

## 📈 Roadmap

### v1.0 (MVP) ✅
- [x] User authentication
- [x] Klaviyo integration
- [x] Brand analysis
- [x] AI email generation
- [x] Template library

### v1.1
- [ ] Inline email editor
- [ ] A/B variant generation
- [ ] Performance analytics
- [ ] Team collaboration

### v2.0
- [ ] Multi-brand support
- [ ] Advanced AI customization
- [ ] Template marketplace
- [ ] API for developers

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [docs.aiemaildesigner.com](https://docs.aiemaildesigner.com)
- Email: support@aiemaildesigner.com
- Discord: [Join our community](https://discord.gg/aiemaildesigner)

## 🙏 Acknowledgments

- MJML for responsive email framework
- OpenAI for GPT-4 API
- Klaviyo for email platform integration

---

**Built with ❤️ for email marketers everywhere**

