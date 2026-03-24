import {
  loginWithEmail,
  registerWithEmail,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../services/authService.js';
import {
  deleteUserById,
  ensureUser,
  getUserById,
  listUsers,
  setUserPlanByEmail,
} from '../models/userModel.js';

function responseUser(user) {
  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function signupController(req, res) {
  try {
    const { email, password } = req.body || {};
    const { user, accessToken, refreshToken } = registerWithEmail({ email, password });
    return res.status(201).json({ ok: true, user: responseUser(user), accessToken, refreshToken });
  } catch (error) {
    return res.status(error?.status || 500).json({ ok: false, error: error.message || 'Signup failed.' });
  }
}

export function loginController(req, res) {
  try {
    const { email, password } = req.body || {};
    const { user, accessToken, refreshToken } = loginWithEmail({ email, password });
    return res.json({ ok: true, user: responseUser(user), accessToken, refreshToken });
  } catch (error) {
    return res.status(error?.status || 500).json({ ok: false, error: error.message || 'Login failed.' });
  }
}

export function refreshController(req, res) {
  try {
    const refreshToken = String(req.body?.refreshToken || '').trim();
    if (!refreshToken) {
      return res.status(401).json({ ok: false, error: 'Refresh token is required.' });
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Refresh session is no longer valid.' });
    }

    const nextAccessToken = signAccessToken(user);
    const nextRefreshToken = signRefreshToken(user);
    return res.json({
      ok: true,
      user: responseUser(user),
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    });
  } catch (error) {
    return res.status(error?.status || 401).json({ ok: false, error: error.message || 'Failed to refresh session.' });
  }
}

export function meController(req, res) {
  if (!req.context?.isAuthenticated || !req.context?.user) {
    return res.status(401).json({ ok: false, error: 'Not authenticated.' });
  }
  return res.json({ ok: true, user: responseUser(req.context.user) });
}

export function logoutController(_req, res) {
  return res.json({ ok: true });
}

export function deleteAccountController(req, res) {
  if (!req.context?.isAuthenticated || !req.context?.userId) {
    return res.status(401).json({ ok: false, error: 'Not authenticated.' });
  }

  const deleted = deleteUserById(req.context.userId);
  if (!deleted) {
    return res.status(404).json({ ok: false, error: 'Account not found.' });
  }

  return res.json({ ok: true, deleted: true });
}

export function createSeedAccountsController(_req, res) {
  if (process.env.DEV_AUTH_SEED !== 'true') {
    return res.status(403).json({ ok: false, error: 'DEV_AUTH_SEED must be true.' });
  }

  const studio = ensureUser('studio@seedbar.dev', 'studio', 'seedbar1234');

  return res.json({
    ok: true,
    accounts: [responseUser(studio)],
  });
}

export function setPlanForTestingController(req, res) {
  if (process.env.DEV_AUTH_SEED !== 'true') {
    return res.status(403).json({ ok: false, error: 'DEV_AUTH_SEED must be true.' });
  }

  const { email, plan } = req.body || {};
  if (!email || !plan) {
    return res.status(400).json({ ok: false, error: 'email and plan are required.' });
  }

  const user = setUserPlanByEmail(email, plan);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found.' });

  return res.json({ ok: true, user: responseUser(user) });
}

export function listUsersForTestingController(_req, res) {
  if (process.env.DEV_AUTH_SEED !== 'true') {
    return res.status(403).json({ ok: false, error: 'DEV_AUTH_SEED must be true.' });
  }
  return res.json({ ok: true, users: listUsers().map(responseUser) });
}
