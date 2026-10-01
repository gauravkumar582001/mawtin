'use client';
import { Globe, Mail, Phone, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { CardGrid } from '@/components/property/property-card';
import { Avatar, Reveal } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import type { Agency, PropertyCard } from '@/lib/types';
import { pick } from '@/lib/utils';

const mark = (a: Agency) => a.name.split(' ').map((w) => w[0]).join('').slice(0, 3);

export function AgencyList({ agencies }: { agencies: Agency[] }) {
  const { t, lang } = useI18n();
  return (
    <>
      <section className="wrap pb-6 pt-9">
        <div className="eyebrow">{t.agencies.eyebrow}</div>
        <h1 className="mt-2 text-[clamp(30px,3.6vw,48px)]">{t.agencies.pageTitle}</h1>
        <p className="mt-2.5 text-muted">{t.agencies.sub}</p>
      </section>
      <section className="wrap grid gap-6 md:grid-cols-2">
        {agencies.map((a, i) => (
          <Reveal key={a.slug} delay={(i % 2) * 0.08}>
            <Link href={`/agencies/${a.slug}`} className="card group block overflow-hidden transition duration-500 hover:-translate-y-1.5 hover:shadow-lift">
              <div className="relative h-[150px] overflow-hidden">
                <Image src={a.coverUrl ?? '/homes/villa.webp'} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover saturate-[.9] transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="relative px-6 pb-6 pt-10">
                <span className="absolute -top-8 start-6 grid size-[62px] place-items-center rounded-[18px] border-4 border-surface font-display text-xl font-extrabold text-white" style={{ background: a.brandColor ?? '#236777' }}>
                  {mark(a)}
                </span>
                <div className="flex items-center justify-between gap-2.5">
                  <h2 className="text-[22px]">{pick(lang, a.name, a.nameAr)}</h2>
                  <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ok"><ShieldCheck className="size-3.5" />{t.agencies.licensed}</span>
                </div>
                <p className="mt-1.5 text-sm text-muted">{pick(lang, a.about ?? '', a.aboutAr)}</p>
                <div className="mt-3.5 flex gap-6 text-[13px] text-muted">
                  <div><b className="tabular block font-display text-xl text-ink">{a.listingCount}</b>{t.agencies.listings}</div>
                  <div><b className="tabular block font-display text-xl text-ink">{a.memberCount ?? a.team.length}</b>{t.agencies.agents}</div>
                  <div><b className="tabular block font-display text-xl text-ink">{a.foundedYear}</b>{t.agencies.since}</div>
                </div>
                <div className="mt-3.5 flex">
                  {a.team.slice(0, 5).map((m, j) => (
                    <span key={m.id} className={j ? '-ms-2' : ''}>
                      <span className="block rounded-full border-2 border-surface"><Avatar name={m.fullName} color={a.brandColor} size={32} /></span>
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </>
  );
}

export function AgencyProfile({ agency: a, listings }: { agency: Agency; listings: PropertyCard[] }) {
  const { t, lang } = useI18n();
  return (
    <>
      <section className="wrap pb-5 pt-8">
        <nav aria-label="Breadcrumb" className="flex gap-2 text-[13px] text-muted">
          <Link href="/agencies" className="hover:text-teal">{t.nav.agencies}</Link>
          <span>/</span>
          <span>{pick(lang, a.name, a.nameAr)}</span>
        </nav>
      </section>
      <section className="wrap">
        <div className="relative isolate h-[280px] overflow-hidden rounded-[28px]">
          <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.4 }} className="absolute inset-0 -z-20">
            <Image src={a.coverUrl ?? '/homes/villa.webp'} alt="" fill priority sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(9,28,34,.8),rgba(9,28,34,.1))]" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="absolute bottom-8 start-6 flex items-center gap-4 text-white sm:start-10">
            <span className="grid size-[76px] place-items-center rounded-[20px] font-display text-2xl font-extrabold" style={{ background: a.brandColor ?? '#236777' }}>{mark(a)}</span>
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8fe3bd]"><ShieldCheck className="size-3.5" />{t.agencies.licensed} · {a.licenseNo}</span>
              <h1 className="mt-1.5 text-[clamp(28px,3.4vw,44px)]">{pick(lang, a.name, a.nameAr)}</h1>
            </div>
          </motion.div>
        </div>

        <div className="mt-9 grid items-start gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <h2 className="mb-5 text-[26px]">{t.dash.listings} <span className="tabular text-muted">({listings.length})</span></h2>
            <CardGrid cards={listings} />
          </div>
          <aside className="grid gap-4 lg:sticky lg:top-24">
            <div className="card p-5">
              <h3 className="mb-2 text-lg">{t.agencies.about}</h3>
              <p className="text-sm text-muted">{pick(lang, a.about ?? '', a.aboutAr)}</p>
              <ul className="mt-4 grid gap-2 text-sm [&_svg]:size-4 [&_svg]:text-teal">
                {a.phone && <li className="flex items-center gap-2"><Phone /><span dir="ltr" className="tabular select-all">{a.phone}</span></li>}
                {a.email && <li className="flex items-center gap-2"><Mail /><span className="select-all">{a.email}</span></li>}
                {a.website && <li className="flex items-center gap-2"><Globe /><a href={a.website} target="_blank" rel="noreferrer" className="text-teal hover:underline">{a.website.replace(/^https?:\/\//, '')}</a></li>}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="mb-3.5 text-lg">{t.agencies.team}</h3>
              <ul className="grid gap-3.5">
                {a.team.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <Avatar name={m.fullName} color={a.brandColor} size={44} />
                    <div>
                      <b className="block text-sm">{m.fullName}</b>
                      <small className="text-[12.5px] text-muted">{pick(lang, m.title ?? '', m.titleAr)}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
