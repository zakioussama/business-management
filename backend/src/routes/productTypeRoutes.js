import express from 'express';
import {
  createProductType,
  getAllProductTypes,
  getProductTypeById,
  updateProductType,
  deleteProductType,
} from '../controllers/productTypeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(authorize('admin', 'supervisor'), createProductType)
  .get(authorize('admin', 'supervisor', 'agent'), getAllProductTypes);

router.route('/:id')
  .get(authorize('admin', 'supervisor', 'agent'), getProductTypeById)
  .put(authorize('admin', 'supervisor'), updateProductType)
  .delete(authorize('admin'), deleteProductType);

export default router;
