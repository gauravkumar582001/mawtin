'use client';
import { useEffect } from 'react';
import { btn } from '@/lib/ui-styles';
import { useI18n } from '@/i18n/client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => console.error(error), [error]);
  return (
    <section className="wrap grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <h1 className="text-3xl">{t.common.error}</h1>
        {error.digest && <p className="tabular mt-2 text-xs text-muted">Ref: {error.digest}</p>}
        <button type="button" className={`${btn()} mt-6`} onClick={reset}>{t.common.retry}</button>
      </div>
    </section>
  );
}
