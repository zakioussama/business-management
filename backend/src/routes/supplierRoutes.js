import express from 'express';
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication to all supplier routes
router.use(protect);

// Define routes with role-based authorization
router
  .route('/')
  .post(authorize('admin', 'supervisor'), createSupplier)
  .get(authorize('admin', 'supervisor', 'agent'), getAllSuppliers);

router
  .route('/:id')
  .get(authorize('admin', 'supervisor', 'agent'), getSupplierById)
  .put(authorize('admin', 'supervisor'), updateSupplier)
  .delete(authorize('admin'), deleteSupplier);

export default router;
