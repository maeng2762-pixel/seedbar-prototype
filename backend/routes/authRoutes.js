import { Router } from 'express';
import {
  createSeedAccountsController,
  listUsersForTestingController,
  loginController,
  logoutController,
  meController,
  setPlanForTestingController,
  signupController,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/requestContext.js';

const router = Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/logout', logoutController);
router.get('/me', requireAuth, meController);

router.post('/dev/seed', createSeedAccountsController);
router.post('/dev/set-plan', setPlanForTestingController);
router.get('/dev/users', listUsersForTestingController);

export default router;
