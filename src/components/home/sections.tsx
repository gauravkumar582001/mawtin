'use client';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Compass,
  FileCheck2,
  Hand,
  KeyRound,
  Layers,
  MapPin,
  Moon,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { CardGrid } from '@/components/property/property-card';
import { VillaViewer } from '@/components/three/villa-viewer';
import { ButtonLink, CountUp, Reveal, SectionHead } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import { areaImage } from '@/lib/mock';
import type { Agency, Area, PropertyCard, PropertyType } from '@/lib/types';
import { cn, pick } from '@/lib/utils';

// ───────── 1. Stats strip ─────────
export function Stats({ homes, agencies, areas }: { homes: number; agencies: number; areas: number }) {
  const { t } = useI18n();
  const items: [number, string][] = [
    [homes, t.stats.homes],
    [agencies, t.stats.agencies],
    [areas, t.stats.areas],
    [homes, t.stats.views3d],
  ];

  return (
    <section className="wrap my-8">
      <div className="grid grid-cols-2 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] lg:grid-cols-4 shadow-sm">
        {items.map(([n, label], i) => (
          <div
            key={label}
            className={cn(
              'px-6 py-6 sm:px-8',
              i % 2 === 1 && 'border-s border-[var(--border)]',
              i >= 2 && 'border-t border-[var(--border)] lg:border-t-0',
              i === 2 && 'lg:border-s',
            )}
          >
            <b className="block font-[family-name:var(--font-manrope)] text-[clamp(32px,3.2vw,44px)] font-extrabold leading-none tracking-[-0.03em] text-[var(--text)]">
              <CountUp to={n} />
            </b>
            <span className="mt-2 block text-[13.5px] font-medium text-[var(--text-muted)]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ───────── 2. "A few places to fall for" (Featured listings) ─────────
export function Featured({ cards }: { cards: PropertyCard[] }) {
  const { t } = useI18n();
  const [type, setType] = useState<PropertyType | ''>('');
  const shown = useMemo(() => (type ? cards.filter((c) => c.type === type) : cards).slice(0, 6), [cards, type]);

  const chips: [PropertyType | '', string][] = [
    ['', t.featured.all],
    ['VILLA', t.types.VILLA],
    ['APARTMENT', t.types.APARTMENT],
    ['TOWNHOUSE', t.types.TOWNHOUSE],
  ];

  return (
    <section className="wrap py-[72px] lg:py-[88px]" id="featured">
      <SectionHead
        eyebrow={t.featured.eyebrow}
        title={t.featured.title}
        sub={t.featured.sub}
        action={
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5" role="tablist">
            {chips.map(([k, label]) => {
              const active = type === k;
              return (
                <button
                  key={k || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setType(k)}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors duration-200',
                    active ? 'text-[var(--on-primary)]' : 'text-[var(--text)] hover:text-[var(--primaryColor)]',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="featured-chip-bg"
                      className="absolute inset-0 rounded-full bg-[var(--primaryColor)] shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>
        }
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <CardGrid cards={shown} priorityFirst />
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex justify-center">
        <ButtonLink href="/properties?purpose=buy" variant="outline" size="lg">
          <span>{t.featured.viewAll}</span>
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
        </ButtonLink>
      </div>
    </section>
  );
}

// ───────── 3. "Homes for every way of living" (Category Cards) ─────────
export function Types({ counts }: { counts: Record<string, number> }) {
  const { t } = useI18n();
  const items: [PropertyType, string, string, string][] = [
    ['VILLA', '/homes/villa-2.webp', t.types.VILLA, t.types.VILLA_P],
    ['APARTMENT', '/homes/living.webp', t.types.APARTMENT, t.types.APARTMENT_P],
    ['TOWNHOUSE', '/homes/townhouse.webp', t.types.TOWNHOUSE, t.types.TOWNHOUSE_P],
  ];

  return (
    <section className="wrap pb-[72px] lg:pb-[88px]">
      <SectionHead eyebrow={t.types.eyebrow} title={t.types.title} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr]">
        {items.map(([k, img, title, sub], i) => (
          <Reveal key={k} delay={i * 0.08} className={cn(i === 0 && 'sm:col-span-2 lg:col-span-1')}>
            <Link
              href={`/properties?type=${k}`}
              className="group relative isolate block h-[320px] overflow-hidden rounded-[24px] border border-[var(--border)] text-white shadow-sm lg:h-[380px]"
            >
              <Image
                src={img}
                alt={title}
                fill
                sizes="(max-width:1024px) 100vw, 33vw"
                className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1a1f]/90 via-[#0b1a1f]/35 to-transparent" />
              <span className="absolute end-5 top-5 grid size-11 place-items-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-300 group-hover:bg-[var(--primaryColor)] group-hover:scale-105">
                <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
              </span>
              <div className="absolute inset-x-6 bottom-6">
                <span className="tabular rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md">
                  {counts[k] ?? 0} {t.types.homes}
                </span>
                <h3 className="mb-1.5 mt-3 text-[26px] font-bold leading-tight text-white">{title}</h3>
                <p className="max-w-xs text-sm text-white/80">{sub}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ───────── 4. "Buying or renting, made clear" (Velra Dual Cards) ─────────
export function BuyingRenting() {
  const { t } = useI18n();

  return (
    <section className="wrap pb-[72px] lg:pb-[88px]">
      <SectionHead
        eyebrow={t.ways.eyebrow}
        title={t.ways.title}
        sub={t.ways.sub}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {/* Buying Card */}
        <Reveal delay={0.05}>
          <div className="card flex h-full flex-col justify-between p-8 sm:p-10 transition-shadow hover:shadow-raised">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-tint)] px-3.5 py-1 text-xs font-bold text-[var(--primaryColor)] uppercase tracking-wider">
                {t.search.buy}
              </span>
              <h3 className="mt-4 text-[26px] font-bold text-[var(--text)]">{t.ways.buyTitle}</h3>
              <ul className="mt-6 flex flex-col gap-4">
                {t.ways.buyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px] text-[var(--text)]">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--primary-tint)] text-[var(--primaryColor)]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <ButtonLink href="/properties?purpose=buy" variant="primary" size="md">
                <span>{t.ways.buyCta}</span>
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </ButtonLink>
            </div>
          </div>
        </Reveal>

        {/* Renting Card */}
        <Reveal delay={0.12}>
          <div className="card flex h-full flex-col justify-between p-8 sm:p-10 transition-shadow hover:shadow-raised">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-tint)] px-3.5 py-1 text-xs font-bold text-[var(--primaryColor)] uppercase tracking-wider">
                {t.search.rent}
              </span>
              <h3 className="mt-4 text-[26px] font-bold text-[var(--text)]">{t.ways.rentTitle}</h3>
              <ul className="mt-6 flex flex-col gap-4">
                {t.ways.rentPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px] text-[var(--text)]">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--primary-tint)] text-[var(--primaryColor)]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <ButtonLink href="/properties?purpose=rent" variant="outline" size="md">
                <span>{t.ways.rentCta}</span>
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ───────── 5. "Find your kind of neighborhood" (Parallax Cards) ─────────
function HoodCard({ area, i }: { area: Area; i: number }) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <Reveal delay={(i % 3) * 0.08}>
      <Link
        ref={ref}
        href={`/properties?area=${area.slug}`}
        className="group relative isolate block h-[240px] overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] text-white shadow-sm"
      >
        <motion.div className="absolute inset-x-0 -inset-y-[12%] -z-20" style={{ y }}>
          <Image
            src={areaImage(area.slug)}
            alt={pick(lang, area.name, area.nameAr)}
            fill
            sizes="(max-width:640px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b1a1f]/85 via-[#0b1a1f]/25 to-transparent" />
        <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-2.5">
          <div>
            <b className="block font-[family-name:var(--font-manrope)] text-2xl font-bold leading-tight">
              {pick(lang, area.name, area.nameAr)}
            </b>
            <small className="mt-0.5 block text-[13px] text-white/80">
              {pick(lang, area.blurb ?? '', area.blurbAr)}
            </small>
          </div>
          <span className="tabular whitespace-nowrap rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            {area.listingCount} {t.hoods.homes}
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export function Neighbourhoods({ areas }: { areas: Area[] }) {
  const { t } = useI18n();

  return (
    <section className="wrap pb-[72px] lg:pb-[88px]" id="neighborhoods">
      <SectionHead eyebrow={t.hoods.eyebrow} title={t.hoods.title} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((a, i) => (
          <HoodCard key={a.slug} area={a} i={i} />
        ))}
      </div>
    </section>
  );
}

// ───────── 6. "Good homes. Thoughtful guidance." (Meet Velra) ─────────
export function Guidance() {
  const { t } = useI18n();
  const icons = [Compass, CalendarDays, FileCheck2];

  return (
    <section className="wrap pb-[72px] lg:pb-[88px]">
      <div className="card rounded-[28px] p-8 sm:p-12 lg:p-16 border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--background)]">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
          <div>
            <span className="eyebrow">{t.guidance.eyebrow}</span>
            <h2 className="mt-2.5 text-[clamp(28px,3.2vw,44px)] font-bold text-[var(--text)]">{t.guidance.title}</h2>
            <p className="mt-3.5 max-w-lg text-[16px] leading-relaxed text-[var(--text-muted)]">{t.guidance.sub}</p>
            <div className="mt-8 flex flex-col gap-3.5">
              {t.guidance.points.map((pt, i) => {
                const Icon = icons[i] ?? Sparkles;
                return (
                  <div key={pt} className="flex items-center gap-3 text-[15px] font-semibold text-[var(--text)]">
                    <span className="grid size-9 place-items-center rounded-full bg-[var(--primary-tint)] text-[var(--primaryColor)]">
                      <Icon className="size-4" />
                    </span>
                    <span>{pt}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-9">
              <ButtonLink href="/agencies" variant="primary" size="lg">
                <span>{t.guidance.cta}</span>
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </ButtonLink>
            </div>
          </div>

          <div className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-[var(--border)] shadow-raised">
            <Image
              src="/homes/living.webp"
              alt="Velra real estate consultation studio"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────── 7. 3D Villa Interactive Showcase ─────────
export function Showcase3D({ featured }: { featured?: PropertyCard }) {
  const { t, lang } = useI18n();

  return (
    <section id="show3d" className="scroll-mt-24 border-y border-[var(--border)] bg-[var(--surface)] py-[88px]">
      <div className="wrap grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <Reveal>
          <div className="eyebrow">{t.show3d.eyebrow}</div>
          <h2 className="mt-2.5 text-[clamp(28px,3.2vw,44px)] font-bold text-[var(--text)]">{t.show3d.title}</h2>
          <p className="mt-3.5 max-w-md text-base leading-relaxed text-[var(--text-muted)]">{t.show3d.sub}</p>
          <ul className="my-8 grid gap-4">
            {(
              [
                [RotateCw, t.show3d.a, t.show3d.aP],
                [Layers, t.show3d.b, t.show3d.bP],
                [Moon, t.show3d.c, t.show3d.cP],
              ] as const
            ).map(([Icon, h, p]) => (
              <li key={h} className="flex items-start gap-3.5 text-[var(--text)]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--primary-tint)] text-[var(--primaryColor)]">
                  <Icon className="size-4" />
                </span>
                <div>
                  <b className="block font-semibold text-[var(--text)]">{h}</b>
                  <span className="text-sm text-[var(--text-muted)]">{p}</span>
                </div>
              </li>
            ))}
          </ul>
          {featured && (
            <ButtonLink href={`/properties/${featured.slug}`} variant="primary">
              <span>{t.show3d.cta}</span>
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </ButtonLink>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--background)] p-3 shadow-raised">
            <VillaViewer
              height={420}
              label={
                featured
                  ? {
                      title: pick(lang, featured.title, featured.titleAr),
                      sub: `${pick(lang, featured.area.name, featured.area.nameAr)} · ${featured.builtUpArea} ${t.card.sqm}`,
                    }
                  : undefined
              }
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ───────── 8. Journey (How It Works) ─────────
export function Journey() {
  const { t } = useI18n();
  const icons = [Search, CalendarDays, Hand, KeyRound];

  return (
    <section className="wrap py-[72px] lg:py-[88px]">
      <SectionHead eyebrow={t.journey.eyebrow} title={t.journey.title} />
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.journey.steps.map(([h, p], i) => {
          const Icon = icons[i];
          return (
            <motion.li
              key={h}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="card flex h-full flex-col p-6 transition-all hover:border-[var(--primaryColor)] hover:shadow-raised"
            >
              <div className="flex items-center gap-2.5 font-[family-name:var(--font-manrope)] text-sm font-bold text-[var(--primaryColor)] after:h-px after:flex-1 after:bg-[var(--border)]">
                <span className="tabular">0{i + 1}</span>
              </div>
              <div className="mt-4 grid size-12 place-items-center rounded-2xl bg-[var(--primary-tint)] text-[var(--primaryColor)]">
                <Icon className="size-[22px]" />
              </div>
              <h3 className="mb-2 mt-4 text-[20px] font-bold text-[var(--text)]">{h}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{p}</p>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

// ───────── 9. Agencies Marquee Strip ─────────
export function AgencyMarquee({ agencies }: { agencies: Agency[] }) {
  const { t, lang } = useI18n();
  const row = [...agencies, ...agencies];

  return (
    <section className="pb-[72px] lg:pb-[88px]">
      <div className="wrap">
        <SectionHead
          eyebrow={t.agencies.eyebrow}
          title={t.agencies.title}
          action={
            <Link href="/agencies" className="group inline-flex items-center gap-2 font-semibold text-[var(--primaryColor)]">
              <span>{t.agencies.all}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
            </Link>
          }
        />
      </div>
      <div className="overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused] rtl:animate-marquee-rtl">
          {row.map((a, i) => (
            <Link
              key={`${a.slug}-${i}`}
              href={`/agencies/${a.slug}`}
              tabIndex={i >= agencies.length ? -1 : undefined}
              aria-hidden={i >= agencies.length}
              className="flex min-w-[280px] items-center gap-3.5 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] py-3.5 pe-5 ps-3.5 transition-all hover:-translate-y-1 hover:border-[var(--primaryColor)] hover:shadow-raised"
            >
              <span
                className="grid size-[52px] shrink-0 place-items-center rounded-2xl font-[family-name:var(--font-manrope)] text-[18px] font-extrabold text-white"
                style={{ background: a.brandColor ?? 'var(--primaryColor)' }}
              >
                {a.name.split(' ').map((w) => w[0]).join('').slice(0, 3)}
              </span>
              <div>
                <b className="block text-[15px] font-bold text-[var(--text)]">{pick(lang, a.name, a.nameAr)}</b>
                <small className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--success)]">
                    <ShieldCheck className="size-3.5" />
                    {t.agencies.licensed}
                  </span>
                  <span>·</span>
                  <span>{t.agencies.since} {a.foundedYear}</span>
                </small>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────── 10. Questions People Ask (FAQ Accordion) ─────────
export function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState(0);

  return (
    <section className="wrap scroll-mt-24 pb-[72px] lg:pb-[88px]" id="faq">
      <SectionHead title={t.faq.title} />
      <div className="max-w-[840px]">
        {t.faq.items.map(([q, a], i) => {
          const on = open === i;
          return (
            <div key={q} className="border-b border-[var(--border)] py-5">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 text-start text-[17px] font-bold text-[var(--text)] transition-colors hover:text-[var(--primaryColor)]"
              >
                <span>{q}</span>
                <motion.span
                  animate={{ rotate: on ? 45 : 0 }}
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full border border-[var(--border)] transition-colors',
                    on ? 'bg-[var(--primary-tint)] text-[var(--primaryColor)] border-[var(--primaryColor)]' : 'bg-[var(--surface)] text-[var(--text-muted)]',
                  )}
                >
                  <Plus className="size-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-[700px] pt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
                      {a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ───────── 11. Velra Closing Call-to-Action ─────────
export function Cta() {
  const { t } = useI18n();

  return (
    <section className="wrap pb-16 lg:pb-24">
      <Reveal className="relative isolate flex flex-wrap items-center justify-between gap-8 overflow-hidden rounded-[32px] bg-[#162f37] px-8 py-14 sm:px-14 sm:py-16 text-white shadow-raised">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgba(90,170,184,0.35),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(196,125,72,0.3),transparent_50%)]" />
        <div>
          <h2 className="max-w-[560px] text-[clamp(28px,3.4vw,44px)] font-extrabold leading-tight text-white">
            {t.cta.title}
          </h2>
          <p className="mt-3 max-w-[520px] text-base leading-relaxed text-[#d6e7eb]">
            {t.cta.sub}
          </p>
        </div>
        <ButtonLink href="/properties?purpose=buy" variant="white" size="lg">
          <span>{t.cta.button}</span>
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
        </ButtonLink>
      </Reveal>
    </section>
  );
}
