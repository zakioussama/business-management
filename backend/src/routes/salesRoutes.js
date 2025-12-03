import express from 'express';
import {
    createSale,
    getAllSales,
    getSaleById,
    updateSale,
    renewSale,
    reactivateSale,
    expelSale,
    deleteSale
} from '../controllers/salesController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication to all sales routes
router.use(protect);

// --- Standard CRUD routes ---
router.route('/')
    .post(authorize('admin', 'supervisor', 'agent'), createSale)
    .get(authorize('admin', 'supervisor', 'agent'), getAllSales);

router.route('/:id')
    .get(authorize('admin', 'supervisor', 'agent'), getSaleById)
    .put(authorize('admin', 'supervisor'), updateSale)
    .delete(authorize('admin'), deleteSale);

// --- Custom business logic routes ---
router.put('/:id/renew', authorize('admin', 'supervisor'), renewSale);
router.put('/:id/reactivate', authorize('admin', 'supervisor'), reactivateSale);
router.put('/:id/expel', authorize('admin', 'supervisor'), expelSale);


export default router;
