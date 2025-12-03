import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication to all product routes
router.use(protect);

// Define routes with role-based authorization
router
  .route('/')
  .post(authorize('admin', 'supervisor'), createProduct)
  .get(authorize('admin', 'supervisor', 'agent'), getAllProducts);

router
  .route('/:id')
  .get(authorize('admin', 'supervisor', 'agent'), getProductById)
  .put(authorize('admin', 'supervisor'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

export default router;
