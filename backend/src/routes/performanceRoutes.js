import express from 'express';
import {
    logDailyPerformance,
    getAgentPerformance,
    getTeamLeaderboard
} from '../controllers/performanceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication and role checks to all routes
router.use(protect);
router.use(authorize('admin', 'supervisor'));

// Define routes
router.route('/')
    .post(logDailyPerformance);

router.route('/leaderboard')
    .get(getTeamLeaderboard);

router.route('/agent/:id')
    .get(getAgentPerformance);

export default router;
