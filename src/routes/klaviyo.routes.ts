import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import * as klaviyoService from '../services/klaviyo.service.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const connectSchema = z.object({
  privateKey: z.string().startsWith('pk_'),
  publicKey: z.string().startsWith('pk_').optional(),
});

const pushTemplateSchema = z.object({
  emailId: z.string().uuid(),
  templateName: z.string().min(1),
});

// POST /api/v1/klaviyo/connect
router.post('/connect', async (req: AuthRequest, res, next) => {
  try {
    const data = connectSchema.parse(req.body);
    const result = await klaviyoService.connectKlaviyo(req.user!.id, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/klaviyo/status
router.get('/status', async (req: AuthRequest, res, next) => {
  try {
    const status = await klaviyoService.getConnectionStatus(req.user!.id);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/klaviyo/sync-templates
router.post('/sync-templates', async (req: AuthRequest, res, next) => {
  try {
    const jobId = await klaviyoService.syncTemplates(req.user!.id);
    res.json({ 
      message: 'Template sync started',
      jobId 
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/klaviyo/templates
router.get('/templates', async (req: AuthRequest, res, next) => {
  try {
    const templates = await klaviyoService.getImportedTemplates(req.user!.id);
    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/klaviyo/push-template
router.post('/push-template', async (req: AuthRequest, res, next) => {
  try {
    const data = pushTemplateSchema.parse(req.body);
    const result = await klaviyoService.pushTemplateToKlaviyo(
      req.user!.id,
      data.emailId,
      data.templateName
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/klaviyo/disconnect
router.delete('/disconnect', async (req: AuthRequest, res, next) => {
  try {
    await klaviyoService.disconnectKlaviyo(req.user!.id);
    res.json({ message: 'Klaviyo account disconnected' });
  } catch (error) {
    next(error);
  }
});

export default router;

