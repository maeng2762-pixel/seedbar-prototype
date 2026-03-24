import { Router } from 'express';
import { requireAuth } from '../middleware/requestContext.js';
import { generateArtworkImage, persistArtworkImage } from '../controllers/imageController.js';

const router = Router();

router.post('/generate', requireAuth, generateArtworkImage);
router.post('/persist', requireAuth, persistArtworkImage);

export default router;
