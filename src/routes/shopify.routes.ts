import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import * as shopifyService from '../services/shopify.service.js';
import * as shopifyEnhanced from '../services/shopify-enhanced.service.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const connectSchema = z.object({
  shopDomain: z.string().min(1),
  accessToken: z.string().startsWith('shpat_'),
});

// POST /api/v1/shopify/connect
router.post('/connect', async (req: AuthRequest, res, next) => {
  try {
    const data = connectSchema.parse(req.body);
    const result = await shopifyService.connectShopify(
      req.user!.id,
      data.shopDomain,
      data.accessToken
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/shopify/products - Use enhanced service
router.get('/products', async (req: AuthRequest, res, next) => {
  try {
    const { collectionId, minInventory, inStockOnly, productType, search, limit } = req.query;
    
    const products = await shopifyEnhanced.getProducts(req.user!.id, {
      collectionId: collectionId as string,
      minInventory: minInventory ? parseInt(minInventory as string) : undefined,
      inStockOnly: inStockOnly === 'true',
      productType: productType as string,
      search: search as string,
    });
    
    // Limit results
    const limitNum = limit ? parseInt(limit as string) : 50;
    res.json({ products: products.slice(0, limitNum), count: products.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/shopify/collections
router.get('/collections', async (req: AuthRequest, res, next) => {
  try {
    const collections = await shopifyService.fetchCollections(req.user!.id);
    res.json({ collections });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/shopify/products/search
router.get('/products/search', async (req: AuthRequest, res, next) => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const products = await shopifyService.searchProducts(
      req.user!.id,
      q as string,
      limit ? parseInt(limit as string) : 20
    );
    res.json({ products, count: products.length });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/shopify/sync - Enhanced sync with full data
router.post('/sync', async (req: AuthRequest, res, next) => {
  try {
    const result = await shopifyEnhanced.syncCatalogEnhanced(req.user!.id);
    res.json({
      message: 'Shopify catalog synced successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/shopify/collections
router.get('/collections', async (req: AuthRequest, res, next) => {
  try {
    const collections = await shopifyEnhanced.getCollections(req.user!.id);
    res.json({ collections });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/shopify/products-enhanced - With filters
router.get('/products-enhanced', async (req: AuthRequest, res, next) => {
  try {
    const { collectionId, minInventory, inStockOnly, productType, search } = req.query;
    
    const products = await shopifyEnhanced.getProducts(req.user!.id, {
      collectionId: collectionId as string,
      minInventory: minInventory ? parseInt(minInventory as string) : undefined,
      inStockOnly: inStockOnly === 'true',
      productType: productType as string,
      search: search as string,
    });
    
    res.json({ products, count: products.length });
  } catch (error) {
    next(error);
  }
});

export default router;

