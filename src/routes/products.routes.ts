import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import * as productService from '../services/product-catalog.service.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/products - Get all products
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { category, search, limit } = req.query;
    
    const products = await productService.fetchProducts(req.user!.id, {
      category: category as string,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    
    res.json({ products, count: products.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/products/categories - Get all categories
router.get('/categories', async (req: AuthRequest, res, next) => {
  try {
    const categories = await productService.fetchCategories(req.user!.id);
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/products/search - Search products
router.get('/search', async (req: AuthRequest, res, next) => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const products = await productService.searchProducts(
      req.user!.id,
      q as string,
      limit ? parseInt(limit as string) : 20
    );
    
    res.json({ products, count: products.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/products/:id - Get specific product
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const product = await productService.getProduct(req.user!.id, req.params.id);
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/products/sync - Sync product catalog
router.post('/sync', async (req: AuthRequest, res, next) => {
  try {
    const result = await productService.syncProductCatalog(req.user!.id);
    res.json({
      message: 'Product catalog synced successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

