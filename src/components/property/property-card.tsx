'use client';
import { BedDouble, Bath, Check, Heart, MapPin, Maximize2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
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
      whileTap={{ scale: 0.85 }}
      aria-pressed={on}
      aria-label={t.nav.saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toast(toggle(card) ? t.saved.added : t.saved.removed);
      }}
      className={cn('grid size-10 place-items-center rounded-full bg-white/90 text-[#16303a] backdrop-blur transition hover:scale-110', on && 'text-[#c2493f]', className)}
    >
      <motion.span key={String(on)} initial={{ scale: on ? 1.5 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
        <Heart className="size-[19px]" fill={on ? 'currentColor' : 'none'} />
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
        if (toggle(card) === 'full') toast(t.compare.max);
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition [&_svg]:size-3.5',
        on ? 'border-teal bg-teal-soft text-teal' : 'border-line text-muted hover:border-teal hover:text-teal',
        className,
      )}
    >
      {on ? <Check /> : <Plus />}
      {t.card.compare}
    </button>
  );
}

export function PropertyCard({ card, priority, layout = 'grid' }: { card: Card; priority?: boolean; layout?: 'grid' | 'list' }) {
  const { t, lang } = useI18n();
  const title = titleOf(card, lang);
  const href = `/properties/${card.slug}`;
  const status = card.status === 'UNDER_OFFER' ? t.card.underOffer : card.status === 'SOLD' ? t.card.sold : card.status === 'RENTED' ? t.card.rented : null;

  return (
    <TiltCard className="h-full rounded-[22px]">
      <article className={cn('card relative h-full overflow-hidden transition-shadow duration-500 hover:shadow-lift', layout === 'list' && 'md:grid md:grid-cols-[340px_1fr]')}>
        <Link href={href} className={cn('group relative block overflow-hidden bg-sand', layout === 'list' ? 'h-[230px] md:h-full' : 'h-[250px]')} aria-label={title}>
          <Image
            src={card.images[0]?.url ?? '/homes/villa.webp'}
            alt={card.images[0]?.alt ?? title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 400px"
            className="object-cover transition-transform duration-1000 ease-out-soft group-hover:scale-[1.08]"
          />
          {card.images[1] && (
            <Image
              src={card.images[1].url}
              alt=""
              fill
              sizes="400px"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          <div className="absolute start-3.5 top-3.5 z-10 flex gap-1.5 text-[11.5px] font-semibold">
            {card.featured && <span className="rounded-full bg-copper px-2.5 py-1.5 text-white">{t.card.featured}</span>}
            {status && <span className="rounded-full bg-ink px-2.5 py-1.5 text-paper">{status}</span>}
            <span className="rounded-full bg-white/90 px-2.5 py-1.5 text-[#16303a]">{t.typeOne[card.type]}</span>
          </div>
          <span className="absolute bottom-3 start-3 z-10 flex items-center gap-1.5 rounded-full bg-[rgba(10,30,36,.62)] py-1 pe-3 ps-1 text-[11.5px] text-white backdrop-blur">
            <Avatar name={card.agency.name} color={card.agency.brandColor} size={26} />
            {pick(lang, card.agency.name, card.agency.nameAr)}
          </span>
        </Link>
        <SaveButton card={card} className="absolute end-3 top-3 z-20" />
        <div className="p-5 [transform:translateZ(22px)]">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <span className="whitespace-nowrap font-display text-[23px] font-bold tracking-[-0.03em] text-teal">
              <span className="tabular">{omr(card.price)}</span>
              {card.purpose === 'RENT' && <small className="ms-1 font-sans text-[12.5px] font-normal tracking-normal text-muted">{t.card.perMonth}</small>}
            </span>
            <CompareButton card={card} />
          </div>
          <h3 className="mb-1 mt-2 text-[19px] tracking-[-0.02em]">
            <Link href={href} className="hover:text-teal">
              {title}
            </Link>
          </h3>
          <div className="flex items-center gap-1.5 text-[13px] text-muted">
            <MapPin className="size-3.5" />
            {pick(lang, card.area.name, card.area.nameAr)}, {t.common.muscat}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 border-t border-dashed border-line pt-3.5 text-[13px] text-ink-2 [&_svg]:size-4 [&_svg]:text-teal">
            <span className="inline-flex items-center gap-1.5"><BedDouble /><b className="tabular">{card.bedrooms}</b> {t.card.bd}</span>
            <span className="inline-flex items-center gap-1.5"><Bath /><b className="tabular">{card.bathrooms}</b> {t.card.ba}</span>
            <span className="inline-flex items-center gap-1.5"><Maximize2 /><b className="tabular">{card.builtUpArea}</b> {t.card.sqm}</span>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

/** Staggered grid entrance for lists of cards. */
export function CardGrid({ cards, layout = 'grid', priorityFirst }: { cards: Card[]; layout?: 'grid' | 'list'; priorityFirst?: boolean }) {
  return (
    <motion.div
      layout
      className={cn('grid gap-6', layout === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      {cards.map((c, i) => (
        <motion.div
          key={c.id}
          layout
          variants={{ hidden: { opacity: 0, y: 26, rotateX: 8 }, show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.65 } } }}
          className="relative"
        >
          <PropertyCard card={c} layout={layout} priority={priorityFirst && i < 3} />
        </motion.div>
      ))}
    </motion.div>
  );
}
