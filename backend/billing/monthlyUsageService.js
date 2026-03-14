import crypto from 'crypto';
import { db } from '../db/database.js';
import { getPlanPolicy } from '../config/plans.js';

class MonthlyUsageService {
  _monthKey() {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  _ensure(userId) {
    const monthKey = this._monthKey();
    const found = db
      .prepare('SELECT * FROM monthly_usage WHERE user_id = ? AND month_key = ?')
      .get(userId, monthKey);

    if (found) return found;

    const now = new Date().toISOString();
    const row = {
      id: `usage_${crypto.randomUUID()}`,
      user_id: userId,
      month_key: monthKey,
      generation_count: 0,
      expand_count: 0,
      export_count: 0,
      music_count: 0,
      created_at: now,
      updated_at: now,
    };

    db.prepare(`
      INSERT INTO monthly_usage (
        id, user_id, month_key, generation_count, expand_count, export_count, music_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      row.id,
      row.user_id,
      row.month_key,
      row.generation_count,
      row.expand_count,
      row.export_count,
      row.music_count,
      row.created_at,
      row.updated_at,
    );

    return row;
  }

  getUsage(userId, plan) {
    const usage = this._ensure(userId);
    const policy = getPlanPolicy(plan);
    const generationLimit = policy.monthlyGenerationLimit;
    const remainingGenerations = generationLimit == null
      ? null
      : Math.max(0, generationLimit - Number(usage.generation_count || 0));

    return {
      generationCount: Number(usage.generation_count || 0),
      expandCount: Number(usage.expand_count || 0),
      exportCount: Number(usage.export_count || 0),
      musicCount: Number(usage.music_count || 0),
      monthKey: usage.month_key,
      generationLimit,
      remainingGenerations,
    };
  }

  canConsume(userId, plan, resource) {
    const usage = this._ensure(userId);
    const policy = getPlanPolicy(plan);

    if (resource === 'generation' || resource === 'draft') {
      if (policy.monthlyGenerationLimit == null) return true;
      return Number(usage.generation_count || 0) < policy.monthlyGenerationLimit;
    }

    return true;
  }

  consume(userId, _plan, resource, amount = 1) {
    const usage = this._ensure(userId);

    const next = {
      generation_count: Number(usage.generation_count || 0),
      expand_count: Number(usage.expand_count || 0),
      export_count: Number(usage.export_count || 0),
      music_count: Number(usage.music_count || 0),
    };

    if (resource === 'generation' || resource === 'draft') next.generation_count += amount;
    if (resource === 'expand') next.expand_count += amount;
    if (resource === 'export') next.export_count += amount;
    if (resource === 'externalMusic' || resource === 'music') next.music_count += amount;

    db.prepare(`
      UPDATE monthly_usage
      SET generation_count = ?, expand_count = ?, export_count = ?, music_count = ?, updated_at = ?
      WHERE id = ?
    `).run(
      next.generation_count,
      next.expand_count,
      next.export_count,
      next.music_count,
      new Date().toISOString(),
      usage.id,
    );

    return this.getUsage(userId, _plan);
  }
}

export const monthlyUsageService = new MonthlyUsageService();
