// Server-side data access for React Server Components.
// Falls back to bundled sample data if the API is down or demo mode is on, so pages never break.
import { cookies } from 'next/headers';
import { cache } from 'react';
import * as mock from './mock';
import type { Agency, Area, AvailabilityDay, Paginated, PropertyCard, PropertyDetail, SearchParams } from './types';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
export const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

class NotFound extends Error {}

async function get<T>(path: string, fallback: () => T | null, opts: { revalidate?: number; auth?: boolean } = {}): Promise<T | null> {
  if (DEMO) return fallback();
  try {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (opts.auth) {
      const at = (await cookies()).get('mawtin_at')?.value;
      if (at) headers.authorization = `Bearer ${at}`;
    }
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      headers,
      signal: AbortSignal.timeout(5000),
      ...(opts.auth ? { cache: 'no-store' as const } : { next: { revalidate: opts.revalidate ?? 60 } }),
    });
    if (res.status === 404) throw new NotFound(path);
    if (!res.ok) throw new Error(`API ${res.status} on ${path}`);
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof NotFound) return null;
    if (process.env.NODE_ENV !== 'production' || process.env.MAWTIN_LOG_FALLBACK === 'true') {
      console.warn(`[mawtin] API unavailable (${(e as Error).message}); using sample data for ${path}`);
    }
    return fallback();
  }
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') u.set(k, String(v));
  const s = u.toString();
  return s ? `?${s}` : '';
}

export function searchProperties(sp: SearchParams & { featured?: boolean; limit?: number; agency?: string }) {
  const query = qs({
    purpose: sp.purpose, type: sp.type, area: sp.area, maxPrice: sp.maxPrice, minPrice: sp.minPrice, beds: sp.beds,
    amenities: sp.amenities, sort: sp.sort, q: sp.q, page: sp.page, limit: sp.limit, featured: sp.featured, agency: sp.agency,
  });
  return get<Paginated<PropertyCard>>(`/properties${query}`, () => mock.mockSearch(sp), { revalidate: 30 }).then(
    (r) => r ?? { items: [], meta: { page: 1, limit: 12, total: 0, pages: 1 } },
  );
}

/** Wrapped in cache() so generateMetadata and the page share one request. */
export const getProperty = cache((slug: string) =>
  get<PropertyDetail>(`/properties/${encodeURIComponent(slug)}`, () => mock.mockDetail(slug), { auth: true }),
);

export const getSimilar = (id: string) =>
  get<PropertyCard[]>(`/properties/${id}/similar`, () => mock.mockSimilar(id), { revalidate: 300 }).then((r) => r ?? []);

export const getAreas = () => get<Area[]>('/areas', () => mock.mockAreas(), { revalidate: 600 }).then((r) => r ?? []);

export const getAgencies = () =>
  get<Paginated<Agency>>('/agencies?limit=48', () => mock.mockAgencies(), { revalidate: 600 }).then((r) => r?.items ?? []);

export const getAgency = cache((slug: string) => get<Agency>(`/agencies/${encodeURIComponent(slug)}`, () => mock.mockAgency(slug), { revalidate: 300 }));

export const getAvailability = (propertyId: string) =>
  get<AvailabilityDay[]>(`/properties/${propertyId}/availability?days=7`, () => null, { revalidate: 0 });
