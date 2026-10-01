'use client';
import { ReactLenis } from 'lenis/react';
import { MotionConfig } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/i18n/client';
import { DEMO } from '@/lib/client';
import type { Lang } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { useCompare, useSaved } from '@/store/shortlist';

function Boot() {
  const load = useAuth((s) => s.load);
  const user = useAuth((s) => s.user);
  useEffect(() => {
    // Stores are persisted but hydrate after mount to keep server and client HTML identical.
    void useSaved.persist.rehydrate();
    void useCompare.persist.rehydrate();
    void load();
  }, [load]);
  useEffect(() => {
    if (user) void useSaved.getState().hydrateFromServer();
  }, [user]);
  return null;
}

export function Providers({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <I18nProvider lang={lang}>
      <MotionConfig reducedMotion="user" transition={{ ease: [0.2, 0.75, 0.2, 1] }}>
        <ReactLenis root options={{ lerp: 0.11, smoothWheel: true }}>
          <Boot />
          {DEMO && (
            <div className="bg-warn-bg py-1.5 text-center text-xs font-medium text-warn" role="status">
              {lang === 'ar' ? 'وضع العرض: بيانات توضيحية' : 'Demo mode: showing sample data'}
            </div>
          )}
          {children}
          <Toaster position="top-center" dir={lang === 'ar' ? 'rtl' : 'ltr'} toastOptions={{ className: '!rounded-2xl !font-sans' }} />
        </ReactLenis>
      </MotionConfig>
    </I18nProvider>
  );
}
