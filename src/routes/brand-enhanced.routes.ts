import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { EnhancedBrandService } from '../services/brand-enhanced.service.js';
import db from '../db/index.js';

const router = Router();

// Initialize service
const brandService = new EnhancedBrandService(db);

// Validation schemas
const analyzeWebsiteSchema = z.object({
  websiteUrl: z.string().url(),
  exampleEmails: z.array(z.object({
    url: z.string().url(),
    notes: z.string()
  })).optional(),
  competitorUrls: z.array(z.string().url()).optional()
});

const updateProfileSchema = z.object({
  brand_personality: z.object({
    tone: z.enum(['luxury', 'casual', 'playful', 'professional', 'minimal']).optional(),
    adjectives: z.array(z.string()).optional(),
    voice_description: z.string().optional(),
    formality_level: z.number().min(1).max(5).optional()
  }).optional(),
  visual_style: z.object({
    layout_preference: z.enum(['minimal', 'rich', 'editorial', 'product-focused']).optional(),
    image_style: z.enum(['lifestyle', 'product-only', 'mixed']).optional(),
    overlay_style: z.enum(['dark', 'light', 'gradient', 'none']).optional(),
    spacing: z.enum(['tight', 'normal', 'spacious']).optional()
  }).optional(),
  messaging_preferences: z.object({
    cta_style: z.enum(['action', 'benefit', 'urgency']).optional(),
    urgency_level: z.enum(['low', 'medium', 'high']).optional(),
    emoji_usage: z.enum(['none', 'minimal', 'moderate', 'heavy']).optional(),
    sentence_length: z.enum(['short', 'medium', 'long']).optional()
  }).optional(),
  target_audience_primary: z.enum(['new_customers', 'loyal', 'vip', 'general']).optional()
});

/**
 * POST /api/v1/brand/analyze-enhanced
 * Start enhanced brand analysis
 */
router.post('/analyze-enhanced', authenticate, async (req: Request, res: Response) => {
  try {
    const validation = analyzeWebsiteSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { websiteUrl, exampleEmails, competitorUrls } = validation.data;
    const userId = (req as any).user.userId;

    const result = await brandService.analyzeWebsiteEnhanced(
      websiteUrl,
      userId,
      { exampleEmails, competitorUrls }
    );

    res.json({
      success: true,
      jobId: result.jobId,
      message: result.message,
      estimatedTime: '2-5 minutes'
    });

  } catch (error: any) {
    console.error('Brand analysis error:', error);
    res.status(500).json({
      error: 'Failed to start brand analysis',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/brand/analysis/:jobId
 * Get analysis status and results
 */
router.get('/analysis/:jobId', authenticate, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const status = await brandService.getAnalysisStatus(jobId);

    if (status.status === 'not_found') {
      return res.status(404).json({
        error: 'Analysis job not found'
      });
    }

    if (status.status === 'completed') {
      const userId = (req as any).user.userId;
      const profile = await brandService.getEnhancedProfile(userId);
      
      return res.json({
        status: 'completed',
        completedAt: status.completedAt,
        profile
      });
    }

    res.json({
      status: status.status,
      message: status.status === 'processing' 
        ? 'Analysis in progress...' 
        : status.status === 'pending'
        ? 'Analysis queued...'
        : 'Analysis failed',
      updatedAt: status.updatedAt
    });

  } catch (error: any) {
    console.error('Get analysis status error:', error);
    res.status(500).json({
      error: 'Failed to get analysis status',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/brand/profile
 * Get current brand profile
 */
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const profile = await brandService.getEnhancedProfile(userId);

    if (!profile) {
      return res.status(404).json({
        error: 'Brand profile not found',
        message: 'Please analyze your website first'
      });
    }

    res.json({
      success: true,
      profile
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get brand profile',
      message: error.message
    });
  }
});

/**
 * PATCH /api/v1/brand/profile
 * Update brand profile (manual refinement)
 */
router.patch('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const validation = updateProfileSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const userId = (req as any).user.userId;
    await brandService.updateProfile(userId, validation.data as any);

    res.json({
      success: true,
      message: 'Brand profile updated successfully'
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update brand profile',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/brand/examples
 * Add example email references
 */
router.post('/examples', authenticate, async (req: Request, res: Response) => {
  try {
    const { url, notes, liked_elements } = req.body;

    if (!url || !notes) {
      return res.status(400).json({
        error: 'URL and notes are required'
      });
    }

    const userId = (req as any).user.userId;
    
    // Get current profile
    const profile = await brandService.getEnhancedProfile(userId);
    
    if (!profile) {
      return res.status(404).json({
        error: 'Brand profile not found'
      });
    }

    // Add new example
    const examples = profile.example_emails || [];
    examples.push({
      url,
      notes,
      liked_elements: liked_elements || []
    });

    // Update profile
    await db.query(
      `UPDATE brand_profiles 
       SET example_emails = $1, updated_at = NOW() 
       WHERE user_id = $2`,
      [JSON.stringify(examples), userId]
    );

    res.json({
      success: true,
      message: 'Example email added successfully'
    });

  } catch (error: any) {
    console.error('Add example error:', error);
    res.status(500).json({
      error: 'Failed to add example email',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/brand/summary
 * Get a human-readable summary of the brand profile
 */
router.get('/summary', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const profile = await brandService.getEnhancedProfile(userId);

    if (!profile) {
      return res.status(404).json({
        error: 'Brand profile not found'
      });
    }

    // Create a friendly summary
    const summary = {
      brandName: profile.brand_name,
      personality: {
        tone: profile.brand_personality?.tone || 'Not analyzed',
        description: profile.brand_personality?.voice_description || 'Not available',
        adjectives: profile.brand_personality?.adjectives || []
      },
      visualStyle: {
        layout: profile.visual_style?.layout_preference || 'Not set',
        imageStyle: profile.visual_style?.image_style || 'Not set',
        overlayStyle: profile.visual_style?.overlay_style || 'Not set'
      },
      messaging: {
        ctaStyle: profile.messaging_preferences?.cta_style || 'Not set',
        urgency: profile.messaging_preferences?.urgency_level || 'Not set',
        emojiUsage: profile.messaging_preferences?.emoji_usage || 'Not set',
        commonCTAs: profile.messaging_preferences?.common_ctas || []
      },
      colors: profile.color_palette,
      fonts: profile.typography,
      targetAudience: profile.target_audience_primary || 'general',
      keywords: profile.brand_keywords || [],
      analysisStatus: profile.analysis_status,
      lastUpdated: profile.analysis_completed_at
    };

    res.json({
      success: true,
      summary
    });

  } catch (error: any) {
    console.error('Get summary error:', error);
    res.status(500).json({
      error: 'Failed to get brand summary',
      message: error.message
    });
  }
});

export default router;

