import express from 'express';
import {
    createExpense,
    listExpenses,
    deleteExpense
} from '../controllers/expensesController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication and role checks to all routes in this module
router.use(protect);
router.use(authorize('admin', 'supervisor'));

// Define routes
router.route('/')
    .post(createExpense)
    .get(listExpenses);

router.route('/:id')
    .delete(authorize('admin'), deleteExpense); // Only admin can delete

export default router;
