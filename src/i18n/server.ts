import { cookies, headers } from 'next/headers';
import type { Lang } from '@/lib/types';
import { LANG_COOKIE, dictionaries, isLang } from './index';

/** Cookie first; otherwise Arabic browsers get Arabic, everyone else English. */
export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(c)) return c;
  const accept = (await headers()).get('accept-language') ?? '';
  return accept.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: dictionaries[lang] };
}
