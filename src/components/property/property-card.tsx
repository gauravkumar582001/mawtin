'use client';

import { useState } from 'react';
import { BedDouble, Bath, Check, Heart, MapPin, Maximize2, Plus, ChevronLeft, ChevronRight, ShieldCheck, Images, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Avatar, TiltCard } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import type { PropertyCard as Card } from '@/lib/types';
import { cn, omr, pick, titleOf } from '@/lib/utils';
import { useCompare, useSaved } from '@/store/shortlist';

export function SaveButton({ card, className }: { card: Card; className?: string }) {
  const { t } = useI18n();
  const on = useSaved((s) => s.items.some((i) => i.id === card.id));
  const toggle = useSaved((s) => s.toggle);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      aria-pressed={on}
      aria-label={t.nav?.saved ?? 'Save'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(card);
        toast(added ? t.saved?.added ?? 'Saved to shortlist' : t.saved?.removed ?? 'Removed from shortlist');
      }}
      className={cn(
        'relative grid size-9 place-items-center rounded-full bg-surface/90 backdrop-blur-md border border-border/80 shadow-md transition-colors',
        on ? 'text-[#e11d48] border-[#e11d48]/20 bg-rose-50/90 dark:bg-rose-950/60' : 'text-text hover:text-primaryColor hover:bg-surface',
        className
      )}
    >
      <motion.span
        key={String(on)}
        initial={{ scale: on ? 1.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        <Heart className="size-[17px]" fill={on ? 'currentColor' : 'none'} strokeWidth={2.2} />
      </motion.span>
    </motion.button>
  );
}

export function CompareButton({ card, className }: { card: Card; className?: string }) {
  const { t } = useI18n();
  const on = useCompare((s) => s.items.some((i) => i.id === card.id));
  const toggle = useCompare((s) => s.toggle);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const res = toggle(card);
        if (res === 'full') {
          toast(t.compare?.max ?? 'Maximum 3 properties can be compared');
        } else if (res === 'added') {
          toast(t.compare?.added ?? 'Added to comparison');
        } else {
          toast(t.compare?.removed ?? 'Removed from comparison');
        }
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all shadow-2xs',
        on
          ? 'border-primaryColor bg-primary-tint text-primaryColor'
          : 'border-border bg-surface text-text-muted hover:border-primaryColor hover:text-primaryColor',
        className
      )}
    >
      {on ? <Check className="size-3.5 stroke-[2.5]" /> : <Plus className="size-3.5 stroke-[2.5]" />}
      <span>{t.card?.compare ?? 'Compare'}</span>
    </button>
  );
}

export function PropertyCard({
  card,
  priority,
  layout = 'grid',
}: {
  card: Card;
  priority?: boolean;
  layout?: 'grid' | 'list';
}) {
  const { t, lang } = useI18n();
  const title = titleOf(card, lang);
  const href = `/properties/${card.slug}`;
  const status =
    card.status === 'UNDER_OFFER'
      ? t.card?.underOffer ?? 'Under offer'
      : card.status === 'SOLD'
      ? t.card?.sold ?? 'Sold'
      : card.status === 'RENTED'
      ? t.card?.rented ?? 'Rented'
      : null;

  const images = card.images?.length > 0 ? card.images : [{ id: 'fallback', url: '/homes/villa.webp', alt: title }];
  const [activeImg, setActiveImg] = useState(0);

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <TiltCard className="h-full rounded-[20px]">
      <article
        className={cn(
          'group/card relative h-full overflow-hidden rounded-[20px] border border-border bg-surface shadow-xs transition-all duration-300 hover:shadow-card hover:-translate-y-1',
          layout === 'list' && 'md:grid md:grid-cols-[340px_1fr]'
        )}
      >
        {/* Media / Image Container */}
        <div
          className={cn(
            'group relative block overflow-hidden bg-sand-2',
            layout === 'list' ? 'h-[230px] md:h-full min-h-[220px]' : 'aspect-[21/12] w-full'
          )}
        >
          <Link href={href} aria-label={title} className="relative block h-full w-full">
            <Image
              src={images[activeImg]?.url ?? '/homes/villa.webp'}
              alt={images[activeImg]?.alt ?? title}
              fill
              priority={priority && activeImg === 0}
              loading={priority && activeImg === 0 ? 'eager' : 'lazy'}
              sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 420px"
              className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
            />
          </Link>

          {/* Floating Badges (Top Left in LTR, Top Right in RTL) */}
          <div className="pointer-events-none absolute start-3 top-3 z-10 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            {/* Purpose Badge */}
            <span className="rounded-full bg-primaryColor px-2.5 py-1 text-white uppercase tracking-wider shadow-sm">
              {card.purpose === 'RENT'
                ? lang === 'ar'
                  ? 'للإيجار'
                  : 'Rent'
                : lang === 'ar'
                ? 'للبيع'
                : 'Sale'}
            </span>

            {/* Property Type Badge */}
            <span className="rounded-full bg-surface/90 backdrop-blur-md px-2.5 py-1 text-text border border-border/80 shadow-xs">
              {t.typeOne?.[card.type] ?? card.type}
            </span>

            {/* Featured Badge */}
            {card.featured && (
              <span className="rounded-full bg-[#b0693a] px-2.5 py-1 text-white uppercase tracking-wider shadow-sm">
                {t.card?.featured ?? 'Featured'}
              </span>
            )}

            {/* Status Badge */}
            {status && (
              <span className="rounded-full bg-text px-2.5 py-1 text-white shadow-sm">
                {status}
              </span>
            )}
          </div>

          {/* Save / Favorite Heart Button */}
          <SaveButton card={card} className="absolute end-3 top-3 z-20" />

          {/* Multi-image navigation arrows (shown on card hover if >1 image) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute start-2.5 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-text opacity-90 sm:opacity-0 sm:group-hover/card:opacity-100 transition-all hover:bg-surface hover:scale-110 active:scale-95 shadow-md border border-border/60"
              >
                <ChevronLeft className="size-4 rtl-flip" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="absolute end-2.5 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-text opacity-90 sm:opacity-0 sm:group-hover/card:opacity-100 transition-all hover:bg-surface hover:scale-110 active:scale-95 shadow-md border border-border/60"
              >
                <ChevronRight className="size-4 rtl-flip" />
              </button>

              {/* Image pagination dots */}
              <div className="pointer-events-none absolute bottom-9 sm:bottom-3.5 inset-x-0 z-10 flex items-center justify-center gap-1.5">
                {images.slice(0, 5).map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'size-1.5 rounded-full transition-all duration-300',
                      idx === activeImg ? 'w-4 bg-white shadow-xs' : 'bg-white/60'
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Agency Tag Strip overlay on image bottom-start */}
          {card.agency && (
            <Link
              href={`/agencies/${card.agency.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-3 start-3 z-10 flex items-center gap-1.5 rounded-full bg-surface/90 backdrop-blur-md py-1 pe-2.5 sm:pe-3 ps-1 text-[11px] font-semibold text-text border border-border/80 shadow-xs hover:border-primaryColor hover:text-primaryColor transition-all"
            >
              <Avatar name={card.agency.name} color={card.agency.brandColor} size={20} />
              <span className="truncate max-w-[70px] xs:max-w-[100px] sm:max-w-[130px]">{pick(lang, card.agency.name, card.agency.nameAr)}</span>
              <ShieldCheck className="size-3 text-primaryColor shrink-0" />
            </Link>
          )}

          {/* Photo Count Badge & View Detail Button on bottom-end */}
          <div className="absolute bottom-3 end-3 z-20 flex items-center gap-1.5">
            {images.length > 1 && (
              <div className="pointer-events-none flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] sm:text-[10.5px] font-semibold text-white/95 shadow-2xs">
                <Images className="size-3" />
                <span>{images.length}</span>
              </div>
            )}
            <Link
              href={href}
              className="flex items-center gap-1 rounded-full bg-surface/95 backdrop-blur-md px-2 xs:px-2.5 py-1 text-[10.5px] xs:text-[11px] font-bold text-text border border-border/80 shadow-xs hover:bg-primaryColor hover:text-white hover:border-primaryColor transition-all group/vmore"
            >
              <span>
                <span className="hidden xs:inline">{t.card?.viewDetail ?? 'View Detail'}</span>
                <span className="xs:hidden">{lang === 'ar' ? 'عرض' : 'View'}</span>
              </span>
              <ArrowUpRight className="size-3 transition-transform group-hover/vmore:translate-x-0.5 group-hover/vmore:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Card Body Details */}
        <div className="p-4 sm:p-5 flex flex-col justify-between [transform:translateZ(20px)]">
          <div>
            {/* Price & Compare Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="font-display text-[22px] font-bold text-primaryColor tracking-[-0.03em] tabular">
                {omr(card.price)}
                {card.purpose === 'RENT' && (
                  <span className="ms-1 font-sans text-xs font-normal text-text-muted">
                    {t.card?.perMonth ?? '/ month'}
                  </span>
                )}
              </div>
              <CompareButton card={card} />
            </div>

            {/* Property Title */}
            <h3 className="mt-2.5 text-[17px] font-bold text-text tracking-[-0.02em] leading-snug">
              <Link href={href} className="hover:text-primaryColor transition-colors line-clamp-1">
                {title}
              </Link>
            </h3>

            {/* Area Location */}
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
              <MapPin className="size-3.5 text-primaryColor shrink-0" />
              <span className="truncate">
                {pick(lang, card.area.name, card.area.nameAr)}, {t.common?.muscat ?? 'Muscat'}
              </span>
            </div>
          </div>

          {/* Specs Footer (Bedrooms, Bathrooms, Area) */}
          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3.5 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="size-4 text-primaryColor" />
              <b className="tabular text-text font-bold">{card.bedrooms}</b>{' '}
              <span>{t.card?.bd ?? 'bd'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Bath className="size-4 text-primaryColor" />
              <b className="tabular text-text font-bold">{card.bathrooms}</b>{' '}
              <span>{t.card?.ba ?? 'ba'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Maximize2 className="size-4 text-primaryColor" />
              <b className="tabular text-text font-bold">{card.builtUpArea}</b>{' '}
              <span>{t.card?.sqm ?? 'm²'}</span>
            </span>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

/** Staggered grid entrance for lists of cards. */
export function CardGrid({
  cards,
  layout = 'grid',
  priorityFirst,
}: {
  cards: Card[];
  layout?: 'grid' | 'list';
  priorityFirst?: boolean;
}) {
  return (
    <motion.div
      layout
      className={cn('grid gap-6', layout === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {cards.map((c, i) => (
        <motion.div
          key={c.id}
          layout
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
          }}
          className="relative"
        >
          <PropertyCard card={c} layout={layout} priority={priorityFirst && i < 3} />
        </motion.div>
      ))}
    </motion.div>
  );
}
