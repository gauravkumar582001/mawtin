'use client';
import { ChevronLeft, ChevronRight, LayoutGrid, List, SearchX, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { PurposeToggle } from '@/components/home/search-bar';
import { CardGrid } from '@/components/property/property-card';
import { btn, inputCls } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import type { Area, Paginated, PropertyCard, SearchParams } from '@/lib/types';
import { cn, pick } from '@/lib/utils';
import { MuscatMap } from './muscat-map';

const AMENITIES = ['pool', 'garden', 'parking', 'ac', 'maid', 'gym', 'sea', 'wifi'];
const TYPES = ['VILLA', 'APARTMENT', 'TOWNHOUSE', 'PENTHOUSE'] as const;

export function SearchView({ results, areas, params, areaCounts }: { results: Paginated<PropertyCard>; areas: Area[]; params: SearchParams; areaCounts: Record<string, number> }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const path = usePathname();
  const [pending, start] = useTransition();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
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

  const chip = (on: boolean) =>
    cn('rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition', on ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-ink-2 hover:border-teal hover:text-teal');
  const h4 = 'mb-2.5 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-muted rtl:tracking-normal';

  const filters = (
    <aside aria-label={t.results.filters} className={cn('card grid gap-6 self-start p-5 lg:sticky lg:top-24', !showFilters && 'hidden lg:grid')}>
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
              <input type="checkbox" className="size-[17px] accent-[var(--teal)]" checked={selectedAreas.includes(a.slug)} onChange={() => update({ area: toggleCsv(selectedAreas, a.slug) })} />
              {pick(lang, a.name, a.nameAr)}
              <span className="tabular ms-auto text-xs text-muted">{areaCounts[a.slug] ?? 0}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="f-max" className={h4 + ' block'}>{t.results.maxPrice}</label>
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
          className="w-full accent-[var(--teal)]"
        />
        <div className="flex justify-between text-[13px] font-semibold">
          <span className="text-muted">OMR</span>
          <span className="tabular">{price.toLocaleString('en-US')}{price >= maxRange.max ? '+' : ''}</span>
        </div>
      </div>
      <div>
        <h4 className={h4}>{t.search.beds}</h4>
        <div className="grid grid-cols-5 overflow-hidden rounded-xl border border-line">
          {[0, 1, 2, 3, 4].map((b) => (
            <button key={b} type="button" onClick={() => update({ beds: b ? String(b) : undefined })} className={cn('border-s border-line py-2 text-[13px] first:border-s-0', Number(params.beds ?? 0) === b && 'bg-ink text-paper')}>
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
      <Link href={`${path}?purpose=${purpose}`} className="font-semibold text-teal" scroll={false}>
        {t.results.clear}
      </Link>
    </aside>
  );

  const { page, pages, total } = results.meta;

  return (
    <div className="wrap grid gap-8 lg:grid-cols-[290px_1fr]">
      {filters}
      <div className="min-w-0">
        <MuscatMap
          areas={areas}
          counts={areaCounts}
          active={selectedAreas}
          onPick={(slug) => update({ area: toggleCsv(selectedAreas, slug) })}
          className="mb-6"
        />
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
          <div className="text-sm text-ink-2" aria-live="polite">
            <b className="tabular font-display text-[22px] text-ink">{total}</b> {t.results.found}
          </div>
          <div className="flex items-center gap-2.5">
            <button type="button" className={cn(btn({ variant: 'soft', size: 'sm' }), 'lg:hidden')} onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>
              <SlidersHorizontal />
              {t.results.filters}
            </button>
            <label htmlFor="f-sort" className="sr-only">{t.results.sort}</label>
            <select id="f-sort" value={params.sort ?? 'newest'} onChange={(e) => update({ sort: e.target.value })} className="h-10 rounded-xl border border-line bg-surface px-3 text-[13.5px]">
              <option value="newest">{t.results.newest}</option>
              <option value="price_asc">{t.results.priceAsc}</option>
              <option value="price_desc">{t.results.priceDesc}</option>
              <option value="size_desc">{t.results.sizeDesc}</option>
              <option value="popular">{t.results.popular}</option>
            </select>
            <div className="flex overflow-hidden rounded-xl border border-line">
              {(['grid', 'list'] as const).map((l) => (
                <button key={l} type="button" aria-pressed={layout === l} aria-label={l === 'grid' ? t.results.grid : t.results.list} onClick={() => setLayout(l)} className={cn('grid h-[38px] w-10 place-items-center bg-surface text-muted [&_svg]:size-[17px]', layout === l && 'bg-teal-soft text-teal')}>
                  {l === 'grid' ? <LayoutGrid /> : <List />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={cn('transition-opacity duration-300', pending && 'opacity-50')}>
          <AnimatePresence mode="wait">
            {results.items.length ? (
              <motion.div key={JSON.stringify(params) + layout} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CardGrid cards={results.items} layout={layout} priorityFirst />
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] border border-dashed border-line px-5 py-16 text-center text-muted">
                <SearchX className="mx-auto size-8" />
                <h3 className="mb-1.5 mt-3 text-xl text-ink">{t.results.none}</h3>
                <p>{t.results.noneP}</p>
                <Link href={`${path}?purpose=${purpose}`} className={cn(btn({ variant: 'soft' }), 'mt-5')}>{t.results.clear}</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {pages > 1 && (
          <nav aria-label={t.results.page} className="mt-10 flex items-center justify-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) }, false)} className={btn({ variant: 'outline', size: 'sm' })}>
              <ChevronLeft className="rtl-flip" />
              {t.results.prev}
            </button>
            <span className="tabular px-3 text-sm text-muted">{page} / {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => update({ page: String(page + 1) }, false)} className={btn({ variant: 'outline', size: 'sm' })}>
              {t.results.next}
              <ChevronRight className="rtl-flip" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
