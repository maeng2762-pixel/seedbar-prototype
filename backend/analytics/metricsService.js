class MetricsService {
  constructor() {
    this.events = [];
    this.counters = new Map();
  }

  inc(metric, n = 1) {
    this.counters.set(metric, (this.counters.get(metric) || 0) + n);
  }

  track(event) {
    this.events.push({ ...event, at: new Date().toISOString() });
    if (this.events.length > 3000) this.events.shift();
  }

  withTiming(name, fn) {
    const start = Date.now();
    return Promise.resolve(fn()).then((result) => {
      this.track({ type: 'timing', name, ms: Date.now() - start });
      return result;
    }).catch((error) => {
      this.track({ type: 'timing', name, ms: Date.now() - start, failed: true, error: error.message });
      throw error;
    });
  }

  estimateTokens(text = '') {
    return Math.ceil(String(text).length / 4);
  }

  snapshot() {
    return {
      counters: Object.fromEntries(this.counters.entries()),
      recentEvents: this.events.slice(-200),
    };
  }
}

export const metricsService = new MetricsService();
