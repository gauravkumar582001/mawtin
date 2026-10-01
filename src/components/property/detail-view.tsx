'use client';
import { Bath, BedDouble, CalendarRange, Car, Dumbbell, Flower2, Heart, KeyRound, Layers, MapPin, Maximize2, Shield, Snowflake, Sofa, Waves, Wifi } from 'lucide-react';
import Link from 'next/link';
import { CardGrid, CompareButton, SaveButton } from '@/components/property/property-card';
import { MuscatMap } from '@/components/search/muscat-map';
import { VillaViewer } from '@/components/three/villa-viewer';
import { Reveal } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import type { Area, PropertyCard, PropertyDetail } from '@/lib/types';
import { omr, pick, purposeParam } from '@/lib/utils';
import { ActionPanel } from './action-panel';
import { Gallery } from './gallery';
import { MortgageCalculator } from './mortgage';

const AMENITY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pool: Waves, garden: Flower2, parking: Car, ac: Snowflake, maid: KeyRound, wifi: Wifi, gym: Dumbbell, sea: Waves, security: Shield, balcony: Layers, majlis: Sofa, elevator: Layers,
};

export function DetailView({ p, similar, areas }: { p: PropertyDetail; similar: PropertyCard[]; areas: Area[] }) {
  const { t, lang } = useI18n();
  const title = pick(lang, p.title, p.titleAr);
  const area = pick(lang, p.area.name, p.area.nameAr);

  const facts: [React.ComponentType<{ className?: string }>, string | number, string][] = [
    [BedDouble, p.bedrooms, t.detail.beds],
    [Bath, p.bathrooms, t.detail.baths],
    [Maximize2, p.builtUpArea, t.detail.size],
    [CalendarRange, p.yearBuilt ?? '—', t.detail.year],
  ];

  return (
    <>
      <section className="wrap pb-4 pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-[13px] text-muted">
          <Link href="/" className="hover:text-teal">{t.nav.discover}</Link>
          <span>/</span>
          <Link href={`/properties?purpose=${purposeParam(p.purpose)}`} className="hover:text-teal">{p.purpose === 'SALE' ? t.nav.buy : t.nav.rent}</Link>
          <span>/</span>
          <Link href={`/properties?purpose=${purposeParam(p.purpose)}&area=${p.area.slug}`} className="hover:text-teal">{area}</Link>
        </nav>
      </section>

      <section className="wrap">
        <Gallery images={p.images} title={title} />

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_390px]">
          <div className="min-w-0">
            <Reveal className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-[13px] text-muted">
                  <MapPin className="size-3.5" />
                  {area}, {t.common.muscat}
                  {p.freehold && <span className="ms-2 rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-semibold text-teal">{t.detail.freehold}</span>}
                </div>
                <h1 className="text-[clamp(30px,3.4vw,44px)]">{title}</h1>
              </div>
              <div className="text-end">
                <div className="tabular font-display text-[34px] font-bold leading-none tracking-[-0.03em] text-teal">{omr(p.price)}</div>
                <small className="mt-1.5 block text-[12.5px] text-muted">
                  {p.purpose === 'RENT' ? t.card.perMonth : p.pricePerSqm ? `${omr(p.pricePerSqm)} ${t.detail.perSqm}` : ''}
                </small>
                <div className="mt-3 flex justify-end gap-2">
                  <SaveButton card={p} className="border border-line" />
                  <CompareButton card={p} className="h-10" />
                </div>
              </div>
            </Reveal>

            <Reveal className="my-7 grid grid-cols-2 overflow-hidden rounded-[18px] border border-line bg-surface sm:grid-cols-4">
              {facts.map(([Icon, v, label], i) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-4 ${i % 2 ? 'border-s border-line' : ''} ${i >= 2 ? 'border-t border-line sm:border-t-0' : ''} ${i === 2 ? 'sm:border-s' : ''}`}>
                  <Icon className="size-5 shrink-0 text-teal" />
                  <div>
                    <b className="tabular block font-display text-[22px] leading-none">{v}</b>
                    <span className="text-[12.5px] text-muted">{label}</span>
                  </div>
                </div>
              ))}
            </Reveal>

            <Reveal className="border-t border-line py-7">
              <h2 className="mb-3.5 text-[23px]">{t.detail.overview}</h2>
              <p className="max-w-[66ch] whitespace-pre-line text-ink-2">{pick(lang, p.description, p.descriptionAr)}</p>
            </Reveal>

            <Reveal className="border-t border-line py-7">
              <h2 className="mb-3.5 text-[23px]">{t.detail.amenities}</h2>
              <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                {p.amenities.map((k) => {
                  const Icon = AMENITY_ICON[k] ?? Heart;
                  return (
                    <li key={k} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 text-sm">
                      <Icon className="size-[17px] text-teal" />
                      {t.amenity[k] ?? k}
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <Reveal className="border-t border-line py-7">
              <h2 className="mb-3.5 text-[23px]">{t.detail.model3d}</h2>
              <VillaViewer height={420} />
            </Reveal>

            {p.purpose === 'SALE' && (
              <Reveal className="border-t border-line py-7">
                <h2 className="mb-3.5 text-[23px]">{t.detail.mortgage}</h2>
                <MortgageCalculator price={p.price} />
              </Reveal>
            )}

            <Reveal className="border-t border-line py-7">
              <h2 className="mb-3.5 text-[23px]">{t.detail.location}</h2>
              <MuscatMap areas={areas} counts={{ [p.area.slug]: 1 }} active={[p.area.slug]} />
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-24">
            <ActionPanel p={p} />
          </aside>
        </div>

        {similar.length > 0 && (
          <div className="pt-16">
            <h2 className="mb-7 text-[clamp(26px,3vw,36px)]">{t.detail.similar}</h2>
            <CardGrid cards={similar} />
          </div>
        )}
      </section>
    </>
  );
}
