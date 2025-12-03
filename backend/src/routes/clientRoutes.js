import express from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientSalesHistory,
} from '../controllers/clientController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(authorize('admin', 'supervisor', 'agent'), createClient)
  .get(authorize('admin', 'supervisor', 'agent'), getAllClients);
  
router.get('/:id/sales', authorize('admin', 'supervisor', 'agent'), getClientSalesHistory);

router.route('/:id')
  .get(authorize('admin', 'supervisor', 'agent'), getClientById)
  .put(authorize('admin', 'supervisor'), updateClient)
  .delete(authorize('admin'), deleteClient);

export default router;
