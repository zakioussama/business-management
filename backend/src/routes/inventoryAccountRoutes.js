import express from 'express';
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} from '../controllers/inventoryAccountController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Define routes with role-based authorization
router
  .route('/')
  .post(authorize('admin', 'supervisor'), createAccount)
  .get(authorize('admin', 'supervisor', 'agent'), getAllAccounts);

router
  .route('/:id')
  .get(authorize('admin', 'supervisor', 'agent'), getAccountById)
  .put(authorize('admin', 'supervisor'), updateAccount)
  .delete(authorize('admin'), deleteAccount);

export default router;
