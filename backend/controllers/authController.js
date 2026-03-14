import { loginWithEmail, registerWithEmail } from '../services/authService.js';
import { ensureUser, listUsers, setUserPlanByEmail } from '../models/userModel.js';

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
    const { user, accessToken } = registerWithEmail({ email, password });
    return res.status(201).json({ ok: true, user: responseUser(user), accessToken });
  } catch (error) {
    return res.status(error?.status || 500).json({ ok: false, error: error.message || 'Signup failed.' });
  }
}

export function loginController(req, res) {
  try {
    const { email, password } = req.body || {};
    const { user, accessToken } = loginWithEmail({ email, password });
    return res.json({ ok: true, user: responseUser(user), accessToken });
  } catch (error) {
    return res.status(error?.status || 500).json({ ok: false, error: error.message || 'Login failed.' });
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

export function createSeedAccountsController(_req, res) {
  if (process.env.DEV_AUTH_SEED !== 'true') {
    return res.status(403).json({ ok: false, error: 'DEV_AUTH_SEED must be true.' });
  }

  const free = ensureUser('free@seedbar.dev', 'free', 'seedbar1234');
  const pro = ensureUser('pro@seedbar.dev', 'pro', 'seedbar1234');
  const studio = ensureUser('expert@seedbar.dev', 'studio', 'seedbar1234');

  return res.json({
    ok: true,
    accounts: [responseUser(free), responseUser(pro), responseUser(studio)],
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
