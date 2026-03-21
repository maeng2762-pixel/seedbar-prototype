import { Router } from 'express';
import { quotaGuard } from '../middleware/quotaGuard.js';
import { requirePlanCapability } from '../middleware/planGuard.js';
import { step1DraftController, step2ExpandController, regenerateSectionController } from '../controllers/pipelineController.js';

const router = Router();

router.post('/step1/draft', quotaGuard('generation'), step1DraftController);
router.post('/step2/expand', quotaGuard('expand'), step2ExpandController);
router.post('/step2/regenerate/:section', requirePlanCapability('canRegenerateSections', 'Section regeneration is available on paid plans.'), quotaGuard('expand'), regenerateSectionController);

export default router;
