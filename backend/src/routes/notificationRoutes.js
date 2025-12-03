import express from 'express';
import {
    getMyNotifications,
    markAsRead
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication to all notification routes
router.use(protect);

router.route('/')
    .get(getMyNotifications);

router.route('/mark-read/:id')
    .post(markAsRead);


export default router;
