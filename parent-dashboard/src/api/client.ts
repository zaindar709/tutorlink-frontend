import { API_BASE_URL } from '../config/env';
import { getValidIdToken, clearParentSession } from '../services/sessionStore';

/** Render free-tier cold start can take 30–60s; do not treat that as an invalid code. */
const FETCH_TIMEOUT_MS = 90_000;

export class ParentApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ParentApiError';
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  token?: string | null;
  auth?: boolean;
  linkCode?: string;
  headers?: Record<string, string>;
  retried?: boolean;
};

const parseJson = async (response: Response): Promise<Record<string, unknown>> => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
};

const isAbortError = (error: unknown) =>
  (error instanceof DOMException && error.name === 'AbortError') ||
  (error instanceof Error && error.name === 'AbortError');

export const parentRequest = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    body,
    formData,
    auth = true,
    headers = {},
  } = options;

  const useAuth = auth && !options.linkCode;

  let token = options.token;
  if (useAuth && token === undefined) {
    token = await getValidIdToken();
  }

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  if (!formData) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  if (useAuth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }
  if (options.linkCode) {
    requestHeaders['X-Parent-Link-Code'] = options.linkCode;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      signal: controller.signal,
      body: formData
        ? formData
        : body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new ParentApiError(
        'The server is waking up. Please try again in a moment.',
        0,
        'TIMEOUT'
      );
    }
    throw new ParentApiError(
      'Could not reach the server. It may be waking up — try again.',
      0,
      'NETWORK'
    );
  } finally {
    window.clearTimeout(timer);
  }

  const json = await parseJson(response);
  const message = String(
    json.message || json.error || `Request failed (${response.status})`
  );
  const code = json.code ? String(json.code) : undefined;

  if (response.status === 401 || code === 'SESSION_REVOKED') {
    if (useAuth && !options.retried) {
      try {
        const refreshed = await getValidIdToken(true);
        if (refreshed && refreshed !== token) {
          return parentRequest<T>(path, {
            ...options,
            token: refreshed,
            retried: true,
          });
        }
      } catch {
        // fall through
      }
      clearParentSession();
    }
    throw new ParentApiError(
      message,
      response.status,
      code || 'UNAUTHORIZED'
    );
  }

  if (!response.ok || json.success === false) {
    throw new ParentApiError(message, response.status, code);
  }

  if ('data' in json && json.data !== undefined) {
    return json.data as T;
  }
  return json as T;
};

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (error instanceof ParentApiError) {
    if (error.status === 429 || error.code === 'RATE_LIMITED') {
      return error.message || 'Too many requests. Please wait a few minutes and try again.';
    }
    if (error.status === 0 || error.code === 'TIMEOUT' || error.code === 'NETWORK') {
      return error.message || 'The server is waking up. Please try again in a moment.';
    }
    if (error.status === 401) {
      return error.message || 'Could not open the dashboard. Paste the student code again.';
    }
    return error.message || fallback;
  }
  if (isAbortError(error)) {
    return 'The server is waking up. Please try again in a moment.';
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
