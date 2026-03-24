import { apiUrl } from '../lib/apiClient.js';
import { getAuthHeaders, getStoredUser } from '../lib/authClient.js';

const runtimeState = {
  installed: false,
  fetchWrapped: false,
  currentRoute: '/',
  lastAction: '',
  lastActionAt: 0,
  recentEvents: new Map(),
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function compactString(value, max = 300) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function classifyRuntimeCategory(message = '', fallback = 'client_error') {
  const normalized = String(message || '').toLowerCase();
  if (!normalized) return fallback;
  if (normalized.includes('result_code_hung')) return 'result_code_hung';
  if (normalized.includes('objects are not valid as a react child')) return 'react_render_error';
  if (normalized.includes('undefined')) return 'undefined_field';
  if (normalized.includes('render') || normalized.includes('hydration')) return 'react_render_error';
  if (normalized.includes('timeout') || normalized.includes('hung') || normalized.includes('freeze')) return 'runtime_hang';
  if (normalized.includes('non_json')) return 'api_non_json';
  return fallback;
}

function dedupeKey(payload) {
  return [
    payload.category,
    payload.page,
    payload.message,
    payload.lastAction,
  ].join('::');
}

function shouldSend(payload) {
  const key = dedupeKey(payload);
  const now = Date.now();
  const lastSent = runtimeState.recentEvents.get(key) || 0;
  if (now - lastSent < 8000) return false;
  runtimeState.recentEvents.set(key, now);
  if (runtimeState.recentEvents.size > 200) {
    const oldestKey = runtimeState.recentEvents.keys().next().value;
    runtimeState.recentEvents.delete(oldestKey);
  }
  return true;
}

function extractActionLabel(target) {
  if (!target?.closest) return '';
  const actionable = target.closest('button, a, [role="button"], input[type="button"], input[type="submit"], [data-diagnostic-action]');
  if (!actionable) return '';
  return compactString(
    actionable.getAttribute?.('data-diagnostic-action')
      || actionable.getAttribute?.('aria-label')
      || actionable.textContent
      || actionable.id
      || actionable.className,
    180,
  );
}

function buildPayload(payload = {}) {
  const user = getStoredUser();
  return {
    category: payload.category || classifyRuntimeCategory(payload.message),
    severity: payload.severity || 'error',
    page: compactString(payload.page || runtimeState.currentRoute || window.location.pathname, 200),
    lastAction: compactString(payload.lastAction || runtimeState.lastAction, 200),
    lastActionAt: runtimeState.lastActionAt ? new Date(runtimeState.lastActionAt).toISOString() : null,
    message: compactString(payload.message || 'Unknown runtime issue', 2000),
    stack: compactString(payload.stack || '', 6000),
    meta: {
      ...(payload.meta || {}),
      userId: user?.id || null,
      plan: user?.plan || 'free',
      viewport: isBrowser() ? `${window.innerWidth}x${window.innerHeight}` : '',
      href: isBrowser() ? window.location.href : '',
    },
  };
}

async function postRuntimePayload(payload, useBeacon = false) {
  if (!isBrowser()) return false;
  const finalPayload = buildPayload(payload);
  if (!shouldSend(finalPayload)) return false;

  const url = apiUrl('/api/analytics/runtime-error');
  const body = JSON.stringify(finalPayload);

  if (useBeacon && navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return true;
    } catch {
      // fall through to fetch
    }
  }

  try {
    await window.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body,
      keepalive: true,
    });
    return true;
  } catch {
    return false;
  }
}

function handlePointerDown(event) {
  const label = extractActionLabel(event.target);
  if (!label) return;
  runtimeState.lastAction = label;
  runtimeState.lastActionAt = Date.now();
}

function handleWindowError(event) {
  if (event?.target && event.target !== window) {
    const tagName = event.target?.tagName || '';
    if (tagName === 'IMG') {
      postRuntimePayload({
        category: 'broken_thumbnail',
        severity: 'warn',
        message: `Image failed to load: ${event.target?.currentSrc || event.target?.src || ''}`,
        meta: {
          tagName,
          src: compactString(event.target?.currentSrc || event.target?.src || '', 500),
        },
      }, true);
      return;
    }
  }

  const message = event?.message || event?.error?.message || 'Unknown window error';
  postRuntimePayload({
    category: classifyRuntimeCategory(message, 'client_error'),
    message,
    stack: event?.error?.stack || '',
    meta: {
      filename: event?.filename || '',
      lineno: event?.lineno || 0,
      colno: event?.colno || 0,
    },
  }, true);
}

function handleUnhandledRejection(event) {
  const reason = event?.reason;
  const message = compactString(
    reason?.message
      || (typeof reason === 'string' ? reason : JSON.stringify(reason || {})),
    2000,
  );
  postRuntimePayload({
    category: classifyRuntimeCategory(message, 'unhandled_rejection'),
    message,
    stack: reason?.stack || '',
    meta: {
      type: 'unhandledrejection',
    },
  }, true);
}

function shouldTraceFetch(url = '') {
  return url.includes('/api/') && !url.includes('/api/analytics/runtime-error');
}

function installFetchProbe() {
  if (!isBrowser() || runtimeState.fetchWrapped) return;
  runtimeState.fetchWrapped = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const startedAt = Date.now();

    try {
      const response = await originalFetch(input, init);
      const durationMs = Date.now() - startedAt;

      if (shouldTraceFetch(url)) {
        if (!response.ok) {
          postRuntimePayload({
            category: 'api_response_error',
            severity: 'warn',
            message: `API ${response.status} for ${url}`,
            meta: {
              method: init?.method || 'GET',
              status: response.status,
              url,
              durationMs,
            },
          });
        } else if (durationMs > 12000) {
          postRuntimePayload({
            category: 'api_slow_response',
            severity: 'warn',
            message: `Slow API response (${durationMs}ms): ${url}`,
            meta: {
              method: init?.method || 'GET',
              status: response.status,
              url,
              durationMs,
            },
          });
        }
      }

      return response;
    } catch (error) {
      if (shouldTraceFetch(url)) {
        postRuntimePayload({
          category: 'api_network_error',
          message: error?.message || `Fetch failed: ${url}`,
          stack: error?.stack || '',
          meta: {
            method: init?.method || 'GET',
            url,
            durationMs: Date.now() - startedAt,
          },
        });
      }
      throw error;
    }
  };
}

export function setRuntimeRoute(route) {
  runtimeState.currentRoute = compactString(route || '/', 200);
}

export function reportRuntimeDiagnostic(payload, options = {}) {
  return postRuntimePayload(payload, Boolean(options.useBeacon));
}

export function installRuntimeDiagnostics() {
  if (!isBrowser() || runtimeState.installed) return;
  runtimeState.installed = true;
  installFetchProbe();
  document.addEventListener('pointerdown', handlePointerDown, true);
  window.addEventListener('error', handleWindowError, true);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
}
