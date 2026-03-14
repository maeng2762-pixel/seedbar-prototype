import { Router } from 'express';
import { consumeGenerationController, getPlanCapabilitiesController } from '../controllers/planController.js';

const router = Router();
router.get('/capabilities', getPlanCapabilitiesController);
router.post('/consume-generation', consumeGenerationController);

export default router;
