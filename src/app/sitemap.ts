import type { MetadataRoute } from 'next';
import { getAgencies, searchProperties } from '@/lib/api';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [homes, agencies] = await Promise.all([searchProperties({ limit: 48 }), getAgencies()]);
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/properties?purpose=buy`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE}/properties?purpose=rent`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE}/agencies`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    ...homes.items.map((h) => ({ url: `${SITE}/properties/${h.slug}`, lastModified: h.publishedAt ? new Date(h.publishedAt) : now, priority: 0.8 })),
    ...agencies.map((a) => ({ url: `${SITE}/agencies/${a.slug}`, lastModified: now, priority: 0.5 })),
  ];
}
