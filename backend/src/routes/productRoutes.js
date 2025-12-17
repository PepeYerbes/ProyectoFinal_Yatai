import express from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  getProductByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '../controllers/productController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validate from '../middlewares/validation.js';
import { query } from 'express-validator';

const router = express.Router();

router.get('', [
  query('page')
    .optional()
    .isNumeric().withMessage('Page parameter must be a number'),
  query('limit')
    .optional()
    .isNumeric().withMessage('Limit parameter must be a number'),
], validate, getProducts);
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/category/:idCategory', getProductByCategory);
router.get('/categories/:idCategory/products', getProductByCategory);
router.get('/:id', getProductById);
router.post('', authMiddleware, isAdmin, createProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

export default router;