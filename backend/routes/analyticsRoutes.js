import { Router } from 'express';
import { getMetricsController, postRuntimeErrorController } from '../controllers/analyticsController.js';

const router = Router();
router.get('/metrics', getMetricsController);
router.post('/runtime-error', postRuntimeErrorController);

export default router;
