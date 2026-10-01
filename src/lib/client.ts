'use client';
// Browser-side API client. Requests go to /api/v1/* on this origin (Next rewrites to NestJS),
// so the httpOnly auth cookies are sent automatically.

export const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

let refreshing: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  refreshing ??= fetch('/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json', 'x-mawtin-csrf': '1' },
    body: '{}',
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      setTimeout(() => (refreshing = null), 0);
    });
  return refreshing;
}

type Options = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; signal?: AbortSignal };

export async function api<T>(path: string, opts: Options = {}, retried = false): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method: opts.method ?? 'GET',
    credentials: 'include',
    signal: opts.signal,
    headers: {
      accept: 'application/json',
      'x-mawtin-csrf': '1',
      ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  }).catch(() => {
    throw new ApiError('We could not reach Mawtin. Check your connection and try again.', 0);
  });

  if (res.status === 401 && !retried && !path.startsWith('/auth/')) {
    if (await refreshSession()) return api<T>(path, opts, true);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new ApiError(msg || 'Something went wrong. Please try again.', res.status);
  }
  return data as T;
}

/** Simulated latency for demo-mode actions, so loading states are visible. */
export const demoDelay = <T,>(value: T, ms = 650) => new Promise<T>((r) => setTimeout(() => r(value), ms));
