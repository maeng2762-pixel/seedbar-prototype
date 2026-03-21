import { Router } from 'express';
import {
  getBillingProfileController,
  restoreBillingController,
  syncMobileEntitlementController,
} from '../controllers/billingController.js';

const router = Router();

router.get('/me', getBillingProfileController);
router.post('/mobile/sync', syncMobileEntitlementController);
router.post('/mobile/restore', restoreBillingController);

export default router;
