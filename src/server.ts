import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import klaviyoRoutes from './routes/klaviyo.routes.js';
import brandRoutes from './routes/brand.routes.js';
import emailRoutes from './routes/email.routes.js';
import templateRoutes from './routes/template.routes.js';
import productsRoutes from './routes/products.routes.js';
import shopifyRoutes from './routes/shopify.routes.js';
import imagesRoutes from './routes/images.routes.js';

const app = express();

// Trust proxy (required for Railway, Heroku, etc.)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      config.FRONTEND_URL,
      'https://a-idesign.vercel.app',
      'https://ai-email-designer-ui.vercel.app',
      /https:\/\/ai-email-designer-.+\.vercel\.app$/,
      /https:\/\/a-idesign-.+\.vercel\.app$/
    ],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Debug: Test if routes are loading
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API routes are loading!',
    routesLoaded: {
      auth: !!authRoutes,
      klaviyo: !!klaviyoRoutes,
      brand: !!brandRoutes,
      email: !!emailRoutes,
      templates: !!templateRoutes,
      products: !!productsRoutes
    }
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/klaviyo', klaviyoRoutes);
app.use('/api/v1/brand', brandRoutes);
app.use('/api/v1/emails', emailRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/shopify', shopifyRoutes);
app.use('/api/v1/images', imagesRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📧 AI Email Designer API v1.1`);
  logger.info(`🌍 Environment: ${config.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;

