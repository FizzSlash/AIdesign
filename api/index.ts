// Vercel serverless function entry point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

// Import routes
import authRoutes from '../src/routes/auth.routes.js';
import klaviyoRoutes from '../src/routes/klaviyo.routes.js';
import brandRoutes from '../src/routes/brand.routes.js';
import emailRoutes from '../src/routes/email.routes.js';
import templateRoutes from '../src/routes/template.routes.js';
import productsRoutes from '../src/routes/products.routes.js';

import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler.js';
import { apiLimiter } from '../src/middleware/rateLimiter.js';
import { logger } from '../src/utils/logger.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/klaviyo', klaviyoRoutes);
app.use('/api/v1/brand', brandRoutes);
app.use('/api/v1/emails', emailRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/products', productsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

