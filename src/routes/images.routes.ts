import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import * as heroImageService from '../services/hero-image-generator.service.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/images/generate-hero
router.post('/generate-hero', async (req: AuthRequest, res, next) => {
  try {
    const { type, text, campaignBrief, brandColors, brandVoice, productImages } = req.body;
    
    let imageUrl = '';
    
    if (type === 'dalle') {
      imageUrl = await heroImageService.generateDALLEHero({
        type: 'dalle',
        campaignBrief,
        brandColors,
        brandVoice,
      });
    } else if (type === 'gradient') {
      imageUrl = await heroImageService.generateGradientHero({
        type: 'gradient',
        text,
        brandColors,
      });
    }
    
    res.json({
      imageUrl,
      type,
      cost: heroImageService.getHeroCost(type)
    });
  } catch (error) {
    next(error);
  }
});

export default router;

