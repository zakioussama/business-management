import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getMyProfile, getMySales, getMyTickets, createTicket, requestRenewal } from '../controllers/clientPortalController.js';

const router = express.Router();

// All portal routes are protected and restricted to clients
router.use(protect, authorize('client'));

router.get('/me', getMyProfile);
router.get('/sales', getMySales);
router.get('/tickets', getMyTickets);
router.post('/tickets', createTicket);
router.post('/sales/:id/renewal-request', requestRenewal);

export default router;
