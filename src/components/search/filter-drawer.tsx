'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal, Check, RotateCcw, Building2, Bath } from 'lucide-react';
import { PurposeToggle } from '@/components/home/search-bar';
import { btn, inputCls } from '@/lib/ui-styles';
import { useI18n } from '@/i18n/client';
import type { Area, SearchParams } from '@/lib/types';
import { cn, pick } from '@/lib/utils';

const AMENITIES = [
  { key: 'pool', label: 'Private pool', labelAr: 'مسبح خاص' },
  { key: 'garden', label: 'Garden', labelAr: 'حديقة' },
  { key: 'parking', label: 'Covered parking', labelAr: 'موقف مغطى' },
  { key: 'ac', label: 'Central A/C', labelAr: 'تكييف مركزي' },
  { key: 'maid', label: "Maid's room", labelAr: 'غرفة عاملة' },
  { key: 'gym', label: 'Gym', labelAr: 'صالة رياضية' },
  { key: 'sea', label: 'Sea view', labelAr: 'إطلالة بحرية' },
  { key: 'wifi', label: 'Fibre internet', labelAr: 'إنترنت فايبر' },
];

const TYPES = ['VILLA', 'APARTMENT', 'TOWNHOUSE', 'PENTHOUSE'] as const;

const AGENCIES = [
  { slug: 'saraya-estates', name: 'Saraya Estates', nameAr: 'سرايا العقارية' },
  { slug: 'al-khaleej-homes', name: 'Al Khaleej Homes', nameAr: 'منازل الخليج' },
  { slug: 'liwan-realty', name: 'Liwan Realty', nameAr: 'ليوان للعقارات' },
  { slug: 'sidr-and-stone', name: 'Sidr & Stone', nameAr: 'سدر وحجر' },
];

export interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  params: SearchParams;
  areas: Area[];
  areaCounts: Record<string, number>;
  totalResults: number;
  onApply: (patch: Partial<Record<keyof SearchParams, string | undefined>>) => void;
  onReset: () => void;
}

export function FilterDrawer({
  open,
  onClose,
  params,
  areas,
  areaCounts,
  totalResults,
  onApply,
  onReset,
}: FilterDrawerProps) {
  const { t, lang } = useI18n();

  // Local state initialized from params
  const [purpose, setPurpose] = useState<'buy' | 'rent'>(params.purpose === 'rent' ? 'rent' : 'buy');
  const [type, setType] = useState<string | undefined>(params.type);
  const [beds, setBeds] = useState<string | undefined>(params.beds);
  const [baths, setBaths] = useState<string | undefined>(params.baths);
  const [minArea, setMinArea] = useState<number>(Number(params.minArea ?? 0));
  const [agency, setAgency] = useState<string | undefined>(params.agency);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    params.area?.split(',').filter(Boolean) ?? []
  );
  const [selectedAmen, setSelectedAmen] = useState<string[]>(
    params.amenities?.split(',').filter(Boolean) ?? []
  );
  const [q, setQ] = useState(params.q ?? '');

  const maxRange =
    purpose === 'rent'
      ? { min: 400, max: 2000, step: 50 }
      : { min: 50000, max: 350000, step: 5000 };

  const [price, setPrice] = useState<number>(Number(params.maxPrice ?? maxRange.max));

  // Sync state when drawer opens or params change
  useEffect(() => {
    if (open) {
      setPurpose(params.purpose === 'rent' ? 'rent' : 'buy');
      setType(params.type);
      setBeds(params.beds);
      setBaths(params.baths);
      setMinArea(Number(params.minArea ?? 0));
      setAgency(params.agency);
      setSelectedAreas(params.area?.split(',').filter(Boolean) ?? []);
      setSelectedAmen(params.amenities?.split(',').filter(Boolean) ?? []);
      setQ(params.q ?? '');
      setPrice(Number(params.maxPrice ?? (params.purpose === 'rent' ? 2000 : 350000)));
    }
  }, [open, params]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const toggleItem = (list: string[], val: string) =>
    list.includes(val) ? list.filter((i) => i !== val) : [...list, val];

  const handleApply = () => {
    onApply({
      purpose,
      type: type || undefined,
      beds: beds || undefined,
      baths: baths || undefined,
      minArea: minArea > 0 ? String(minArea) : undefined,
      agency: agency || undefined,
      area: selectedAreas.join(',') || undefined,
      amenities: selectedAmen.join(',') || undefined,
      q: q || undefined,
      maxPrice: price >= maxRange.max ? undefined : String(price),
    });
    onClose();
  };

  const handleClearAll = () => {
    setPurpose('buy');
    setType(undefined);
    setBeds(undefined);
    setBaths(undefined);
    setMinArea(0);
    setAgency(undefined);
    setSelectedAreas([]);
    setSelectedAmen([]);
    setQ('');
    setPrice(350000);
    onReset();
    onClose();
  };

  const activeFiltersCount =
    (type ? 1 : 0) +
    (beds ? 1 : 0) +
    (baths ? 1 : 0) +
    (minArea > 0 ? 1 : 0) +
    (agency ? 1 : 0) +
    selectedAreas.length +
    selectedAmen.length +
    (q ? 1 : 0) +
    (price < maxRange.max ? 1 : 0);

  const sectionHeading = 'font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-text-muted mb-3';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            aria-hidden
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: lang === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 flex h-full w-full max-w-[480px] flex-col bg-surface shadow-2xl border-s border-border"
            role="dialog"
            aria-modal="true"
            aria-label={t.results?.filters ?? 'Filters'}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border px-4 sm:px-6 py-3.5 sm:py-4">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="size-4 text-primaryColor" />
                <h3 className="text-base sm:text-lg font-bold text-text">
                  {t.results?.filters ?? 'Filters'}
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primaryColor text-[11px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full border border-border text-text-muted hover:border-text hover:text-text transition-colors"
                aria-label={t.detail?.close ?? 'Close'}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
              {/* Purpose Toggle */}
              <div>
                <h4 className={sectionHeading}>{t.results?.purpose ?? 'Purpose'}</h4>
                <PurposeToggle
                  value={purpose}
                  onChange={(p) => {
                    setPurpose(p);
                    setPrice(p === 'rent' ? 2000 : 350000);
                  }}
                  className="h-12 w-full"
                />
              </div>

              {/* Keyword Search */}
              <div>
                <label htmlFor="drawer-search" className={sectionHeading + ' block'}>
                  {t.results?.search ?? 'Search'}
                </label>
                <input
                  id="drawer-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث بالاسم أو المنطقة...' : 'Search by title or area...'}
                  className={inputCls}
                />
              </div>

              {/* Property Types */}
              <div>
                <h4 className={sectionHeading}>{t.search?.type ?? 'Property Type'}</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setType(undefined)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border',
                      !type
                        ? 'border-primaryColor bg-primaryColor text-white shadow-xs'
                        : 'border-border bg-surface text-text hover:border-primaryColor'
                    )}
                  >
                    {t.featured?.all ?? 'All'}
                  </button>
                  {TYPES.map((k) => {
                    const isSelected = type === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setType(isSelected ? undefined : k)}
                        className={cn(
                          'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border',
                          isSelected
                            ? 'border-primaryColor bg-primaryColor text-white shadow-xs'
                            : 'border-border bg-surface text-text hover:border-primaryColor'
                        )}
                      >
                        {t.typeOne?.[k] ?? k}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={sectionHeading}>{t.results?.maxPrice ?? 'Max Price'}</h4>
                  <div className="font-display text-sm font-bold text-primaryColor tabular">
                    {price.toLocaleString('en-US')}{' '}
                    <span className="font-sans text-xs font-normal text-text-muted">
                      OMR{price >= maxRange.max ? '+' : ''}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={maxRange.min}
                  max={maxRange.max}
                  step={maxRange.step}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full accent-[var(--primaryColor)] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1 tabular">
                  <span>{maxRange.min.toLocaleString('en-US')} OMR</span>
                  <span>{maxRange.max.toLocaleString('en-US')}+ OMR</span>
                </div>
              </div>

              {/* Bedrooms Buttons */}
              <div>
                <h4 className={sectionHeading}>{t.search?.beds ?? 'Bedrooms'}</h4>
                <div className="grid grid-cols-6 rounded-xl border border-border overflow-hidden">
                  {[0, 1, 2, 3, 4, 5].map((b) => {
                    const isSelected = b === 0 ? !beds : Number(beds) === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBeds(b === 0 ? undefined : String(b))}
                        className={cn(
                          'py-2.5 text-xs font-semibold transition-colors border-s border-border first:border-s-0',
                          isSelected
                            ? 'bg-primaryColor text-white'
                            : 'bg-surface text-text hover:bg-surface-hover'
                        )}
                      >
                        {b === 0 ? (t.search?.any ?? 'Any') : b === 5 ? '5+' : b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bathrooms Buttons */}
              <div>
                <h4 className={sectionHeading}>{t.detail?.baths ?? 'Bathrooms'}</h4>
                <div className="grid grid-cols-5 rounded-xl border border-border overflow-hidden">
                  {[0, 1, 2, 3, 4].map((ba) => {
                    const isSelected = ba === 0 ? !baths : Number(baths) === ba;
                    return (
                      <button
                        key={ba}
                        type="button"
                        onClick={() => setBaths(ba === 0 ? undefined : String(ba))}
                        className={cn(
                          'py-2.5 text-xs font-semibold transition-colors border-s border-border first:border-s-0',
                          isSelected
                            ? 'bg-primaryColor text-white'
                            : 'bg-surface text-text hover:bg-surface-hover'
                        )}
                      >
                        {ba === 0 ? (t.search?.any ?? 'Any') : ba === 4 ? '4+' : ba}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minimum Built-up Area Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={sectionHeading}>
                    {lang === 'ar' ? 'المساحة المبنية الصغرى' : 'Min Built-up Area'}
                  </h4>
                  <div className="font-display text-sm font-bold text-primaryColor tabular">
                    {minArea > 0 ? `${minArea} m²` : (lang === 'ar' ? 'الكل' : 'Any size')}
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={25}
                  value={minArea}
                  onChange={(e) => setMinArea(Number(e.target.value))}
                  className="w-full accent-[var(--primaryColor)] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1 tabular">
                  <span>0 m²</span>
                  <span>250 m²</span>
                  <span>500+ m²</span>
                </div>
              </div>

              {/* Agency Filter */}
              <div>
                <h4 className={sectionHeading}>
                  {lang === 'ar' ? 'الوكالة العقارية' : 'Licensed Real Estate Agency'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAgency(undefined)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition-all border',
                      !agency
                        ? 'border-primaryColor bg-primaryColor text-white shadow-xs'
                        : 'border-border bg-surface text-text hover:border-primaryColor'
                    )}
                  >
                    {lang === 'ar' ? 'جميع الوكالات' : 'All Agencies'}
                  </button>
                  {AGENCIES.map((ag) => {
                    const isSelected = agency === ag.slug;
                    return (
                      <button
                        key={ag.slug}
                        type="button"
                        onClick={() => setAgency(isSelected ? undefined : ag.slug)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-semibold transition-all border',
                          isSelected
                            ? 'border-primaryColor bg-primaryColor text-white shadow-xs'
                            : 'border-border bg-surface text-text hover:border-primaryColor'
                        )}
                      >
                        {lang === 'ar' ? ag.nameAr : ag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Areas Checklist */}
              <div>
                <h4 className={sectionHeading}>{t.results?.areas ?? 'Neighbourhoods'}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {areas.map((a) => {
                    const checked = selectedAreas.includes(a.slug);
                    return (
                      <label
                        key={a.slug}
                        className={cn(
                          'flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-all',
                          checked
                            ? 'border-primaryColor bg-primary-tint/50 text-text font-semibold'
                            : 'border-border bg-surface text-text-muted hover:border-primaryColor hover:text-text'
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setSelectedAreas(toggleItem(selectedAreas, a.slug))}
                            className="size-4 rounded accent-[var(--primaryColor)]"
                          />
                          <span className="truncate">{pick(lang, a.name, a.nameAr)}</span>
                        </div>
                        <span className="tabular text-[11px] text-text-muted ms-1">
                          {areaCounts[a.slug] ?? 0}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Amenities Grid */}
              <div>
                <h4 className={sectionHeading}>{t.results?.amenities ?? 'Amenities'}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {AMENITIES.map((item) => {
                    const isSelected = selectedAmen.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedAmen(toggleItem(selectedAmen, item.key))}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border',
                          isSelected
                            ? 'border-primaryColor bg-primary-tint text-primaryColor font-semibold shadow-2xs'
                            : 'border-border bg-surface text-text-muted hover:border-primaryColor hover:text-text'
                        )}
                      >
                        {isSelected && <Check className="size-3 text-primaryColor" />}
                        <span>{lang === 'ar' ? item.labelAr : item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="border-t border-border bg-surface p-4 flex items-center justify-between gap-3 shadow-lg">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primaryColor transition-colors px-2 py-1"
              >
                <RotateCcw className="size-3" />
                <span>{t.results?.clear ?? 'Clear all'}</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className={cn(btn({ variant: 'primary', size: 'md' }), 'flex-1 shadow-md')}
              >
                <span>
                  {lang === 'ar'
                    ? `عرض العقارات (${totalResults})`
                    : `Show ${totalResults} homes`}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
