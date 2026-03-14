import { Router } from 'express';
import { quotaGuard } from '../middleware/quotaGuard.js';
import { createExportJobController, getExportJobController, retryExportJobController } from '../controllers/exportController.js';

const router = Router();

router.post('/jobs', quotaGuard('export'), createExportJobController);
router.get('/jobs/:jobId', getExportJobController);
router.post('/jobs/:jobId/retry', retryExportJobController);

export default router;
