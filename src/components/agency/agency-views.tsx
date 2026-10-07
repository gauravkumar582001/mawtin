'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Globe,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { CardGrid } from '@/components/property/property-card';
import { Avatar, Reveal, TiltCard } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import type { Agency, PropertyCard } from '@/lib/types';
import { cn, pick } from '@/lib/utils';

const mark = (a: Agency) =>
  a.name
    .split(' ')
    .filter((w) => w && w !== 'Al' && w !== '&')
    .map((w) => w[0])
    .join('')
    .slice(0, 3) || a.name.slice(0, 2).toUpperCase();

export function AgencyList({ agencies }: { agencies: Agency[] }) {
  const { t, lang } = useI18n();
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'listings' | 'since' | 'name'>('listings');

  // Extract unique areas from agencies
  const areas = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; nameAr: string }>();
    agencies.forEach((a) => {
      if (a.area) {
        map.set(a.area.slug, a.area);
      }
    });
    return Array.from(map.values());
  }, [agencies]);

  // Filter and sort agencies
  const filteredAgencies = useMemo(() => {
    let list = agencies.filter((a) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        (a.nameAr && a.nameAr.includes(q)) ||
        (a.about && a.about.toLowerCase().includes(q)) ||
        (a.aboutAr && a.aboutAr.includes(q)) ||
        (a.area && (a.area.name.toLowerCase().includes(q) || a.area.nameAr.includes(q)));

      const matchArea = selectedArea === 'all' || a.area?.slug === selectedArea;

      return matchSearch && matchArea;
    });

    if (sortBy === 'listings') {
      list = [...list].sort((x, y) => y.listingCount - x.listingCount);
    } else if (sortBy === 'since') {
      list = [...list].sort((x, y) => (x.foundedYear ?? 2020) - (y.foundedYear ?? 2020));
    } else if (sortBy === 'name') {
      list = [...list].sort((x, y) =>
        lang === 'ar' ? (x.nameAr ?? x.name).localeCompare(y.nameAr ?? y.name) : x.name.localeCompare(y.name)
      );
    }

    return list;
  }, [agencies, search, selectedArea, sortBy, lang]);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* ───────── Hero Header Section ───────── */}
      <section className="relative border-b border-border/80 bg-surface/50 pt-10 pb-12 sm:pt-14 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(35,107,121,0.08),transparent_70%)] pointer-events-none" />

        <div className="wrap relative">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primaryColor/20 bg-primary-tint/60 px-3.5 py-1 text-xs font-bold text-primaryColor shadow-2xs mb-3.5">
              <ShieldCheck className="size-4" />
              <span>{t.agencies.eyebrow}</span>
            </div>

            {/* Page Title */}
            <h1 className="font-display text-[clamp(30px,4vw,52px)] font-bold text-text tracking-[-0.03em] leading-[1.12]">
              {t.agencies.pageTitle}
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-base sm:text-lg text-text-muted leading-relaxed">
              {t.agencies.sub}
            </p>

            {/* Trust Assurances Strip */}
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-text-muted pt-4 border-t border-border/60">
              <span className="flex items-center gap-1.5 text-text">
                <CheckCircle2 className="size-4 text-primaryColor" />
                <span>{lang === 'ar' ? 'وساطة معتمدة ١٠٠٪' : '100% MHUP Certified'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-text">
                <CheckCircle2 className="size-4 text-primaryColor" />
                <span>{lang === 'ar' ? 'سجل عقاري موثق' : 'Official Broker License'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-text">
                <CheckCircle2 className="size-4 text-primaryColor" />
                <span>{lang === 'ar' ? 'عقود وإجراءات رسمية' : 'End-to-End Escrow & Title'}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Filter & Search Bar ───────── */}
      <section className="wrap pt-8 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.agencies.searchPlaceholder}
              className="w-full h-12 rounded-full border border-border bg-surface ps-11 pe-4 text-sm text-text placeholder:text-text-muted/70 focus:outline-none focus:border-primaryColor focus:ring-2 focus:ring-primaryColor/15 transition-all shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 size-6 rounded-full bg-sand-2 text-text-muted hover:text-text flex items-center justify-center text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Area Chips & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Area Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedArea('all')}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shadow-2xs shrink-0',
                  selectedArea === 'all'
                    ? 'bg-primaryColor text-white'
                    : 'bg-surface border border-border text-text hover:border-primaryColor'
                )}
              >
                {t.agencies.filterAllAreas}
              </button>
              {areas.map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => setSelectedArea(a.slug)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shadow-2xs shrink-0',
                    selectedArea === a.slug
                      ? 'bg-primaryColor text-white'
                      : 'bg-surface border border-border text-text hover:border-primaryColor'
                  )}
                >
                  {pick(lang, a.name, a.nameAr)}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 sm:border-s sm:border-border sm:ps-3 shrink-0 self-start sm:self-auto">
              <SlidersHorizontal className="size-3.5 text-text-muted shrink-0" />
              <select
                value={sortBy}
                aria-label={t.results?.sort ?? 'Sort agencies'}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-text focus:outline-none focus:border-primaryColor transition-colors cursor-pointer shadow-2xs"
              >
                <option value="listings">{t.agencies.sortListings}</option>
                <option value="since">{t.agencies.sortSince}</option>
                <option value="name">{t.agencies.sortName}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-text-muted">
          <span>
            {t.agencies.showingCount.replace('{count}', String(filteredAgencies.length))}
          </span>
          {(search || selectedArea !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedArea('all');
              }}
              className="text-primaryColor hover:underline cursor-pointer"
            >
              {t.results?.clear ?? 'Reset filters'}
            </button>
          )}
        </div>
      </section>

      {/* ───────── Agency Cards Grid ───────── */}
      <section className="wrap">
        {filteredAgencies.length === 0 ? (
          <div className="card my-12 rounded-[24px] border border-border bg-surface p-12 text-center shadow-xs">
            <Building2 className="mx-auto size-12 text-text-muted opacity-40 mb-3" />
            <h3 className="text-lg font-bold text-text">{t.agencies.noAgencies}</h3>
            <p className="mt-1 text-sm text-text-muted">{t.agencies.noAgenciesP}</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedArea('all');
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primaryColor px-5 py-2.5 text-xs font-bold text-white hover:bg-primaryColorHover transition-colors shadow-xs"
            >
              {t.results?.clear ?? 'Reset search'}
            </button>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-2">
            {filteredAgencies.map((agency, i) => {
              const agencyTitle = pick(lang, agency.name, agency.nameAr);
              const agencyAbout = pick(lang, agency.about ?? '', agency.aboutAr);
              const areaName = agency.area ? pick(lang, agency.area.name, agency.area.nameAr) : 'Muscat';

              return (
                <Reveal key={agency.slug} delay={(i % 2) * 0.08}>
                  <TiltCard className="h-full rounded-[24px]">
                    <article className="group/agency relative h-full flex flex-col justify-between overflow-hidden rounded-[24px] border border-border bg-surface shadow-xs transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                      <div>
                        {/* Cover Image */}
                        <div className="relative h-[180px] w-full overflow-hidden bg-sand-2">
                          <Image
                            src={agency.coverUrl ?? '/homes/villa.webp'}
                            alt={agencyTitle}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover/agency:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

                          {/* Top Badges */}
                          <div className="absolute top-3.5 start-4 end-4 flex items-center justify-between pointer-events-none">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-text border border-border/80 shadow-xs">
                              <MapPin className="size-3 text-primaryColor" />
                              <span>{areaName}, {t.common?.muscat ?? 'Muscat'}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                              <ShieldCheck className="size-3.5" />
                              <span>{t.agencies.licensed}</span>
                            </span>
                          </div>
                        </div>

                        {/* Agency Monogram & Info Container */}
                        <div className="relative px-6 pt-11 pb-4">
                          {/* Monogram Badge */}
                          <div
                            className="absolute -top-10 start-6 grid size-[72px] place-items-center rounded-[20px] border-4 border-surface font-display text-2xl font-black text-white shadow-lg [transform:translateZ(30px)] transition-transform duration-300 group-hover/agency:scale-105"
                            style={{ background: agency.brandColor ?? 'var(--primaryColor)' }}
                          >
                            {mark(agency)}
                          </div>

                          {/* Agency Title & License Number */}
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="font-display text-[23px] font-bold text-text tracking-[-0.02em] leading-snug">
                              <Link
                                href={`/agencies/${agency.slug}`}
                                className="hover:text-primaryColor transition-colors"
                              >
                                {agencyTitle}
                              </Link>
                            </h2>
                            <span className="text-[11px] font-semibold text-text-muted/80">
                              {agency.licenseNo}
                            </span>
                          </div>

                          {/* About narrative */}
                          <p className="mt-2 text-sm text-text-muted line-clamp-2 leading-relaxed">
                            {agencyAbout}
                          </p>

                          {/* Key Statistics Strip */}
                          <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-sand/60 border border-border/60 p-3 text-center">
                            <div>
                              <div className="font-display text-[20px] font-bold text-primaryColor tabular leading-none">
                                {agency.listingCount}
                              </div>
                              <div className="mt-1 text-[11px] font-semibold text-text-muted">
                                {t.agencies.listings}
                              </div>
                            </div>
                            <div className="border-x border-border/60">
                              <div className="font-display text-[20px] font-bold text-text tabular leading-none">
                                {agency.memberCount ?? agency.team.length}
                              </div>
                              <div className="mt-1 text-[11px] font-semibold text-text-muted">
                                {t.agencies.agents}
                              </div>
                            </div>
                            <div>
                              <div className="font-display text-[20px] font-bold text-text tabular leading-none">
                                {agency.foundedYear ?? 2015}
                              </div>
                              <div className="mt-1 text-[11px] font-semibold text-text-muted">
                                {t.agencies.est}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Team Avatars & View Portfolio CTA */}
                      <div className="px-6 pb-5 pt-2 flex items-center justify-between border-t border-border/70 mt-2">
                        {/* Team Avatar Stack */}
                        <div className="flex items-center">
                          {agency.team.slice(0, 4).map((member, j) => (
                            <span
                              key={member.id}
                              className={cn('relative', j > 0 && '-ms-2.5')}
                              title={member.fullName}
                            >
                              <span className="block rounded-full ring-2 ring-surface shadow-2xs">
                                <Avatar name={member.fullName} color={agency.brandColor} size={30} />
                              </span>
                            </span>
                          ))}
                          {agency.team.length > 4 && (
                            <span className="-ms-2 flex size-[30px] items-center justify-center rounded-full bg-sand-2 text-[10px] font-bold text-text ring-2 ring-surface shadow-2xs">
                              +{agency.team.length - 4}
                            </span>
                          )}
                        </div>

                        {/* CTA Link */}
                        <Link
                          href={`/agencies/${agency.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-sand-2 hover:bg-primaryColor hover:text-white px-4 py-2 text-xs font-bold text-text border border-border transition-all shadow-2xs group/cta"
                        >
                          <span>{t.agencies.viewPortfolio}</span>
                          <ArrowUpRight className="size-3.5 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                        </Link>
                      </div>
                    </article>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export function AgencyProfile({
  agency: a,
  listings,
}: {
  agency: Agency;
  listings: PropertyCard[];
}) {
  const { t, lang } = useI18n();
  const [filterPurpose, setFilterPurpose] = useState<'ALL' | 'SALE' | 'RENT' | 'FEATURED'>('ALL');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const agencyName = pick(lang, a.name, a.nameAr);
  const agencyAbout = pick(lang, a.about ?? '', a.aboutAr);
  const primaryArea = a.area ? pick(lang, a.area.name, a.area.nameAr) : 'Muscat';

  // Filter listings by tab
  const filteredListings = useMemo(() => {
    if (filterPurpose === 'SALE') return listings.filter((l) => l.purpose === 'SALE');
    if (filterPurpose === 'RENT') return listings.filter((l) => l.purpose === 'RENT');
    if (filterPurpose === 'FEATURED') return listings.filter((l) => l.featured);
    return listings;
  }, [listings, filterPurpose]);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) {
      toast(lang === 'ar' ? 'يرجى إدخال الاسم والبريد الإلكتروني' : 'Please provide name and email');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryMessage('');
      toast(t.agencies.enquirySuccess.replace('{agency}', agencyName));
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-28">
      {/* ───────── Breadcrumbs ───────── */}
      <section className="wrap pt-6 pb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-text-muted">
          <Link href="/" className="hover:text-primaryColor transition-colors">
            {t.nav?.discover ?? (lang === 'ar' ? 'الرئيسية' : 'Home')}
          </Link>
          <span>/</span>
          <Link href="/agencies" className="hover:text-primaryColor transition-colors">
            {t.agencies.eyebrow}
          </Link>
          <span>/</span>
          <span className="text-text font-bold truncate">{agencyName}</span>
        </nav>
      </section>

      {/* ───────── High-Impact Hero Banner ───────── */}
      <section className="wrap">
        <div className="relative isolate min-h-[380px] sm:min-h-0 sm:h-[400px] overflow-hidden rounded-[24px] sm:rounded-[28px] border border-border/80 shadow-card">
          <motion.div
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 -z-20"
          >
            <Image
              src={a.coverUrl ?? '/homes/villa.webp'}
              alt={agencyName}
              fill
              priority
              loading="eager"
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>

          {/* Deep Architectural Scrim */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(35,107,121,0.4),transparent_70%)]" />

          {/* Banner Content Layer */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 md:p-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between"
            >
              {/* Agency Brand Identity */}
              <div className="flex flex-col xs:flex-row xs:items-center gap-3.5 sm:gap-6">
                <span
                  className="grid size-[64px] sm:size-[80px] md:size-[96px] place-items-center rounded-[20px] sm:rounded-[24px] font-display text-2xl sm:text-3xl md:text-4xl font-black shadow-2xl border-4 border-white/20 shrink-0"
                  style={{ background: a.brandColor ?? 'var(--primaryColor)' }}
                >
                  {mark(a)}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-xs">
                      <ShieldCheck className="size-4" />
                      <span>{t.agencies.verifiedMhup}</span>
                    </span>
                    <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/90 border border-white/10">
                      {a.licenseNo}
                    </span>
                  </div>
                  <h1 className="font-display text-[clamp(26px,4vw,50px)] font-extrabold text-white tracking-[-0.03em] leading-tight">
                    {agencyName}
                  </h1>
                </div>
              </div>

              {/* Quick Contact Action Pills */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {a.phone && (
                  <a
                    href={`https://wa.me/${a.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${agencyName}, I am contacting you through Velra regarding your listings in Muscat.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95"
                  >
                    <MessageSquare className="size-4" />
                    <span>{t.agencies.whatsapp}</span>
                  </a>
                )}

                {a.phone && (
                  <a
                    href={`tel:${a.phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/90 hover:bg-white text-text px-3.5 sm:px-4 py-2 text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <Phone className="size-3.5 text-primaryColor" />
                    <span>{t.agencies.callOffice}</span>
                  </a>
                )}

                {a.website && (
                  <a
                    href={a.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 px-3 sm:px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition-all"
                  >
                    <Globe className="size-3.5" />
                    <span>{t.agencies.visitWebsite}</span>
                    <ExternalLink className="size-3 opacity-70" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ───────── Executive Metrics Strip ───────── */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
          <div className="card rounded-[20px] border border-border bg-surface p-3 sm:p-4 text-center shadow-xs">
            <span className="flex items-center justify-center size-8 rounded-full bg-primary-tint text-primaryColor mx-auto mb-2">
              <Home className="size-4" />
            </span>
            <div className="font-display text-xl sm:text-2xl font-bold text-primaryColor tabular leading-none">
              {listings.length}
            </div>
            <div className="mt-1 text-xs font-semibold text-text-muted">
              {t.agencies.activeListings}
            </div>
          </div>

          <div className="card rounded-[20px] border border-border bg-surface p-3 sm:p-4 text-center shadow-xs">
            <span className="flex items-center justify-center size-8 rounded-full bg-primary-tint text-primaryColor mx-auto mb-2">
              <Users className="size-4" />
            </span>
            <div className="font-display text-xl sm:text-2xl font-bold text-text tabular leading-none">
              {a.memberCount ?? a.team.length}
            </div>
            <div className="mt-1 text-xs font-semibold text-text-muted">
              {t.agencies.specialists}
            </div>
          </div>

          <div className="card rounded-[20px] border border-border bg-surface p-3 sm:p-4 text-center shadow-xs">
            <span className="flex items-center justify-center size-8 rounded-full bg-primary-tint text-primaryColor mx-auto mb-2">
              <MapPin className="size-4" />
            </span>
            <div className="font-display text-base sm:text-xl font-bold text-text truncate leading-none">
              {primaryArea}
            </div>
            <div className="mt-1 text-xs font-semibold text-text-muted">
              {t.agencies.officeLocation}
            </div>
          </div>

          <div className="card rounded-[20px] border border-border bg-surface p-3 sm:p-4 text-center shadow-xs">
            <span className="flex items-center justify-center size-8 rounded-full bg-primary-tint text-primaryColor mx-auto mb-2">
              <Calendar className="size-4" />
            </span>
            <div className="font-display text-xl sm:text-2xl font-bold text-text tabular leading-none">
              {a.foundedYear ?? 2011}
            </div>
            <div className="mt-1 text-xs font-semibold text-text-muted">
              {t.agencies.since} {a.foundedYear ?? 2011}
            </div>
          </div>
        </div>

        {/* ───────── Main Body: Portfolio vs Sidebar ───────── */}
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          {/* ────── Left Column: Portfolio & Agents ────── */}
          <div className="min-w-0 space-y-12">
            {/* Portfolio Section */}
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/80">
                <div>
                  <h2 className="font-display text-2xl font-bold text-text tracking-[-0.02em]">
                    {t.agencies.portfolio}
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {lang === 'ar' ? 'عقارات معروضة مباشرة من قبل الوكالة' : 'Verified listings represented directly by this agency'}
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 rounded-full bg-sand-2 p-1 border border-border/60 overflow-x-auto max-w-full no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setFilterPurpose('ALL')}
                    className={cn(
                      'rounded-full px-3.5 py-1 text-xs font-bold transition-all shrink-0',
                      filterPurpose === 'ALL'
                        ? 'bg-primaryColor text-white shadow-2xs'
                        : 'text-text-muted hover:text-text'
                    )}
                  >
                    {t.agencies.allListings} ({listings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterPurpose('SALE')}
                    className={cn(
                      'rounded-full px-3.5 py-1 text-xs font-bold transition-all shrink-0',
                      filterPurpose === 'SALE'
                        ? 'bg-primaryColor text-white shadow-2xs'
                        : 'text-text-muted hover:text-text'
                    )}
                  >
                    {t.agencies.forSale} ({listings.filter((l) => l.purpose === 'SALE').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterPurpose('RENT')}
                    className={cn(
                      'rounded-full px-3.5 py-1 text-xs font-bold transition-all shrink-0',
                      filterPurpose === 'RENT'
                        ? 'bg-primaryColor text-white shadow-2xs'
                        : 'text-text-muted hover:text-text'
                    )}
                  >
                    {t.agencies.forRent} ({listings.filter((l) => l.purpose === 'RENT').length})
                  </button>
                </div>
              </div>

              {/* Properties Grid */}
              <div className="mt-6">
                {filteredListings.length === 0 ? (
                  <div className="card rounded-[22px] border border-border bg-surface p-10 text-center shadow-xs">
                    <Home className="mx-auto size-10 text-text-muted opacity-40 mb-2" />
                    <p className="text-sm font-semibold text-text">
                      {lang === 'ar' ? 'لا توجد عقارات مطابقة في هذا القسم' : 'No properties in this category currently.'}
                    </p>
                  </div>
                ) : (
                  <CardGrid cards={filteredListings} />
                )}
              </div>
            </div>

            {/* Dedicated Agents / Specialists Showcase */}
            {a.team.length > 0 && (
              <div className="pt-6 border-t border-border/80">
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-text tracking-[-0.02em]">
                    {t.agencies.team}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {lang === 'ar' ? 'تواصل مباشرة مع المستشارين المختصين بمحافظ هذه الوكالة' : 'Connect directly with certified property advisors representing this agency'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {a.team.map((m) => {
                    const agentTitle = pick(lang, m.title ?? '', m.titleAr);
                    const agentPhone = m.phone ?? a.phone;
                    const agentEmail = m.email ?? a.email;

                    return (
                      <div
                        key={m.id}
                        className="card rounded-[22px] border border-border bg-surface p-5 shadow-xs hover:border-primaryColor/60 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="relative">
                            <Avatar name={m.fullName} color={a.brandColor} size={50} />
                            <span
                              className="absolute bottom-0 end-0 size-3.5 rounded-full bg-emerald-500 ring-2 ring-surface"
                              title="Active"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-[16px] text-text truncate">
                              {m.fullName}
                            </h4>
                            <p className="text-xs font-medium text-primaryColor truncate">
                              {agentTitle || (lang === 'ar' ? 'مستشار عقاري' : 'Property Consultant')}
                            </p>
                            <p className="text-[11px] text-text-muted mt-1">
                              {t.agencies.languages}: <span className="font-semibold text-text">{t.agencies.languagesVal}</span>
                            </p>
                          </div>
                        </div>

                        {/* Agent Direct Actions */}
                        <div className="mt-4 pt-3.5 border-t border-border/60 flex items-center gap-2">
                          {agentPhone && (
                            <a
                              href={`https://wa.me/${agentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${m.fullName}, I am inquiring about properties listed by ${agencyName} on Velra.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white py-2 px-3 text-xs font-bold transition-all shadow-2xs"
                            >
                              <MessageSquare className="size-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {agentPhone && (
                            <a
                              href={`tel:${agentPhone}`}
                              className="size-9 rounded-xl border border-border bg-surface hover:bg-sand-2 flex items-center justify-center text-text transition-colors shadow-2xs"
                              title={agentPhone}
                            >
                              <Phone className="size-3.5 text-primaryColor" />
                            </a>
                          )}

                          {agentEmail && (
                            <a
                              href={`mailto:${agentEmail}?subject=${encodeURIComponent(`Inquiry for ${agencyName} listings`)}`}
                              className="size-9 rounded-xl border border-border bg-surface hover:bg-sand-2 flex items-center justify-center text-text transition-colors shadow-2xs"
                              title={agentEmail}
                            >
                              <Mail className="size-3.5 text-primaryColor" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ────── Right Column: Sticky Sidebar ────── */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* About Agency Card */}
            <div className="card rounded-[22px] border border-border bg-surface p-6 shadow-xs">
              <h3 className="font-bold text-base text-text mb-3">
                {t.agencies.about}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {agencyAbout}
              </p>

              {/* Direct Info List */}
              <ul className="mt-5 space-y-3 text-xs text-text border-t border-border/70 pt-4">
                {a.phone && (
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary-tint text-primaryColor shrink-0">
                      <Phone className="size-3.5" />
                    </span>
                    <a href={`tel:${a.phone}`} dir="ltr" className="font-semibold hover:text-primaryColor transition-colors tabular">
                      {a.phone}
                    </a>
                  </li>
                )}
                {a.email && (
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary-tint text-primaryColor shrink-0">
                      <Mail className="size-3.5" />
                    </span>
                    <a href={`mailto:${a.email}`} className="font-semibold hover:text-primaryColor transition-colors truncate">
                      {a.email}
                    </a>
                  </li>
                )}
                {a.website && (
                  <li className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary-tint text-primaryColor shrink-0">
                      <Globe className="size-3.5" />
                    </span>
                    <a
                      href={a.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primaryColor hover:underline truncate"
                    >
                      {a.website.replace(/^https?:\/\//, '')}
                    </a>
                  </li>
                )}
                <li className="flex items-center gap-2.5 text-text-muted">
                  <span className="flex size-7 items-center justify-center rounded-full bg-sand-2 text-text-muted shrink-0">
                    <Clock className="size-3.5" />
                  </span>
                  <span>{t.agencies.workingHours}</span>
                </li>
              </ul>

              {/* Compliance Badge */}
              <div className="mt-5 rounded-xl bg-sand/60 border border-border/80 p-3 text-[11.5px] text-text-muted flex items-start gap-2">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.agencies.regulatoryNote}</span>
              </div>
            </div>

            {/* Direct General Enquiry Form Card */}
            <div className="card rounded-[22px] border border-border bg-surface p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="font-bold text-base text-text">
                  {t.agencies.enquiryTitle}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {t.agencies.enquirySub}
                </p>
              </div>

              <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="inquiry-name" className="block text-xs font-semibold text-text-muted mb-1">
                    {t.agencies.enquiryName}
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Salim Al Rawahi"
                    className="w-full h-10 rounded-xl border border-border bg-sand-2/50 px-3 text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primaryColor focus:bg-surface transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-email" className="block text-xs font-semibold text-text-muted mb-1">
                    {t.agencies.enquiryEmail}
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="e.g. salim@example.com"
                    className="w-full h-10 rounded-xl border border-border bg-sand-2/50 px-3 text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primaryColor focus:bg-surface transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-phone" className="block text-xs font-semibold text-text-muted mb-1">
                    {t.agencies.enquiryPhone}
                  </label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="e.g. +968 9123 4567"
                    className="w-full h-10 rounded-xl border border-border bg-sand-2/50 px-3 text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primaryColor focus:bg-surface transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-message" className="block text-xs font-semibold text-text-muted mb-1">
                    {t.agencies.enquiryMessage}
                  </label>
                  <textarea
                    id="inquiry-message"
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب استفسارك أو طلبك هنا…' : 'I would like to inquire about properties in Muscat…'}
                    className="w-full rounded-xl border border-border bg-sand-2/50 p-3 text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primaryColor focus:bg-surface transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full h-11 rounded-xl bg-primaryColor hover:bg-primaryColorHover text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSending ? (
                    <span>{lang === 'ar' ? 'جارٍ الإرسال…' : 'Sending inquiry…'}</span>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      <span>{t.agencies.enquirySubmit}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
