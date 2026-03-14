import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { normalizePlan } from '../config/plans.js';

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    plan: normalizePlan(row.plan),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createUser({ email, password, plan = 'free' }) {
  const id = `usr_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const normalizedPlan = normalizePlan(plan);
  const passwordHash = bcrypt.hashSync(password, 10);

  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, plan, created_at, updated_at)
    VALUES (@id, @email, @passwordHash, @plan, @createdAt, @updatedAt)
  `);

  stmt.run({
    id,
    email: String(email).trim().toLowerCase(),
    passwordHash,
    plan: normalizedPlan,
    createdAt: now,
    updatedAt: now,
  });

  return getUserById(id);
}

export function getUserByEmail(email) {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  return mapUser(row);
}

export function getUserAuthByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase()) || null;
}

export function getUserById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(String(id));
  return mapUser(row);
}

export function verifyPassword(email, password) {
  const row = getUserAuthByEmail(email);
  if (!row) return null;
  const ok = bcrypt.compareSync(String(password), row.password_hash);
  if (!ok) return null;
  return mapUser(row);
}

export function setUserPlan(userId, plan) {
  const now = new Date().toISOString();
  const normalizedPlan = normalizePlan(plan);
  db.prepare('UPDATE users SET plan = ?, updated_at = ? WHERE id = ?').run(normalizedPlan, now, userId);
  return getUserById(userId);
}

export function setUserPlanByEmail(email, plan) {
  const user = getUserByEmail(email);
  if (!user) return null;
  return setUserPlan(user.id, plan);
}

export function countUsers() {
  const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
  return Number(row?.count || 0);
}

export function listUsers() {
  const rows = db.prepare('SELECT id, email, plan, created_at, updated_at FROM users ORDER BY created_at DESC').all();
  return rows.map(mapUser);
}

export function ensureUser(email = 'seedbar-free@example.com', plan = 'free', password = 'seedbar1234') {
  const existing = getUserByEmail(email);
  if (existing) {
    if (plan && existing.plan !== normalizePlan(plan)) {
      return setUserPlan(existing.id, plan);
    }
    return existing;
  }
  return createUser({ email, password, plan });
}
