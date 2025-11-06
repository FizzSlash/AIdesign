import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import * as brandService from '../services/brand.service.js';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// All routes require authentication
router.use(authenticate);

// Validation schemas
const analyzeWebsiteSchema = z.object({
  websiteUrl: z.string().url(),
});

const updateProfileSchema = z.object({
  brandName: z.string().optional(),
  brandVoice: z.string().optional(),
  colorPalette: z.record(z.string()).optional(),
  typography: z.record(z.any()).optional(),
  defaultLayout: z.string().optional(),
});

// POST /api/v1/brand/analyze-website
router.post('/analyze-website', async (req: AuthRequest, res, next) => {
  try {
    const data = analyzeWebsiteSchema.parse(req.body);
    const jobId = await brandService.analyzeWebsite(req.user!.id, data.websiteUrl);
    res.json({ 
      message: 'Brand analysis started',
      jobId 
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/brand/analysis-status/:jobId
router.get('/analysis-status/:jobId', async (req: AuthRequest, res, next) => {
  try {
    const status = await brandService.getAnalysisStatus(req.user!.id, req.params.jobId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/brand/upload-assets
router.post('/upload-assets', uploadLimiter, upload.array('files', 20), async (req: AuthRequest, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { assetType, category } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const assets = await brandService.uploadAssets(req.user!.id, files, { assetType, category });
    res.json({ assets });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/brand/profile
router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const profile = await brandService.getBrandProfile(req.user!.id);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/brand/profile
router.patch('/profile', async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const profile = await brandService.updateBrandProfile(req.user!.id, data);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/brand/assets
router.get('/assets', async (req: AuthRequest, res, next) => {
  try {
    const { type, category, search } = req.query;
    const assets = await brandService.getAssets(req.user!.id, {
      type: type as string,
      category: category as string,
      search: search as string,
    });
    res.json({ assets });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/brand/assets/:assetId
router.delete('/assets/:assetId', async (req: AuthRequest, res, next) => {
  try {
    await brandService.deleteAsset(req.user!.id, req.params.assetId);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

