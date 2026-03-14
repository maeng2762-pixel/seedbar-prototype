import crypto from 'crypto';

class CacheService {
  constructor() {
    this.store = new Map();
  }

  buildKey(namespace, payload) {
    const raw = JSON.stringify(payload || {});
    const hash = crypto.createHash('sha1').update(raw).digest('hex');
    return `${namespace}:${hash}`;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds = 600) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
    return value;
  }

  del(key) {
    this.store.delete(key);
  }
}

export const cacheService = new CacheService();

export const CACHE_TTL = {
  step1Draft: 60 * 30,
  step2Expand: 60 * 60,
  musicCandidates: 60 * 60,
  theoryBlock: 60 * 60,
  exportPayload: 60 * 60 * 6,
  externalMusicSearch: 60 * 60 * 12,
};
