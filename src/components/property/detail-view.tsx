'use client';

import { useState } from 'react';
import {
  Bath,
  BedDouble,
  CalendarRange,
  Car,
  ChevronRight,
  Compass,
  Dumbbell,
  Flower2,
  Heart,
  Home,
  KeyRound,
  Layers,
  MapPin,
  Maximize2,
  Plane,
  Share2,
  Shield,
  ShieldCheck,
  Snowflake,
  Sofa,
  Sparkles,
  Waves,
  Wifi,
  Building,
  Box,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { toast } from 'sonner';
import { CardGrid, CompareButton, SaveButton } from '@/components/property/property-card';
import { Avatar, Reveal } from '@/components/ui';
import { VillaViewer } from '@/components/three/villa-viewer';
import { useI18n } from '@/i18n/client';
import type { Area, PropertyCard, PropertyDetail } from '@/lib/types';
import { cn, omr, pick, purposeParam } from '@/lib/utils';
import { ActionPanel } from './action-panel';
import { Gallery } from './gallery';
import { MortgageCalculator } from './mortgage';

const MapLibreMap = dynamic(
  () => import('@/components/search/maplibre-map').then((m) => m.MapLibreMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full animate-pulse rounded-[22px] border border-border bg-surface flex items-center justify-center text-text-muted text-sm">
        Loading map...
      </div>
    ),
  }
);

const AMENITY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pool: Waves,
  garden: Flower2,
  parking: Car,
  ac: Snowflake,
  maid: KeyRound,
  wifi: Wifi,
  gym: Dumbbell,
  sea: Waves,
  security: Shield,
  balcony: Layers,
  majlis: Sofa,
  elevator: Layers,
};

const NEARBY_POI = [
  { icon: Plane, label: 'Muscat Int. Airport', labelAr: 'مطار مسقط الدولي', time: '15 mins' },
  { icon: Building, label: 'Sultan Qaboos Grand Mosque', labelAr: 'جامع السلطان قابوس الأكبر', time: '12 mins' },
  { icon: Waves, label: 'Qurum Beach', labelAr: 'شاطئ القرم', time: '8 mins' },
  { icon: Sparkles, label: 'Royal Opera House', labelAr: 'دار الأوبرا السلطانية', time: '10 mins' },
];

export function DetailView({
  p,
  similar,
  areas,
}: {
  p: PropertyDetail;
  similar: PropertyCard[];
  areas: Area[];
}) {
  const { t, lang } = useI18n();
  const title = pick(lang, p.title, p.titleAr);
  const area = pick(lang, p.area.name, p.area.nameAr);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast(t.detail?.copied ?? 'Link copied to clipboard');
      }
    } catch {
      // User cancelled or clipboard denied
    }
  };

  const facts: [React.ComponentType<{ className?: string }>, string | number, string][] = [
    [BedDouble, p.bedrooms, t.detail?.beds ?? 'Bedrooms'],
    [Bath, p.bathrooms, t.detail?.baths ?? 'Bathrooms'],
    [Maximize2, `${p.builtUpArea} m²`, t.detail?.size ?? 'Built-up Area'],
    [CalendarRange, p.yearBuilt ?? '2023', t.detail?.year ?? 'Year built'],
    [
      ShieldCheck,
      p.freehold
        ? (t.detail?.freehold ?? 'Freehold')
        : (lang === 'ar' ? 'مواطنين / خليجي' : 'GCC / Citizens'),
      lang === 'ar' ? 'حالة التملك' : 'Ownership',
    ],
  ];

  return (
    <div className="pb-16 pt-4">
      {/* ───────── Top Breadcrumb & Actions Bar ───────── */}
      <section className="wrap pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted">
            <Link href="/" className="hover:text-primaryColor flex items-center gap-1 transition-colors">
              <Home className="size-3.5" />
              <span>{t.nav?.discover ?? 'Home'}</span>
            </Link>
            <ChevronRight className="size-3 rtl-flip text-text-muted/60" />
            <Link
              href={`/properties?purpose=${purposeParam(p.purpose)}`}
              className="hover:text-primaryColor transition-colors"
            >
              {p.purpose === 'SALE' ? (t.nav?.buy ?? 'Buy') : (t.nav?.rent ?? 'Rent')}
            </Link>
            <ChevronRight className="size-3 rtl-flip text-text-muted/60" />
            <Link
              href={`/properties?purpose=${purposeParam(p.purpose)}&area=${p.area.slug}`}
              className="hover:text-primaryColor transition-colors"
            >
              {area}
            </Link>
            <ChevronRight className="size-3 rtl-flip text-text-muted/60" />
            <span className="truncate max-w-[200px] sm:max-w-[340px] text-text font-medium">
              {title}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text shadow-2xs hover:border-primaryColor hover:text-primaryColor transition-all"
            >
              <Share2 className="size-3.5 text-primaryColor" />
              <span>{t.detail?.share ?? 'Share'}</span>
            </button>

            <SaveButton card={p} className="border border-border shadow-2xs" />
            <CompareButton card={p} className="h-9" />
          </div>
        </div>
      </section>

      {/* ───────── Editorial Header Row ───────── */}
      <section className="wrap pt-2 pb-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-2.5">
            {/* Badges Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-primaryColor px-3 py-1 text-white uppercase tracking-wider shadow-xs">
                {p.purpose === 'RENT' ? (lang === 'ar' ? 'للإيجار' : 'For Rent') : (lang === 'ar' ? 'للبيع' : 'For Sale')}
              </span>

              <span className="rounded-full bg-surface px-3 py-1 text-text border border-border shadow-2xs">
                {t.typeOne?.[p.type] ?? p.type}
              </span>

              {p.featured && (
                <span className="rounded-full bg-[#b0693a] px-3 py-1 text-white uppercase tracking-wider shadow-xs">
                  {t.card?.featured ?? 'Featured'}
                </span>
              )}

              {p.freehold && (
                <span className="rounded-full bg-primary-tint px-3 py-1 text-primaryColor font-bold border border-primaryColor/20 shadow-2xs">
                  {t.detail?.freehold ?? 'Freehold'}
                </span>
              )}

              <Link
                href={`/agencies/${p.agency.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-text border border-border hover:border-primaryColor shadow-2xs transition-colors"
              >
                <Avatar name={p.agency.name} color={p.agency.brandColor} size={18} />
                <span>{pick(lang, p.agency.name, p.agency.nameAr)}</span>
                <ShieldCheck className="size-3 text-primaryColor" />
              </Link>
            </div>

            {/* Editorial Title */}
            <h1 className="font-extrabold text-[clamp(28px,3.4vw,44px)] leading-[1.12] text-text tracking-tight">
              {title}
            </h1>

            {/* Area & Location */}
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <MapPin className="size-4 text-primaryColor shrink-0" />
              <span>
                {area}, {t.common?.muscat ?? 'Muscat, Oman'}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="lg:text-end bg-surface-hover/50 lg:bg-transparent p-4 lg:p-0 rounded-2xl border lg:border-0 border-border">
            <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-0.5">
              {p.purpose === 'RENT' ? (lang === 'ar' ? 'القيمة الإيجارية' : 'Rental Rate') : (lang === 'ar' ? 'السعر المطلوب' : 'Asking Price')}
            </div>
            <div className="tabular font-display text-[34px] sm:text-[42px] font-extrabold text-primaryColor leading-none tracking-tight">
              {omr(p.price)}
              {p.purpose === 'RENT' && (
                <span className="ms-1.5 font-sans text-sm font-normal text-text-muted">
                  {t.card?.perMonth ?? '/ month'}
                </span>
              )}
            </div>
            {p.pricePerSqm && p.purpose === 'SALE' && (
              <div className="mt-1.5 text-xs text-text-muted tabular">
                <b className="text-text font-semibold">{omr(p.pricePerSqm)}</b> {t.detail?.perSqm ?? 'per m²'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────── Photo Media Gallery ───────── */}
      <section className="wrap pt-2">
        <Gallery images={p.images} title={title} />
      </section>

      {/* ───────── Main Content & Sticky Action Panel ───────── */}
      <section className="wrap mt-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_390px]">
          <div className="min-w-0 space-y-9">
            {/* Fact Sheet Grid */}
            <Reveal className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {facts.map(([Icon, val, label]) => (
                <div
                  key={label}
                  className="flex items-center gap-3.5 rounded-[20px] border border-border bg-surface p-4 shadow-xs"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-tint text-primaryColor">
                    <Icon className="size-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <b className="tabular block font-display text-lg font-bold text-text leading-tight truncate">
                      {val}
                    </b>
                    <span className="text-[11.5px] text-text-muted font-medium truncate block mt-0.5">
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </Reveal>

            {/* Overview / Editorial Description */}
            <Reveal className="border-t border-border/80 pt-8">
              <h2 className="mb-4 text-xl sm:text-2xl font-bold text-text">
                {t.detail?.overview ?? 'Overview'}
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-text-muted leading-relaxed text-[15px] whitespace-pre-line">
                {pick(lang, p.description, p.descriptionAr)}
              </div>
            </Reveal>

            {/* Structured Amenities Grid (Interior, Exterior, Community) */}
            <Reveal className="border-t border-border/80 pt-8">
              <h2 className="mb-5 text-xl sm:text-2xl font-bold text-text">
                {t.detail?.amenities ?? 'Amenities & Features'}
              </h2>
              <div className="space-y-4">
                {[
                  {
                    id: 'interior',
                    title: lang === 'ar' ? 'الميزات والتجهيزات الداخلية' : 'Interior Features',
                    icon: Sofa,
                    keys: ['ac', 'maid', 'majlis', 'wifi'],
                  },
                  {
                    id: 'exterior',
                    title: lang === 'ar' ? 'الميزات الخارجية والحديقة' : 'Exterior Features',
                    icon: Flower2,
                    keys: ['pool', 'garden', 'balcony', 'sea'],
                  },
                  {
                    id: 'community',
                    title: lang === 'ar' ? 'المبنى والمرافق المشتركة' : 'Community & Facilities',
                    icon: Building,
                    keys: ['gym', 'parking', 'security', 'elevator'],
                  },
                ]
                  .map((cat) => ({
                    ...cat,
                    items: cat.keys.filter((k) => p.amenities.includes(k)),
                  }))
                  .filter((cat) => cat.items.length > 0)
                  .map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={cat.id} className="rounded-[20px] border border-border bg-surface p-4 sm:p-5 shadow-2xs">
                        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-primaryColor">
                          <CatIcon className="size-4" />
                          <span>{cat.title}</span>
                          <span className="text-text-muted font-normal">({cat.items.length})</span>
                        </div>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {cat.items.map((k) => {
                            const Icon = AMENITY_ICON[k] ?? Heart;
                            return (
                              <li
                                key={k}
                                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-hover/50 px-3.5 py-2.5 text-xs font-semibold text-text shadow-2xs hover:border-primaryColor transition-colors"
                              >
                                <div className="grid size-6 place-items-center rounded-lg bg-primary-tint text-primaryColor shrink-0">
                                  <Icon className="size-3.5" />
                                </div>
                                <span className="truncate">{t.amenity?.[k] ?? k}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
              </div>
            </Reveal>

            {/* Interactive 3D Model Inspection */}
            <Reveal className="border-t border-border/80 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Box className="size-5 text-primaryColor" />
                  <h2 className="text-xl sm:text-2xl font-bold text-text">
                    {t.detail?.model3d ?? '3D Architectural Inspection'}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Interactive
                </span>
              </div>
              <div className="overflow-hidden rounded-[24px] border border-border shadow-sm">
                <VillaViewer height={420} />
              </div>
            </Reveal>

            {/* Mortgage Calculator (For Sale properties) */}
            {p.purpose === 'SALE' && (
              <Reveal className="border-t border-border/80 pt-8">
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-text">
                    {t.detail?.mortgage ?? 'Mortgage Calculator'}
                  </h2>
                </div>
                <MortgageCalculator price={p.price} />
              </Reveal>
            )}

            {/* Interactive Location & Neighborhood POIs */}
            <Reveal className="border-t border-border/80 pt-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text">
                    {t.detail?.location ?? 'Location & Neighborhood'}
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    {area}, {t.common?.muscat ?? 'Muscat, Oman'}
                  </p>
                </div>
              </div>

              {/* MapLibre Map Container */}
              <div className="overflow-hidden rounded-[24px] border border-border shadow-sm">
                <MapLibreMap singleProperty={p} areas={areas} height={380} />
              </div>

              {/* Nearby Muscat Key Landmarks */}
              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">
                  {t.detail?.nearby ?? 'Nearby places in Muscat'}
                </span>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {NEARBY_POI.map((poi) => {
                    const Icon = poi.icon;
                    return (
                      <div
                        key={poi.label}
                        className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3 text-xs shadow-2xs"
                      >
                        <div className="grid size-7 place-items-center rounded-lg bg-primary-tint text-primaryColor shrink-0">
                          <Icon className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-text truncate">
                            {lang === 'ar' ? poi.labelAr : poi.label}
                          </div>
                          <div className="text-[11px] text-primaryColor font-bold tabular">
                            ~{poi.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sticky Sidebar Action Panel */}
          <aside className="lg:sticky lg:top-24">
            <ActionPanel p={p} />
          </aside>
        </div>

        {/* ───────── Similar Homes ───────── */}
        {similar.length > 0 && (
          <div className="pt-20 border-t border-border/80 mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primaryColor block mb-1">
                  {lang === 'ar' ? 'منازل مقترحة' : 'Curated For You'}
                </span>
                <h2 className="text-[clamp(24px,3vw,34px)] font-extrabold text-text tracking-tight">
                  {t.detail?.similar ?? 'Similar homes in Muscat'}
                </h2>
              </div>
              <Link
                href={`/properties?purpose=${purposeParam(p.purpose)}&area=${p.area.slug}`}
                className="text-xs font-semibold text-primaryColor hover:underline flex items-center gap-1"
              >
                <span>{lang === 'ar' ? 'عرض المزيد في هذه المنطقة' : 'Explore more in this area'}</span>
                <ChevronRight className="size-3.5 rtl-flip" />
              </Link>
            </div>

            <CardGrid cards={similar} />
          </div>
        )}
      </section>
    </div>
  );
}
