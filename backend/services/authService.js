import jwt from 'jsonwebtoken';
import {
  createUser,
  getUserByEmail,
  getUserById,
  verifyPassword,
} from '../models/userModel.js';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '180d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is missing or too short. Set at least 16 characters.');
  }
  return secret;
}

function getRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET || getJwtSecret();
}

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      plan: user.plan,
      type: 'access',
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN },
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      plan: user.plan,
      type: 'refresh',
    },
    getRefreshSecret(),
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, getRefreshSecret());
  if (payload?.type !== 'refresh') {
    const error = new Error('Invalid refresh token.');
    error.status = 401;
    throw error;
  }
  return payload;
}

export function registerWithEmail({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    const err = new Error('Valid email is required.');
    err.status = 400;
    throw err;
  }

  if (rawPassword.length < 8) {
    const err = new Error('Password must be at least 8 characters.');
    err.status = 400;
    throw err;
  }

  const exists = getUserByEmail(normalizedEmail);
  if (exists) {
    const err = new Error('Email already exists.');
    err.status = 409;
    throw err;
  }

  const user = createUser({ email: normalizedEmail, password: rawPassword, plan: 'free' });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return { user, accessToken, refreshToken };
}

export function loginWithEmail({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = verifyPassword(normalizedEmail, String(password || ''));
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return { user, accessToken, refreshToken };
}

export function getSessionUser(userId) {
  return getUserById(userId);
}
