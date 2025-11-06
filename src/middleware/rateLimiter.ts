import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import { AuthRequest } from './auth.js';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthRequest) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?.id || req.ip || 'unknown';
  },
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true,
});

// Email generation limiter (more expensive operation)
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 emails per minute
  message: 'Generation rate limit exceeded, please slow down',
  keyGenerator: (req: AuthRequest) => req.user?.id || req.ip || 'unknown',
});

// Upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 uploads per minute
  message: 'Upload rate limit exceeded',
  keyGenerator: (req: AuthRequest) => req.user?.id || req.ip || 'unknown',
});

