import express from 'express';
import { triggerExpiryWarnings } from '../controllers/automationController.js';

const router = express.Router();

// This route is intended to be called by a scheduled job (e.g., cron)
// so it does not have standard user authentication.
// For production, it should be secured (e.g., by a secret key or IP whitelist).
router.post('/trigger-expiry-warnings', triggerExpiryWarnings);

export default router;
