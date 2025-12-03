import express from 'express';
import {
    addToCashbox,
    removeFromCashbox,
    getCashboxHistory,
    getCurrentBalance
} from '../controllers/cashboxController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication and role checks to all routes
router.use(protect);
router.use(authorize('admin', 'supervisor'));

// Define routes
router.post('/add', addToCashbox);
router.post('/remove', removeFromCashbox);
router.get('/history', getCashboxHistory);
router.get('/balance', getCurrentBalance);

export default router;
