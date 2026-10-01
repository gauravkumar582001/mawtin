'use client';
import { BedDouble, Check, ChevronDown, Coins, Home, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/client';
import type { Area, PropertyType } from '@/lib/types';
import { cn, pick } from '@/lib/utils';

const BUDGETS = {
  buy: [
    { label: 'Any price', val: '' },
    { label: 'Up to OMR 80,000', val: '80000' },
    { label: 'Up to OMR 120,000', val: '120000' },
    { label: 'Up to OMR 180,000', val: '180000' },
    { label: 'Up to OMR 250,000', val: '250000' },
    { label: 'Up to OMR 350,000', val: '350000' },
    { label: 'Up to OMR 500,000+', val: '500000' },
  ],
  rent: [
    { label: 'Any price', val: '' },
    { label: 'Up to OMR 400 / mo', val: '400' },
    { label: 'Up to OMR 600 / mo', val: '600' },
    { label: 'Up to OMR 900 / mo', val: '900' },
    { label: 'Up to OMR 1,200 / mo', val: '1200' },
    { label: 'Up to OMR 1,800 / mo', val: '1800' },
    { label: 'Up to OMR 2,500+ / mo', val: '2500' },
  ],
};

const BEDS_OPTIONS = [
  { label: 'Any', val: '' },
  { label: '1+', val: '1' },
  { label: '2+', val: '2' },
  { label: '3+', val: '3' },
  { label: '4+', val: '4' },
  { label: '5+', val: '5' },
];

const TYPES: { key: PropertyType | ''; labelKey?: 'VILLA' | 'APARTMENT' | 'TOWNHOUSE' | 'PENTHOUSE' }[] = [
  { key: '' },
  { key: 'VILLA', labelKey: 'VILLA' },
  { key: 'APARTMENT', labelKey: 'APARTMENT' },
  { key: 'TOWNHOUSE', labelKey: 'TOWNHOUSE' },
  { key: 'PENTHOUSE', labelKey: 'PENTHOUSE' },
];

export function PurposeToggle({
  value,
  onChange,
  className,
}: {
  value: 'buy' | 'rent';
  onChange: (v: 'buy' | 'rent') => void;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <div
      role="radiogroup"
      aria-label={t.results.purpose}
      className={cn('relative grid grid-cols-2 rounded-full bg-[var(--primary-tint)] p-1 shrink-0', className)}
    >
      {(['buy', 'rent'] as const).map((p) => {
        const active = value === p;
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p)}
            className={cn(
              'relative z-10 flex h-full items-center justify-center rounded-full font-semibold transition-colors duration-200 text-[15px]',
              active ? 'text-[var(--on-primary)]' : 'text-[var(--text)] hover:text-[var(--primaryColor)]',
            )}
          >
            {active && (
              <motion.span
                layoutId="velra-purpose-pill"
                className="absolute inset-0 -z-10 rounded-full bg-[var(--primaryColor)] shadow-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span>{p === 'buy' ? t.search.buy : t.search.rent}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SearchBar({ areas, className }: { areas: Area[]; className?: string }) {
  const { t, lang } = useI18n();
  const router = useRouter();

  const [purpose, setPurpose] = useState<'buy' | 'rent'>('buy');
  const [area, setArea] = useState('');
  const [type, setType] = useState<PropertyType | ''>('');
  const [max, setMax] = useState('');
  const [beds, setBeds] = useState('');
  const [activeMenu, setActiveMenu] = useState<'location' | 'price' | 'beds' | 'type' | 'more' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setActiveMenu(null);
    const q = new URLSearchParams({ purpose });
    if (area) q.set('area', area);
    if (type) q.set('type', type);
    if (max) q.set('maxPrice', max);
    if (beds) q.set('beds', beds);
    router.push(`/properties?${q.toString()}`);
  }

  const selectedAreaObj = areas.find((a) => a.slug === area);
  const locationLabel = selectedAreaObj ? pick(lang, selectedAreaObj.name, selectedAreaObj.nameAr) : t.search.dubaiOrMuscat;
  const priceObj = BUDGETS[purpose].find((b) => b.val === max);
  const priceLabel = priceObj && priceObj.val ? priceObj.label : t.search.anyPrice;
  const bedsObj = BEDS_OPTIONS.find((b) => b.val === beds);
  const bedsLabel = bedsObj && bedsObj.val ? `${bedsObj.label} ${t.search.beds}` : t.search.any;
  const typeLabel = type ? t.typeOne[type] : t.search.allTypes;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* ───────── Desktop Velra 76px Floating Search Pill ───────── */}
      <motion.form
        role="search"
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden h-[76px] items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-raised lg:flex"
      >
        {/* Buy / Rent segmented toggle */}
        <PurposeToggle
          value={purpose}
          onChange={(p) => {
            setPurpose(p);
            setMax('');
          }}
          className="h-[54px] w-[210px] xl:w-[230px]"
        />

        {/* Divider */}
        <span aria-hidden="true" className="h-10 w-px shrink-0 bg-[var(--border)]" />

        {/* 1. Location Segment */}
        <div className="relative flex-[1.3] h-full">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === 'location' ? null : 'location')}
            aria-expanded={activeMenu === 'location'}
            className="group flex h-full w-full items-center gap-2.5 rounded-full px-3.5 text-start transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--primary-tint)] text-[var(--primaryColor)]">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[12px] font-medium leading-none text-[var(--text-muted)]">{t.search.location}</span>
              <span className="mt-1 truncate text-[14.5px] font-semibold text-[var(--text)]">{locationLabel}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-aria-expanded:rotate-180" />
          </button>

          <AnimatePresence>
            {activeMenu === 'location' && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute start-0 top-full z-50 mt-2 max-h-[320px] w-[280px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-raised"
              >
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                  {t.search.location}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setArea('');
                    setActiveMenu(null);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--surface-hover)]',
                    !area && 'bg-[var(--primary-tint)] font-semibold text-[var(--primaryColor)]',
                  )}
                >
                  <span>{t.search.allAreas}</span>
                  {!area && <Check className="h-4 w-4" />}
                </button>
                {areas.map((a) => {
                  const on = area === a.slug;
                  return (
                    <button
                      key={a.slug}
                      type="button"
                      onClick={() => {
                        setArea(a.slug);
                        setActiveMenu(null);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--surface-hover)]',
                        on && 'bg-[var(--primary-tint)] font-semibold text-[var(--primaryColor)]',
                      )}
                    >
                      <span>{pick(lang, a.name, a.nameAr)}</span>
                      {on && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <span aria-hidden="true" className="h-10 w-px shrink-0 bg-[var(--border)]" />

        {/* 2. Price Segment */}
        <div className="relative flex-[1.1] h-full">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === 'price' ? null : 'price')}
            aria-expanded={activeMenu === 'price'}
            className="group flex h-full w-full items-center gap-2.5 rounded-full px-3 text-start transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--primary-tint)] text-[var(--primaryColor)]">
              <Coins className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[12px] font-medium leading-none text-[var(--text-muted)]">{t.search.budget}</span>
              <span className="mt-1 truncate text-[14.5px] font-semibold text-[var(--text)]">{priceLabel}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-aria-expanded:rotate-180" />
          </button>

          <AnimatePresence>
            {activeMenu === 'price' && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute start-0 top-full z-50 mt-2 w-[240px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-raised"
              >
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                  {t.search.budget} ({purpose === 'buy' ? 'OMR' : 'OMR / mo'})
                </div>
                {BUDGETS[purpose].map((b) => {
                  const on = max === b.val;
                  return (
                    <button
                      key={b.val || 'any'}
                      type="button"
                      onClick={() => {
                        setMax(b.val);
                        setActiveMenu(null);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--surface-hover)]',
                        on && 'bg-[var(--primary-tint)] font-semibold text-[var(--primaryColor)]',
                      )}
                    >
                      <span>{b.label}</span>
                      {on && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <span aria-hidden="true" className="h-10 w-px shrink-0 bg-[var(--border)]" />

        {/* 3. Beds Segment */}
        <div className="relative flex-[0.85] h-full">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === 'beds' ? null : 'beds')}
            aria-expanded={activeMenu === 'beds'}
            className="group flex h-full w-full items-center gap-2 rounded-full px-3 text-start transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--primary-tint)] text-[var(--primaryColor)]">
              <BedDouble className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[12px] font-medium leading-none text-[var(--text-muted)]">{t.search.beds}</span>
              <span className="mt-1 truncate text-[14.5px] font-semibold text-[var(--text)]">{bedsLabel}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-aria-expanded:rotate-180" />
          </button>

          <AnimatePresence>
            {activeMenu === 'beds' && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute start-0 top-full z-50 mt-2 w-[220px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-raised"
              >
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                  {t.search.beds}
                </div>
                <div className="grid grid-cols-3 gap-1 p-1">
                  {BEDS_OPTIONS.map((b) => {
                    const on = beds === b.val;
                    return (
                      <button
                        key={b.val || 'any'}
                        type="button"
                        onClick={() => {
                          setBeds(b.val);
                          setActiveMenu(null);
                        }}
                        className={cn(
                          'flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors',
                          on ? 'bg-[var(--primaryColor)] text-[var(--on-primary)]' : 'bg-[var(--surface-hover)] text-[var(--text)] hover:bg-[var(--primary-tint)]',
                        )}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <span aria-hidden="true" className="h-10 w-px shrink-0 bg-[var(--border)]" />

        {/* 4. Property Type Segment */}
        <div className="relative flex-[1] h-full">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === 'type' ? null : 'type')}
            aria-expanded={activeMenu === 'type'}
            className="group flex h-full w-full items-center gap-2 rounded-full px-3 text-start transition-colors hover:bg-[var(--surface-hover)]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--primary-tint)] text-[var(--primaryColor)]">
              <Home className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[12px] font-medium leading-none text-[var(--text-muted)]">{t.search.type}</span>
              <span className="mt-1 truncate text-[14.5px] font-semibold text-[var(--text)]">{typeLabel}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-aria-expanded:rotate-180" />
          </button>

          <AnimatePresence>
            {activeMenu === 'type' && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute start-0 top-full z-50 mt-2 w-[220px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-raised"
              >
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                  {t.search.type}
                </div>
                {TYPES.map((tp) => {
                  const on = type === tp.key;
                  const label = tp.labelKey ? t.typeOne[tp.labelKey] : t.search.allTypes;
                  return (
                    <button
                      key={tp.key || 'any'}
                      type="button"
                      onClick={() => {
                        setType(tp.key);
                        setActiveMenu(null);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--surface-hover)]',
                        on && 'bg-[var(--primary-tint)] font-semibold text-[var(--primaryColor)]',
                      )}
                    >
                      <span>{label}</span>
                      {on && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <span aria-hidden="true" className="h-10 w-px shrink-0 bg-[var(--border)]" />

        {/* 5. More Filters Modal Trigger */}
        <button
          type="button"
          onClick={() => setActiveMenu(activeMenu === 'more' ? null : 'more')}
          className="inline-flex h-[54px] shrink-0 items-center gap-2 rounded-full bg-[var(--primary-tint)] px-4 xl:px-5 text-[14px] font-semibold text-[var(--text)] transition-colors hover:bg-[var(--primary-tint-hover)]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>{t.search.moreFilters}</span>
          <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
        </button>

        {/* 6. Primary Search Submit Action Button */}
        <button
          type="submit"
          aria-label={t.search.submit}
          className="inline-flex size-[54px] shrink-0 items-center justify-center rounded-full bg-[var(--primaryColor)] text-[var(--on-primary)] shadow-sm transition-transform duration-150 hover:bg-[var(--primaryColorHover)] hover:scale-105 active:scale-95"
        >
          <Search className="h-5 w-5" />
        </button>
      </motion.form>

      {/* ───────── Mobile Search Form ───────── */}
      <motion.form
        role="search"
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-raised lg:hidden"
      >
        {/* Location Selector */}
        <button
          type="button"
          onClick={() => setActiveMenu(activeMenu === 'location' ? null : 'location')}
          className="flex h-12 w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-start"
        >
          <div className="flex items-center gap-2.5 truncate">
            <MapPin className="h-4 w-4 text-[var(--primaryColor)]" />
            <span className="truncate text-sm font-semibold text-[var(--text)]">{locationLabel}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        </button>

        <div className="flex items-center gap-2">
          {/* Segmented Buy / Rent switch */}
          <PurposeToggle
            value={purpose}
            onChange={(p) => {
              setPurpose(p);
              setMax('');
            }}
            className="h-11 flex-1"
          />

          {/* More Filters trigger */}
          <button
            type="button"
            onClick={() => setActiveMenu('more')}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--text)]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>{t.results.filters}</span>
          </button>

          {/* Search Button */}
          <button
            type="submit"
            aria-label={t.search.submit}
            className="inline-flex size-11 items-center justify-center rounded-full bg-[var(--primaryColor)] text-[var(--on-primary)] shadow-sm"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </motion.form>

      {/* ───────── More Filters Modal Dialog ───────── */}
      <AnimatePresence>
        {activeMenu === 'more' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMenu(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-raised"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <h3 className="text-xl font-bold text-[var(--text)]">{t.search.moreFilters}</h3>
                <button
                  type="button"
                  onClick={() => setActiveMenu(null)}
                  className="grid size-8 place-items-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-5 py-5 max-h-[60vh] overflow-y-auto">
                {/* Purpose */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    {t.results.purpose}
                  </label>
                  <PurposeToggle value={purpose} onChange={(p) => setPurpose(p)} className="h-11 w-full" />
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    {t.search.type}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((tp) => {
                      const on = type === tp.key;
                      const label = tp.labelKey ? t.typeOne[tp.labelKey] : t.search.allTypes;
                      return (
                        <button
                          key={tp.key || 'any'}
                          type="button"
                          onClick={() => setType(tp.key)}
                          className={cn(
                            'rounded-full px-4 py-2 text-sm font-semibold transition-colors border',
                            on
                              ? 'border-[var(--primaryColor)] bg-[var(--primaryColor)] text-[var(--on-primary)]'
                              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-hover)]',
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    {t.search.beds}
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {BEDS_OPTIONS.map((b) => {
                      const on = beds === b.val;
                      return (
                        <button
                          key={b.val || 'any'}
                          type="button"
                          onClick={() => setBeds(b.val)}
                          className={cn(
                            'h-10 rounded-xl text-sm font-semibold transition-colors border',
                            on
                              ? 'border-[var(--primaryColor)] bg-[var(--primaryColor)] text-[var(--on-primary)]'
                              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-hover)]',
                          )}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    {t.search.budget}
                  </label>
                  <select
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--primaryColor)]"
                  >
                    {BUDGETS[purpose].map((b) => (
                      <option key={b.val || 'any'} value={b.val}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setArea('');
                    setType('');
                    setMax('');
                    setBeds('');
                  }}
                  className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  {t.search.resetFilters}
                </button>
                <button
                  type="button"
                  onClick={() => submit()}
                  className="rounded-full bg-[var(--primaryColor)] px-6 py-2.5 text-sm font-semibold text-[var(--on-primary)] transition-all hover:bg-[var(--primaryColorHover)] shadow-sm"
                >
                  {t.search.applyFilters}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
