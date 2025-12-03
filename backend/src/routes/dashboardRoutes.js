import express from 'express';
import {
    getAdminDashboard,
    getSupervisorDashboard,
    getAgentDashboard
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication to all dashboard routes
router.use(protect);

// Define routes with specific role authorization
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/supervisor', authorize('admin', 'supervisor'), getSupervisorDashboard);
router.get('/agent', authorize('admin', 'supervisor', 'agent'), getAgentDashboard);

export default router;
