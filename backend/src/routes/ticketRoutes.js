import express from 'express';
import {
    createTicket,
    getTickets,
    getTicketById,
    assignTicket,
    updateTicketStatus,
    deleteTicket
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication to all ticket routes
router.use(protect);

// --- Standard CRUD routes ---
router.route('/')
    .post(authorize('admin', 'supervisor', 'agent'), createTicket)
    .get(authorize('admin', 'supervisor', 'agent'), getTickets);

router.route('/:id')
    .get(authorize('admin', 'supervisor', 'agent'), getTicketById)
    .delete(authorize('admin'), deleteTicket);

// --- Custom business logic routes ---
router.put('/:id/assign', authorize('admin', 'supervisor'), assignTicket);
router.put('/:id/status', authorize('admin', 'supervisor'), updateTicketStatus);

export default router;
