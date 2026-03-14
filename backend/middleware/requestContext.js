import { getUserById } from '../models/userModel.js';
import { normalizePlan } from '../config/plans.js';
import { verifyAccessToken } from '../services/authService.js';

function parseBearer(authHeader = '') {
  const [scheme, token] = String(authHeader).split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export function requestContext(req, _res, next) {
  const token = parseBearer(req.headers.authorization || '');
  let user = null;

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      user = getUserById(payload.sub);
    } catch {
      user = null;
    }
  }

  const fallbackPlan = normalizePlan(req.headers['x-plan'] || 'free');
  req.context = {
    userId: user?.id || null,
    plan: user?.plan || fallbackPlan,
    user,
    isAuthenticated: Boolean(user),
  };

  next();
}

export function requireAuth(req, res, next) {
  if (!req.context?.isAuthenticated || !req.context?.userId) {
    return res.status(401).json({ ok: false, error: 'Authentication required.' });
  }
  next();
}
