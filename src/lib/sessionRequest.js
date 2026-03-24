import { apiUrl } from './apiClient.js';
import {
  clearAuthStorage,
  getAccessToken,
  getAuthHeaders,
  getRefreshToken,
} from './authClient.js';
import useAuthStore from '../store/useAuthStore.js';
import { reportRuntimeDiagnostic } from '../services/runtimeDiagnostics.js';

function isJsonLikeBody(body) {
  if (!body) return false;
  if (typeof body === 'string') return false;
  if (typeof FormData !== 'undefined' && body instanceof FormData) return false;
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return false;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return false;
  return typeof body === 'object';
}

function isAbsoluteUrl(value = '') {
  return /^https?:\/\//i.test(String(value || ''));
}

async function parseResponsePayload(response, url) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return {
      contentType,
      data: await response.json(),
      rawText: '',
    };
  }

  const rawText = await response.text();
  return {
    contentType,
    data: null,
    rawText,
    preview: rawText.slice(0, 160).replace(/\s+/g, ' '),
    url,
  };
}

export class ApiRequestError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = options.status || 0;
    this.type = options.type || 'server';
    this.code = options.code || '';
    this.url = options.url || '';
    this.data = options.data || null;
    this.retryable = Boolean(options.retryable);
    this.featureKey = options.featureKey || 'api_request';
  }
}

function classifyResponseError(response, payload, featureKey) {
  const message = payload?.data?.error
    || payload?.data?.message
    || (payload?.preview ? `NON_JSON:${response.status}:${payload.url}:${payload.preview}` : '')
    || `Request failed with status ${response.status}`;

  if (response.status === 401) {
    return new ApiRequestError(message, {
      status: 401,
      type: 'auth',
      code: 'session_expired',
      url: payload?.url,
      data: payload?.data,
      retryable: true,
      featureKey,
    });
  }

  if (response.status === 403) {
    return new ApiRequestError(message, {
      status: 403,
      type: 'plan',
      code: 'forbidden',
      url: payload?.url,
      data: payload?.data,
      retryable: false,
      featureKey,
    });
  }

  if (response.status === 400 || response.status === 422) {
    return new ApiRequestError(message, {
      status: response.status,
      type: 'validation',
      code: /missing|required/i.test(message) ? 'missing_data' : 'invalid_request',
      url: payload?.url,
      data: payload?.data,
      retryable: false,
      featureKey,
    });
  }

  if (response.status === 429) {
    return new ApiRequestError(message, {
      status: 429,
      type: 'server',
      code: 'rate_limited',
      url: payload?.url,
      data: payload?.data,
      retryable: true,
      featureKey,
    });
  }

  if (response.status === 503) {
    return new ApiRequestError(message, {
      status: 503,
      type: 'config',
      code: 'service_unavailable',
      url: payload?.url,
      data: payload?.data,
      retryable: true,
      featureKey,
    });
  }

  return new ApiRequestError(message, {
    status: response.status,
    type: response.status >= 500 ? 'server' : 'server',
    code: payload?.preview ? 'non_json_response' : 'request_failed',
    url: payload?.url,
    data: payload?.data,
    retryable: response.status >= 500,
    featureKey,
  });
}

async function attemptSessionRecovery(featureKey) {
  const store = useAuthStore.getState();
  const refreshToken = getRefreshToken();
  const token = getAccessToken();

  if (refreshToken) {
    const refreshed = await store.refreshSession({ silent: true, reason: `${featureKey}_401` });
    if (refreshed) {
      return true;
    }
  }

  if (token) {
    const hydrated = await store.hydrate();
    if (hydrated) {
      return true;
    }
  }

  clearAuthStorage();
  return false;
}

export async function ensureActiveSession(featureKey = 'api_request') {
  const token = getAccessToken();
  if (token) return true;

  const refreshToken = getRefreshToken();
  if (refreshToken) {
    const refreshed = await useAuthStore.getState().refreshSession({
      silent: true,
      reason: `${featureKey}_missing_access_token`,
    });
    if (refreshed) return true;
  }

  reportRuntimeDiagnostic({
    category: 'missing_access_token',
    severity: 'warn',
    message: `Missing access token for ${featureKey}`,
    meta: { featureKey },
  });

  throw new ApiRequestError('Authentication required.', {
    status: 401,
    type: 'auth',
    code: 'missing_access_token',
    featureKey,
  });
}

export async function requestJsonWithSession(path, init = {}, options = {}) {
  const {
    featureKey = 'api_request',
    requireAuth = true,
    retryOnAuth = true,
    timeoutMs = 30000,
  } = options;
  const url = isAbsoluteUrl(path) ? path : apiUrl(path);

  if (requireAuth) {
    await ensureActiveSession(featureKey);
  }

  const headers = new Headers(init.headers || {});
  if (requireAuth) {
    Object.entries(getAuthHeaders()).forEach(([key, value]) => headers.set(key, value));
  }

  const body = isJsonLikeBody(init.body) ? JSON.stringify(init.body) : init.body;
  if (isJsonLikeBody(init.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('request_timeout'), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        body,
        signal: init.signal || controller.signal,
      });
      clearTimeout(timer);

      const payload = await parseResponsePayload(response, url);
      if (response.ok) {
        return {
          response,
          data: payload.data,
          rawText: payload.rawText,
        };
      }

      const classifiedError = classifyResponseError(response, payload, featureKey);
      if (classifiedError.type === 'auth') {
        reportRuntimeDiagnostic({
          category: `${featureKey}_auth_fail`,
          severity: 'warn',
          message: classifiedError.message,
          meta: {
            featureKey,
            status: classifiedError.status,
            code: classifiedError.code,
          },
        });
      }

      if (classifiedError.type === 'auth' && retryOnAuth && attempt === 0) {
        const recovered = await attemptSessionRecovery(featureKey);
        if (recovered) {
          const nextHeaders = new Headers(init.headers || {});
          Object.entries(getAuthHeaders()).forEach(([key, value]) => nextHeaders.set(key, value));
          if (isJsonLikeBody(init.body) && !nextHeaders.has('Content-Type')) {
            nextHeaders.set('Content-Type', 'application/json');
          }
          headers.delete('Authorization');
          nextHeaders.forEach((value, key) => headers.set(key, value));
          continue;
        }
      }

      throw classifiedError;
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof ApiRequestError) throw error;

      if (error?.name === 'AbortError') {
        throw new ApiRequestError('Request timed out.', {
          type: 'timeout',
          code: 'request_timeout',
          url,
          retryable: true,
          featureKey,
        });
      }

      throw new ApiRequestError(error?.message || 'Network request failed.', {
        type: 'network',
        code: 'network_error',
        url,
        retryable: true,
        featureKey,
      });
    }
  }

  throw new ApiRequestError('Authentication required.', {
    status: 401,
    type: 'auth',
    code: 'session_expired',
    url,
    featureKey,
  });
}

export function getUserFacingApiMessage(error, { isKr, messages = {} } = {}) {
  const defaults = isKr
    ? {
        auth: '로그인 세션이 만료되었습니다. 다시 로그인 후 이용해 주세요.',
        authRetryFailed: '세션 자동 복구에 실패했습니다. 다시 로그인해 주세요.',
        plan: '현재 플랜에서 이 기능 권한을 확인할 수 없습니다.',
        validation: '요청 데이터가 부족합니다. 입력 내용을 확인해 주세요.',
        config: '서버 설정을 확인하는 중입니다. 잠시 후 다시 시도해 주세요.',
        timeout: '요청 시간이 길어지고 있습니다. 잠시 후 다시 시도해 주세요.',
        network: '서버 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.',
        server: '서버 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        defaultMessage: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      }
    : {
        auth: 'Your login session expired. Please log in again.',
        authRetryFailed: 'Automatic session recovery failed. Please log in again.',
        plan: 'We could not confirm permission for this feature on your plan.',
        validation: 'Some required input is missing. Please review your data.',
        config: 'The service is being checked right now. Please try again shortly.',
        timeout: 'The request is taking too long. Please try again shortly.',
        network: 'The server connection is unstable. Please try again shortly.',
        server: 'The server could not complete this request. Please try again later.',
        defaultMessage: 'We could not complete this request. Please try again later.',
      };

  const copy = { ...defaults, ...(messages || {}) };
  if (!(error instanceof ApiRequestError)) {
    return error?.message || copy.defaultMessage;
  }

  if (error.type === 'auth') {
    return error.code === 'missing_access_token' ? copy.authRetryFailed : copy.auth;
  }
  if (error.type === 'plan') return copy.plan;
  if (error.type === 'validation') return copy.validation;
  if (error.type === 'config') return copy.config;
  if (error.type === 'timeout') return copy.timeout;
  if (error.type === 'network') return copy.network;
  if (error.type === 'server') return copy.server;
  return copy.defaultMessage;
}
