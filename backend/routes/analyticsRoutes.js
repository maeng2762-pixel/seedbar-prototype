import { Router } from 'express';
import { getMetricsController } from '../controllers/analyticsController.js';

const router = Router();
router.get('/metrics', getMetricsController);

export default router;
