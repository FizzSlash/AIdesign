import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { generationLimiter } from '../middleware/rateLimiter.js';
import * as emailService from '../services/email.service.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const generateEmailSchema = z.object({
  campaignBrief: z.string().min(10).max(1000),
  campaignType: z.enum(['promotional', 'product_launch', 'newsletter', 'abandoned_cart', 'seasonal']).optional(),
  targetProducts: z.array(z.string()).optional(),
  tone: z.enum(['luxury', 'casual', 'playful', 'professional', 'urgent']).optional(),
  layoutPreference: z.string().optional(),
});

const updateEmailSchema = z.object({
  htmlContent: z.string().optional(),
  subjectLine: z.string().optional(),
  previewText: z.string().optional(),
});

const rateEmailSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
});

// POST /api/v1/emails/generate
router.post('/generate', generationLimiter, async (req: AuthRequest, res, next) => {
  try {
    const data = generateEmailSchema.parse(req.body);
    const jobId = await emailService.generateEmail(req.user!.id, data);
    res.json({ 
      message: 'Email generation started',
      jobId 
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/emails/generation-status/:jobId
router.get('/generation-status/:jobId', async (req: AuthRequest, res, next) => {
  try {
    const status = await emailService.getGenerationStatus(req.user!.id, req.params.jobId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/emails/:emailId/regenerate
router.post('/:emailId/regenerate', generationLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { section, variation } = req.body;
    const jobId = await emailService.regenerateEmail(req.user!.id, req.params.emailId, { section, variation });
    res.json({ 
      message: 'Regeneration started',
      jobId 
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/emails
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, campaignType, limit = '20', offset = '0' } = req.query;
    const emails = await emailService.getEmails(req.user!.id, {
      status: status as string,
      campaignType: campaignType as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
    res.json({ emails });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/emails/:emailId
router.get('/:emailId', async (req: AuthRequest, res, next) => {
  try {
    const email = await emailService.getEmailById(req.user!.id, req.params.emailId);
    res.json({ email });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/emails/:emailId
router.patch('/:emailId', async (req: AuthRequest, res, next) => {
  try {
    const data = updateEmailSchema.parse(req.body);
    const email = await emailService.updateEmail(req.user!.id, req.params.emailId, data);
    res.json({ email });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/emails/:emailId
router.delete('/:emailId', async (req: AuthRequest, res, next) => {
  try {
    await emailService.deleteEmail(req.user!.id, req.params.emailId);
    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/emails/:emailId/rate
router.post('/:emailId/rate', async (req: AuthRequest, res, next) => {
  try {
    const data = rateEmailSchema.parse(req.body);
    await emailService.rateEmail(req.user!.id, req.params.emailId, data);
    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

