import express from 'express';
import { getAdminData } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Get data for admin role only
// @route   GET /api/users/admin-only
// @access  Private/Admin
router.get(
    '/admin-only', 
    protect, // First, ensure the user is authenticated
    authorize('admin'), // Then, ensure the user has the 'admin' role
    getAdminData
);

export default router;
