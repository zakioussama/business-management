import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getDebtorClientsReport, getOldestClientsReport } from '../controllers/reportController.js';

const router = express.Router();

// All report routes are protected and restricted to supervisors and admins
router.use(protect, authorize('admin', 'supervisor'));

router.get('/clients/debtors', getDebtorClientsReport);
router.get('/clients/oldest', getOldestClientsReport);

export default router;
