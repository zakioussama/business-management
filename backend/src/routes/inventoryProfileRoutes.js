import express from 'express';
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
} from '../controllers/inventoryProfileController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Define routes with role-based authorization
router
  .route('/')
  .post(authorize('admin', 'supervisor'), createProfile)
  .get(authorize('admin', 'supervisor', 'agent'), getAllProfiles);

router
  .route('/:id')
  .get(authorize('admin', 'supervisor', 'agent'), getProfileById)
  .put(authorize('admin', 'supervisor'), updateProfile)
  .delete(authorize('admin'), deleteProfile);

export default router;
