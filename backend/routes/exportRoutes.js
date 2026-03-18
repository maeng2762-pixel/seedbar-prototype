import { Router } from 'express';
import { quotaGuard } from '../middleware/quotaGuard.js';
import { createExportJobController, getExportJobController, retryExportJobController, generateExportPackageController } from '../controllers/exportController.js';

const router = Router();

router.post('/jobs', quotaGuard('export'), createExportJobController);
router.get('/jobs/:jobId', getExportJobController);
router.post('/jobs/:jobId/retry', retryExportJobController);

// Generate PPT package
router.post('/package', quotaGuard('export'), generateExportPackageController);

export default router;
