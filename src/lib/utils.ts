import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Lang, PropertyCard } from './types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** OMR has three decimal places (baisa); listing prices are whole rials, so we show none. */
export const omr = (n: number) => `OMR ${Math.round(n).toLocaleString('en-US')}`;

export const pick = (lang: Lang, en: string, ar?: string | null) => (lang === 'ar' && ar ? ar : en);

export const titleOf = (p: Pick<PropertyCard, 'title' | 'titleAr'>, lang: Lang) => (lang === 'ar' && p.titleAr ? p.titleAr : p.title);

export const initials = (name: string) =>
  name
    .split(' ')
    .filter((w) => w && w !== 'Al' && w[0] === w[0].toUpperCase())
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

export const purposeParam = (p: 'SALE' | 'RENT') => (p === 'SALE' ? 'buy' : 'rent');

/** Muscat coordinates → position on the stylised coastline map (viewBox 440×240). */
export function mapXY(lat: number | null, lng: number | null) {
  if (lat === null || lng === null) return { x: 220, y: 150 };
  const x = 40 + ((lng - 58.15) / (58.6 - 58.15)) * 360;
  const y = 70 + ((23.7 - lat) / (23.7 - 23.55)) * 140;
  return { x: Math.round(x), y: Math.round(y) };
}
