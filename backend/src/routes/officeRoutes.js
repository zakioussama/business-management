import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getFinanceToday, getProfitabilityReport, addAttendanceRecord, getAttendanceRecords } from '../controllers/officeController.js';
import { addToCashbox, getCashboxHistory } from '../controllers/cashboxController.js';

const router = express.Router();

// All office routes are protected and for supervisors/admins
router.use(protect, authorize('admin', 'supervisor'));

// Finance
router.get('/finance/today', getFinanceToday);
router.get('/finance/profitability', getProfitabilityReport);

// Attendance
router.post('/attendance', addAttendanceRecord);
router.get('/attendance', getAttendanceRecords);

// Petty Cash (reusing cashbox logic)
router.post('/petty-cash', addToCashbox); // Note: This maps to addToCashbox, which handles both ADD and REMOVE
router.get('/petty-cash', getCashboxHistory);

export default router;
