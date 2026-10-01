'use client';
import { Heart } from 'lucide-react';
import { CardGrid } from '@/components/property/property-card';
import { ButtonLink } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import { useSaved } from '@/store/shortlist';

export default function SavedPage() {
  const { t } = useI18n();
  const items = useSaved((s) => s.items);
  return (
    <>
      <section className="wrap pb-6 pt-9">
        <div className="eyebrow">{t.saved.eyebrow}</div>
        <h1 className="mt-2 text-[clamp(30px,3.6vw,48px)]">{t.saved.title}</h1>
      </section>
      <section className="wrap">
        {items.length ? (
          <CardGrid cards={items} />
        ) : (
          <div className="rounded-[22px] border border-dashed border-line px-5 py-16 text-center text-muted">
            <Heart className="mx-auto size-8" />
            <h2 className="mb-1.5 mt-3 text-xl text-ink">{t.saved.empty}</h2>
            <p>{t.saved.emptyP}</p>
            <ButtonLink href="/properties?purpose=buy" className="mt-5">{t.featured.viewAll}</ButtonLink>
          </div>
        )}
      </section>
    </>
  );
}
