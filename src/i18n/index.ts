import ar from './ar';
import en, { type Dict } from './en';
import type { Lang } from '@/lib/types';

export type { Dict };
export const LANG_COOKIE = 'lang';
export const dictionaries: Record<Lang, Dict> = { en, ar };
export const isLang = (v: unknown): v is Lang => v === 'en' || v === 'ar';
