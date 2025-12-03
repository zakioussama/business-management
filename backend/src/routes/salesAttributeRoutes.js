import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { createSalesAttribute, getSalesAttributesForProduct, deleteSalesAttribute } from '../controllers/salesAttributeController.js';

const router = express.Router();

router.use(protect, authorize('admin', 'supervisor'));

router.post('/', createSalesAttribute);
router.get('/product/:productId', getSalesAttributesForProduct);
router.delete('/:id', deleteSalesAttribute);

export default router;
