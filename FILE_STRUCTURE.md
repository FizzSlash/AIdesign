# 📁 File Structure - AI Email Designer

Complete file tree with descriptions.

```
ai-email-designer/
│
├── 📄 README.md                          # Main project documentation
├── 📄 QUICKSTART.md                      # 5-minute setup guide
├── 📄 SETUP_GUIDE.md                     # Detailed setup instructions  
├── 📄 PRODUCT_BRIEF.md                   # Complete technical specification
├── 📄 PROJECT_SUMMARY.md                 # What was built summary
├── 📄 FRONTEND_EXAMPLE.md                # React component examples
├── 📄 FILE_STRUCTURE.md                  # This file
│
├── 🔧 Configuration Files
│   ├── package.json                      # Dependencies & npm scripts
│   ├── tsconfig.json                     # TypeScript configuration
│   ├── .env.example                      # Environment template
│   ├── .env                              # Local environment (gitignored)
│   ├── .gitignore                        # Git ignore rules
│   ├── Dockerfile                        # Production Docker image
│   └── docker-compose.yml                # Full stack Docker setup
│
├── 📜 scripts/                           # Utility scripts
│   ├── init-db.sh                        # Initialize PostgreSQL database
│   ├── generate-secrets.sh               # Generate secure JWT/encryption keys
│   └── test-api.sh                       # Automated API testing
│
├── 📂 src/                               # Source code
│   │
│   ├── 🔧 config/
│   │   └── index.ts                      # Environment config with Zod validation
│   │
│   ├── 💾 db/
│   │   ├── index.ts                      # PostgreSQL connection pool
│   │   └── schema.sql                    # Database schema (13 tables)
│   │
│   ├── 🛡️ middleware/
│   │   ├── auth.ts                       # JWT authentication middleware
│   │   ├── errorHandler.ts              # Global error handling
│   │   └── rateLimiter.ts                # Rate limiting configs
│   │
│   ├── 🛣️ routes/                        # API endpoints
│   │   ├── auth.routes.ts                # Auth endpoints (register, login, etc.)
│   │   ├── klaviyo.routes.ts             # Klaviyo integration endpoints
│   │   ├── brand.routes.ts               # Brand management endpoints
│   │   ├── email.routes.ts               # Email generation endpoints
│   │   └── template.routes.ts            # Template management endpoints
│   │
│   ├── ⚙️ services/                      # Business logic
│   │   ├── ai.service.ts                 # OpenAI GPT-4 integration
│   │   │                                 # - Intent analysis
│   │   │                                 # - Content generation
│   │   │                                 # - Image analysis
│   │   │                                 # - Embeddings
│   │   │
│   │   ├── auth.service.ts               # Authentication logic
│   │   │                                 # - User registration
│   │   │                                 # - Login/logout
│   │   │                                 # - Token refresh
│   │   │
│   │   ├── klaviyo.service.ts            # Klaviyo API integration
│   │   │                                 # - Account connection
│   │   │                                 # - Template sync
│   │   │                                 # - Push to Klaviyo
│   │   │
│   │   ├── brand.service.ts              # Brand analysis
│   │   │                                 # - Website scraping
│   │   │                                 # - Color extraction
│   │   │                                 # - Typography detection
│   │   │                                 # - Asset management
│   │   │
│   │   ├── email.service.ts              # Email generation pipeline
│   │   │                                 # - Async job processing
│   │   │                                 # - Content assembly
│   │   │                                 # - Usage tracking
│   │   │
│   │   ├── mjml.service.ts               # Email template rendering
│   │   │                                 # - MJML assembly
│   │   │                                 # - HTML rendering
│   │   │                                 # - Responsive design
│   │   │
│   │   └── template.service.ts           # Template CRUD
│   │
│   ├── 🛠️ utils/
│   │   ├── logger.ts                     # Winston logger setup
│   │   └── encryption.ts                 # AES-256 encryption utilities
│   │
│   └── 🚀 server.ts                      # Express application entry point
│
└── 📦 node_modules/                      # Dependencies (gitignored)
```

## 📊 Statistics

### Code Files
- **Total Files**: 40+
- **Source Files**: 22 TypeScript files
- **Documentation**: 6 markdown files
- **Configuration**: 8 files
- **Scripts**: 3 bash scripts

### Lines of Code (approx.)
- TypeScript: ~6,500 lines
- SQL: ~400 lines
- Documentation: ~3,000 lines
- **Total: ~10,000 lines**

### API Endpoints
- **Auth**: 5 endpoints
- **Klaviyo**: 6 endpoints  
- **Brand**: 6 endpoints
- **Email**: 8 endpoints
- **Templates**: 5 endpoints
- **Total**: 30 endpoints

### Database Tables
1. `users` - User accounts
2. `klaviyo_accounts` - Klaviyo connections
3. `brand_profiles` - Brand configurations
4. `brand_assets` - Image library
5. `email_templates` - Saved templates
6. `generated_emails` - AI-generated emails
7. `email_components` - Reusable blocks
8. `background_jobs` - Async tasks
9. `usage_logs` - Analytics
10. `subscription_plans` - Billing tiers
11. `user_subscriptions` - User billing
12. Plus indexes, triggers, and constraints

## 🔍 Key Files Explained

### Must Read First
1. **QUICKSTART.md** - Get running in 5 minutes
2. **README.md** - Complete overview
3. **PROJECT_SUMMARY.md** - What was built

### For Developers
1. **src/server.ts** - Application entry point
2. **src/config/index.ts** - Configuration setup
3. **src/services/email.service.ts** - Core generation logic
4. **src/services/ai.service.ts** - AI integration

### For DevOps
1. **Dockerfile** - Production container
2. **docker-compose.yml** - Full stack setup
3. **scripts/init-db.sh** - Database initialization

### For Product/Business
1. **PRODUCT_BRIEF.md** - Full specification
2. **SETUP_GUIDE.md** - Deployment guide

## 🎯 File Purpose Guide

### Need to...

**Add a new API endpoint?**
→ Create route in `src/routes/`, add service in `src/services/`

**Change database schema?**
→ Edit `src/db/schema.sql`, run migration

**Modify AI prompts?**
→ Edit `src/services/ai.service.ts`

**Change email template?**
→ Edit `src/services/mjml.service.ts`

**Add environment variable?**
→ Update `.env.example`, `src/config/index.ts`

**Deploy to production?**
→ Follow `SETUP_GUIDE.md` deployment section

**Build frontend?**
→ See `FRONTEND_EXAMPLE.md` for React code

**Understand the system?**
→ Read `PRODUCT_BRIEF.md` architecture section

## 🔐 Security Files

- **src/middleware/auth.ts** - JWT authentication
- **src/utils/encryption.ts** - API key encryption
- **src/middleware/rateLimiter.ts** - DDoS protection
- **.env** - Secrets (NEVER commit!)

## 📝 Documentation Files

All documentation is in Markdown for easy reading:

- **User-facing**: QUICKSTART.md, README.md
- **Developer**: SETUP_GUIDE.md, FRONTEND_EXAMPLE.md
- **Technical**: PRODUCT_BRIEF.md, PROJECT_SUMMARY.md
- **Reference**: FILE_STRUCTURE.md (this file)

## 🚀 Quick Navigation

```bash
# View all source files
ls -R src/

# Count lines of code
find src -name "*.ts" | xargs wc -l

# View all routes
grep -r "router\." src/routes/

# View all database tables
grep "CREATE TABLE" src/db/schema.sql

# View all npm scripts
npm run
```

---

**Everything is organized and documented!** 🎉

