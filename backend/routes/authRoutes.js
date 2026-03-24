import { Router } from 'express';
import {
  createSeedAccountsController,
  deleteAccountController,
  listUsersForTestingController,
  loginController,
  logoutController,
  meController,
  refreshController,
  setPlanForTestingController,
  signupController,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/requestContext.js';

const router = Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.get('/me', requireAuth, meController);
router.delete('/account', requireAuth, deleteAccountController);

router.post('/dev/seed', createSeedAccountsController);
router.post('/dev/set-plan', setPlanForTestingController);
router.get('/dev/users', listUsersForTestingController);

export default router;
