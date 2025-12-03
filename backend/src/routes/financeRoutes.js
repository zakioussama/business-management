import express from 'express';
import {
    registerIncome,
    registerExpense,
    getIncomeVsExpenses,
    getFinancialDashboard
} from '../controllers/financeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication and role checks to all routes
router.use(protect);
router.use(authorize('admin', 'supervisor'));

// Define routes
router.get('/dashboard', getFinancialDashboard);
router.get('/movements', getIncomeVsExpenses);
router.post('/income', registerIncome);
router.post('/expense', registerExpense);


export default router;
