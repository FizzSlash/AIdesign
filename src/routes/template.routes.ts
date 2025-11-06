import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import * as templateService from '../services/template.service.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  htmlContent: z.string().min(1),
  mjmlContent: z.string().optional(),
  layoutType: z.string().optional(),
  campaignType: z.string().optional(),
});

const updateTemplateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  htmlContent: z.string().optional(),
  mjmlContent: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

// GET /api/v1/templates
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { campaignType, favorite, limit = '50', offset = '0' } = req.query;
    const templates = await templateService.getTemplates(req.user!.id, {
      campaignType: campaignType as string,
      favorite: favorite === 'true',
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/templates
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createTemplateSchema.parse(req.body);
    const template = await templateService.createTemplate(req.user!.id, data);
    res.status(201).json({ template });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/templates/:templateId
router.get('/:templateId', async (req: AuthRequest, res, next) => {
  try {
    const template = await templateService.getTemplateById(req.user!.id, req.params.templateId);
    res.json({ template });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/templates/:templateId
router.patch('/:templateId', async (req: AuthRequest, res, next) => {
  try {
    const data = updateTemplateSchema.parse(req.body);
    const template = await templateService.updateTemplate(req.user!.id, req.params.templateId, data);
    res.json({ template });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/templates/:templateId
router.delete('/:templateId', async (req: AuthRequest, res, next) => {
  try {
    await templateService.deleteTemplate(req.user!.id, req.params.templateId);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

