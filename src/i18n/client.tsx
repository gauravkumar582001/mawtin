'use client';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { Lang } from '@/lib/types';
import { LANG_COOKIE, dictionaries, type Dict } from './index';

interface I18nValue {
  lang: Lang;
  t: Dict;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
}

const Ctx = createContext<I18nValue | null>(null);

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const router = useRouter();
  const setLang = useCallback(
    (l: Lang) => {
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      router.refresh();
    },
    [router],
  );
  const value = useMemo<I18nValue>(
    () => ({ lang, t: dictionaries[lang], dir: lang === 'ar' ? 'rtl' : 'ltr', setLang }),
    [lang, setLang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n must be used inside <I18nProvider>');
  return v;
}
