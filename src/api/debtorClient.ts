import { API_BASE_URL } from '@/config/env';
import { getAccessToken } from '@/utils/session';

import type { ActivePaper, Debtor, DebtorProfileUpdate } from '@/types';

export class ApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

type JsonEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
};

function joinUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body != null) {
    headers.set('Content-Type', 'application/json');
  }
  if (!init.skipAuth) {
    const token = await getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(joinUrl(path), { ...init, headers });
  const body = (await parseJson(res)) as JsonEnvelope<T>;

  if (!res.ok) {
    throw new ApiError(
      typeof body.message === 'string' ? body.message : res.statusText || 'Request failed',
      res.status,
      body.errors,
    );
  }

  if (body && typeof body === 'object' && 'success' in body && body.success === false) {
    throw new ApiError(
      typeof body.message === 'string' ? body.message : 'Request failed',
      res.status,
      body.errors,
    );
  }

  return body as T;
}

export async function loginDebtor(username: string, password: string) {
  const json = await apiRequest<JsonEnvelope<Debtor & { token?: string }>>('/v2/debtor/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true,
  });
  if (!json.data) throw new ApiError('Invalid login response', 500);
  return json.data;
}

export async function logoutDebtor(id: string) {
  await apiRequest<JsonEnvelope<Record<string, never>>>('/v2/debtor/logout', {
    method: 'POST',
    body: JSON.stringify({ id }),
    skipAuth: true,
  });
}

export async function fetchActivePapers() {
  const json = await apiRequest<JsonEnvelope<ActivePaper[]>>('/v2/debtor/api/data', {
    method: 'GET',
  });
  return Array.isArray(json.data) ? json.data : [];
}

export async function updateProfile(body: DebtorProfileUpdate) {
  const json = await apiRequest<JsonEnvelope<Debtor>>('/v2/debtor/api/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!json.data) throw new ApiError('Invalid profile response', 500);
  return json.data;
}
