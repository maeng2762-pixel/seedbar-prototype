import { Router } from 'express';
import { getMusicHealthController, postMusicRecommendController } from '../controllers/musicController.js';

const router = Router();

router.get('/health', getMusicHealthController);
router.post('/recommend', postMusicRecommendController);

export default router;
