'use client';
import { ChevronLeft, ChevronRight, LayoutGrid, List, SearchX, SlidersHorizontal, MapPin, Map as MapIcon, EyeOff, X, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { PurposeToggle } from '@/components/home/search-bar';
import { CardGrid } from '@/components/property/property-card';
import { btn, inputCls } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import type { Area, Paginated, PropertyCard, SearchParams } from '@/lib/types';
import { cn, omr, pick } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { MuscatMap } from './muscat-map';
import { FilterDrawer } from './filter-drawer';

const MapLibreMap = dynamic(
  () => import('./maplibre-map').then((m) => m.MapLibreMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[390px] w-full animate-pulse rounded-[22px] border border-line bg-surface flex items-center justify-center text-muted text-sm">
        Loading map...
      </div>
    ),
  }
);

const AMENITIES = ['pool', 'garden', 'parking', 'ac', 'maid', 'gym', 'sea', 'wifi'];
const TYPES = ['VILLA', 'APARTMENT', 'TOWNHOUSE', 'PENTHOUSE'] as const;

export function SearchView({ results, areas, params, areaCounts }: { results: Paginated<PropertyCard>; areas: Area[]; params: SearchParams; areaCounts: Record<string, number> }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const path = usePathname();
  const [pending, start] = useTransition();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [mapMode, setMapMode] = useState<'interactive' | 'stylized' | 'hidden'>('interactive');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const purpose = params.purpose === 'rent' ? 'rent' : 'buy';
  const maxRange = purpose === 'rent' ? { min: 400, max: 2000, step: 50 } : { min: 50000, max: 350000, step: 5000 };
  const [price, setPrice] = useState(Number(params.maxPrice ?? maxRange.max));
  const [q, setQ] = useState(params.q ?? '');

  useEffect(() => setPrice(Number(params.maxPrice ?? maxRange.max)), [params.maxPrice, maxRange.max]);

  const selectedAreas = params.area?.split(',').filter(Boolean) ?? [];
  const selectedAmen = params.amenities?.split(',').filter(Boolean) ?? [];

  function update(patch: Partial<Record<keyof SearchParams, string | undefined>>, resetPage = true) {
    const next = new URLSearchParams();
    const merged: Record<string, string | undefined> = { ...params, ...patch, ...(resetPage ? { page: undefined } : {}) };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    start(() => router.replace(`${path}?${next}`, { scroll: false }));
  }
  const toggleCsv = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]).join(',') || undefined;

  const activeFiltersCount =
    (params.type ? 1 : 0) +
    (params.beds ? 1 : 0) +
    selectedAreas.length +
    selectedAmen.length +
    (params.q ? 1 : 0) +
    (params.maxPrice ? 1 : 0);

  const chip = (on: boolean) =>
    cn(
      'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
      on
        ? 'border-primaryColor bg-primaryColor text-white shadow-2xs'
        : 'border-border bg-surface text-text hover:border-primaryColor'
    );
  const h4 = 'mb-2.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-text-muted rtl:tracking-normal';

  const clearAllFilters = () =>
    update({ type: undefined, beds: undefined, area: undefined, amenities: undefined, q: undefined, maxPrice: undefined });

  const filters = (
    <aside aria-label={t.results.filters} className="card hidden lg:grid gap-6 self-start p-5 lg:sticky lg:top-24 border border-border bg-surface rounded-[20px] shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primaryColor" />
          <h3 className="font-bold text-text text-base">{t.results.filters}</h3>
          {activeFiltersCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primaryColor text-[10px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-semibold text-primaryColor hover:underline"
          >
            {t.results.clear}
          </button>
        )}
      </div>

      <div>
        <h4 className={h4}>{t.results.purpose}</h4>
        <PurposeToggle value={purpose} onChange={(p) => update({ purpose: p, maxPrice: undefined })} className="h-12" />
      </div>

      <div>
        <label htmlFor="f-q" className={h4 + ' block'}>{t.results.search}</label>
        <form onSubmit={(e) => { e.preventDefault(); update({ q: q || undefined }); }}>
          <input id="f-q" value={q} onChange={(e) => setQ(e.target.value)} className={inputCls} placeholder="Qurum, villa…" />
        </form>
      </div>

      <div>
        <h4 className={h4}>{t.search.type}</h4>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={chip(!params.type)} onClick={() => update({ type: undefined })}>{t.featured.all}</button>
          {TYPES.map((k) => (
            <button key={k} type="button" className={chip(params.type === k)} onClick={() => update({ type: params.type === k ? undefined : k })}>
              {t.typeOne[k]}
            </button>
          ))}
        </div>
      </div>

      <fieldset>
        <legend className={h4}>{t.results.areas}</legend>
        <div className="grid gap-2">
          {areas.map((a) => (
            <label key={a.slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" className="size-[17px] accent-[var(--primaryColor)]" checked={selectedAreas.includes(a.slug)} onChange={() => update({ area: toggleCsv(selectedAreas, a.slug) })} />
              <span className="text-text font-medium">{pick(lang, a.name, a.nameAr)}</span>
              <span className="tabular ms-auto text-xs text-text-muted">{areaCounts[a.slug] ?? 0}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="f-max" className={h4 + ' block mb-0'}>{t.results.maxPrice}</label>
          <div className="font-display text-xs font-bold text-primaryColor tabular">
            {price.toLocaleString('en-US')}{' '}
            <span className="font-sans text-[11px] font-normal text-text-muted">
              OMR{price >= maxRange.max ? '+' : ''}
            </span>
          </div>
        </div>
        <input
          id="f-max"
          type="range"
          min={maxRange.min}
          max={maxRange.max}
          step={maxRange.step}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          onPointerUp={() => update({ maxPrice: price >= maxRange.max ? undefined : String(price) })}
          onKeyUp={() => update({ maxPrice: price >= maxRange.max ? undefined : String(price) })}
          className="w-full accent-[var(--primaryColor)] cursor-pointer"
        />
        <div className="flex justify-between text-xs text-text-muted mt-1 tabular">
          <span>{maxRange.min.toLocaleString('en-US')} OMR</span>
          <span>{maxRange.max.toLocaleString('en-US')}+ OMR</span>
        </div>
      </div>

      <div>
        <h4 className={h4}>{t.search.beds}</h4>
        <div className="grid grid-cols-5 overflow-hidden rounded-xl border border-border">
          {[0, 1, 2, 3, 4].map((b) => (
            <button key={b} type="button" onClick={() => update({ beds: b ? String(b) : undefined })} className={cn('border-s border-border py-2 text-xs font-semibold first:border-s-0 transition-colors', Number(params.beds ?? 0) === b ? 'bg-primaryColor text-white' : 'bg-surface text-text hover:bg-surface-hover')}>
              {b ? `${b}+` : t.search.any}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className={h4}>{t.results.amenities}</h4>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((k) => (
            <button key={k} type="button" className={chip(selectedAmen.includes(k))} onClick={() => update({ amenities: toggleCsv(selectedAmen, k) })}>
              {t.amenity[k]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-3 text-xs font-semibold text-text hover:border-primaryColor hover:text-primaryColor transition-all"
      >
        <SlidersHorizontal className="size-3.5 text-primaryColor" />
        <span>{lang === 'ar' ? 'عرض جميع الفلاتر المتقدمة' : 'More filters & options'}</span>
      </button>
    </aside>
  );

  const { page, pages, total } = results.meta;

  return (
    <div className="wrap grid gap-8 lg:grid-cols-[290px_1fr]">
      {filters}
      <div className="min-w-0">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {lang === 'ar' ? 'خريطة العقارات المتاحة' : 'Properties on map'}
              </span>
              <span className="inline-flex items-center rounded-full bg-primary-tint px-2 py-0.5 text-[11px] font-semibold text-primaryColor">
                {results.items.filter((p) => p.lat && p.lng).length} {lang === 'ar' ? 'عقار معروض' : 'plotted'}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setMapMode('interactive')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                  mapMode === 'interactive' ? 'bg-primaryColor text-white shadow-xs' : 'text-text-muted hover:text-text'
                )}
              >
                <MapPin className="size-3" />
                {lang === 'ar' ? 'خريطة تفاعلية' : 'Interactive Map'}
              </button>
              <button
                type="button"
                onClick={() => setMapMode('stylized')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                  mapMode === 'stylized' ? 'bg-primaryColor text-white shadow-xs' : 'text-text-muted hover:text-text'
                )}
              >
                <MapIcon className="size-3" />
                {lang === 'ar' ? 'نظرة ساحلية' : 'Overview'}
              </button>
              <button
                type="button"
                onClick={() => setMapMode('hidden')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all',
                  mapMode === 'hidden' ? 'bg-ink text-paper' : 'text-text-muted hover:text-text'
                )}
                title={lang === 'ar' ? 'إخفاء الخريطة' : 'Hide map'}
              >
                <EyeOff className="size-3" />
              </button>
            </div>
          </div>

          {mapMode === 'interactive' && (
            <MapLibreMap
              properties={results.items}
              areas={areas}
              selectedArea={selectedAreas[0]}
              onPickArea={(slug) => update({ area: slug || undefined })}
              height={390}
            />
          )}

          {mapMode === 'stylized' && (
            <MuscatMap
              areas={areas}
              counts={areaCounts}
              active={selectedAreas}
              onPick={(slug) => update({ area: toggleCsv(selectedAreas, slug) })}
            />
          )}
        </div>
        {/* Results Header Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3.5">
          <div className="flex items-center gap-3" aria-live="polite">
            <span className="text-sm text-text-muted">
              <b className="tabular font-display text-[22px] font-bold text-text me-1.5">{total}</b>
              {t.results?.found ?? 'homes found'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filter Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-text shadow-2xs hover:border-primaryColor hover:text-primaryColor transition-all"
            >
              <SlidersHorizontal className="size-3.5 text-primaryColor" />
              <span>{t.results?.filters ?? 'Filters'}</span>
              {activeFiltersCount > 0 && (
                <span className="flex size-4.5 items-center justify-center rounded-full bg-primaryColor text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Select */}
            <label htmlFor="f-sort" className="sr-only">{t.results?.sort ?? 'Sort'}</label>
            <select
              id="f-sort"
              value={params.sort ?? 'newest'}
              onChange={(e) => update({ sort: e.target.value })}
              className="h-9 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-text shadow-2xs outline-none focus:border-primaryColor"
            >
              <option value="newest">{t.results?.newest ?? 'Newest'}</option>
              <option value="price_asc">{t.results?.priceAsc ?? 'Price: low to high'}</option>
              <option value="price_desc">{t.results?.priceDesc ?? 'Price: high to low'}</option>
              <option value="size_desc">{t.results?.sizeDesc ?? 'Largest first'}</option>
              <option value="popular">{t.results?.popular ?? 'Most viewed'}</option>
            </select>

            {/* Layout Toggle (Grid / List) */}
            <div className="flex overflow-hidden rounded-full border border-border bg-surface p-0.5 shadow-2xs">
              {(['grid', 'list'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={layout === l}
                  aria-label={l === 'grid' ? (t.results?.grid ?? 'Grid') : (t.results?.list ?? 'List')}
                  onClick={() => setLayout(l)}
                  className={cn(
                    'grid size-8 place-items-center rounded-full text-text-muted transition-all [&_svg]:size-4',
                    layout === l && 'bg-primary-tint text-primaryColor font-bold'
                  )}
                >
                  {l === 'grid' ? <LayoutGrid /> : <List />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filter Dismissible Pills Bar */}
        {activeFiltersCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-text-muted font-medium me-1">
              {lang === 'ar' ? 'الفلاتر النشطة:' : 'Active filters:'}
            </span>

            {params.type && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text font-medium shadow-2xs">
                <span>{t.typeOne?.[params.type as keyof typeof t.typeOne] ?? params.type}</span>
                <button type="button" onClick={() => update({ type: undefined })} aria-label="Remove filter" className="hover:text-primaryColor">
                  <X className="size-3" />
                </button>
              </span>
            )}

            {selectedAreas.map((slug) => {
              const a = areas.find((x) => x.slug === slug);
              return (
                <span key={slug} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text font-medium shadow-2xs">
                  <span>{a ? pick(lang, a.name, a.nameAr) : slug}</span>
                  <button type="button" onClick={() => update({ area: toggleCsv(selectedAreas, slug) })} aria-label="Remove filter" className="hover:text-primaryColor">
                    <X className="size-3" />
                  </button>
                </span>
              );
            })}

            {params.beds && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text font-medium shadow-2xs">
                <span>{params.beds}+ {t.card?.bd ?? 'bd'}</span>
                <button type="button" onClick={() => update({ beds: undefined })} aria-label="Remove filter" className="hover:text-primaryColor">
                  <X className="size-3" />
                </button>
              </span>
            )}

            {params.maxPrice && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text font-medium shadow-2xs">
                <span>Max: {omr(Number(params.maxPrice))}</span>
                <button type="button" onClick={() => update({ maxPrice: undefined })} aria-label="Remove filter" className="hover:text-primaryColor">
                  <X className="size-3" />
                </button>
              </span>
            )}

            {params.q && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text font-medium shadow-2xs">
                <span>"{params.q}"</span>
                <button type="button" onClick={() => update({ q: undefined })} aria-label="Remove filter" className="hover:text-primaryColor">
                  <X className="size-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primaryColor hover:underline ms-1"
            >
              <RotateCcw className="size-3" />
              <span>{t.results?.clear ?? 'Clear all'}</span>
            </button>
          </div>
        )}

        <div className={cn('transition-opacity duration-300', pending && 'opacity-50')}>
          <AnimatePresence mode="wait">
            {results.items.length ? (
              <motion.div key={JSON.stringify(params) + layout} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CardGrid cards={results.items} layout={layout} priorityFirst />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] border border-dashed border-border px-5 py-16 text-center text-text-muted">
                <SearchX className="mx-auto size-8 text-primaryColor opacity-50" />
                <h3 className="mb-1.5 mt-3 text-xl font-bold text-text">{t.results?.none ?? 'No homes match these filters'}</h3>
                <p>{t.results?.noneP ?? 'Try a wider budget or another neighbourhood.'}</p>
                <button type="button" onClick={clearAllFilters} className={cn(btn({ variant: 'soft' }), 'mt-5')}>
                  {t.results?.clear ?? 'Clear all'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {pages > 1 && (
          <nav aria-label={t.results?.page ?? 'Page'} className="mt-10 flex items-center justify-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) }, false)} className={btn({ variant: 'outline', size: 'sm' })}>
              <ChevronLeft className="rtl-flip" />
              {t.results?.prev ?? 'Previous'}
            </button>
            <span className="tabular px-3 text-sm text-text-muted font-medium">{page} / {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => update({ page: String(page + 1) }, false)} className={btn({ variant: 'outline', size: 'sm' })}>
              {t.results?.next ?? 'Next'}
              <ChevronRight className="rtl-flip" />
            </button>
          </nav>
        )}
      </div>

      {/* Slide-over Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        params={params}
        areas={areas}
        areaCounts={areaCounts}
        totalResults={total}
        onApply={(patch) => update(patch)}
        onReset={clearAllFilters}
      />
    </div>
  );
}
