'use client';
import { CalendarDays, Handshake, Home, LayoutDashboard, LogOut } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OfferCard } from '@/components/account/offer-card';
import { Avatar, Button, CountUp, Pill } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import { ApiError, DEMO, api, demoDelay } from '@/lib/client';
import { demoLeads, demoListings, demoOffers, demoStats, demoViewings } from '@/lib/demo-data';
import type { AgencyListing, AgencyStats, Lead, LeadStatus, Offer, OfferAction, Paginated, Viewing } from '@/lib/types';
import { cn, omr, pick } from '@/lib/utils';
import { isAgencyStaff, useAuth } from '@/store/auth';

type Tab = 'overview' | 'listings' | 'offers' | 'viewings';
const COLUMNS: LeadStatus[] = ['NEW', 'CONTACTED', 'VIEWING_BOOKED', 'OFFER_MADE', 'WON'];

// ───────── Small SVG charts ─────────
function Spark({ values, color }: { values: number[]; color: string }) {
  const w = 160, h = 34;
  const max = Math.max(...values, 1), min = Math.min(...values, 0);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * w, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-1.5 block h-[34px] w-full" aria-hidden>
      <path d={`${d}L${w} ${h}L0 ${h}Z`} fill={color} opacity=".12" />
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

function LeadsChart({ data, label }: { data: { day: string; count: number }[]; label: string }) {
  const { lang } = useI18n();
  const w = 560, h = 160, pad = { l: 26, r: 10, t: 12, b: 24 };
  const max = Math.max(4, ...data.map((d) => d.count));
  const bw = (w - pad.l - pad.r) / data.length;
  const ticks = [0, Math.round(max / 2), max];
  return (
    <figure className="card p-5">
      <figcaption className="mb-2 text-sm font-semibold">{label}</figcaption>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="block h-auto w-full min-w-[420px]" role="img" aria-label={label}>
          {ticks.map((v) => {
            const y = pad.t + (1 - v / max) * (h - pad.t - pad.b);
            return (
              <g key={v}>
                <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="var(--line)" />
                <text x={pad.l - 6} y={y + 4} fontSize="10" textAnchor="end" fill="var(--muted)" className="tabular">{v}</text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const bh = (d.count / max) * (h - pad.t - pad.b);
            const x = pad.l + i * bw + bw * 0.18;
            return (
              <g key={d.day}>
                <motion.rect x={x} width={bw * 0.64} rx="4" fill={i === data.length - 1 ? 'var(--copper)' : 'var(--teal)'} initial={{ height: 0, y: h - pad.b }} animate={{ height: bh, y: h - pad.b - bh }} transition={{ duration: 0.7, delay: i * 0.03 }}>
                  <title>{`${d.day}: ${d.count}`}</title>
                </motion.rect>
                {i % 2 === 0 && (
                  <text x={x + bw * 0.32} y={h - 8} fontSize="9.5" textAnchor="middle" fill="var(--muted)">
                    {new Date(`${d.day}T12:00:00Z`).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}

// ───────── Pipeline (drag and drop) ─────────
function Pipeline({ leads, onMove }: { leads: Lead[]; onMove: (id: string, to: LeadStatus) => void }) {
  const { t, lang } = useI18n();
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStatus | null>(null);
  return (
    <div>
      <p className="mb-3 text-[13px] text-muted">{t.dash.dragTip}</p>
      <LayoutGroup>
        <div className="grid auto-cols-[minmax(210px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
          {COLUMNS.map((col) => {
            const items = leads.filter((l) => l.status === col);
            return (
              <div
                key={col}
                onDragOver={(e) => { e.preventDefault(); setOver(col); }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => { e.preventDefault(); setOver(null); if (drag) onMove(drag, col); setDrag(null); }}
                className={cn('min-h-[320px] rounded-[18px] border p-2.5 transition-colors', over === col ? 'border-teal bg-teal-soft' : 'border-line bg-[color-mix(in_oklab,var(--surface)_55%,var(--paper))]')}
              >
                <h3 className="flex justify-between px-1.5 pb-2.5 pt-1 font-sans text-[13px] font-semibold tracking-normal">
                  {t.status[col]}
                  <span className="tabular font-normal text-muted">{items.length}</span>
                </h3>
                <AnimatePresence>
                  {items.map((l) => (
                    <motion.div
                      layout
                      layoutId={l.id}
                      key={l.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: drag === l.id ? 0.4 : 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mb-2"
                    >
                      {/* Native HTML drag and drop lives on a plain element: motion reserves onDragStart for its own gestures. */}
                      <div
                        draggable
                        onDragStart={(e) => { setDrag(l.id); e.dataTransfer.setData('text/plain', l.id); e.dataTransfer.effectAllowed = 'move'; }}
                        onDragEnd={() => setDrag(null)}
                        className="cursor-grab rounded-[14px] border border-line bg-surface p-3 text-[13px] shadow-sm transition-shadow hover:shadow-soft active:cursor-grabbing"
                      >
                        <b className="block text-sm">{l.name}</b>
                        {pick(lang, l.property.title, l.property.titleAr)}
                        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted">
                          <span>{l.source.replace('_', ' ').toLowerCase()}</span>
                          <label className="sr-only" htmlFor={`mv-${l.id}`}>{t.dash.moved}</label>
                          <select id={`mv-${l.id}`} value={l.status} onChange={(e) => onMove(l.id, e.target.value as LeadStatus)} className="rounded-md border border-line bg-paper px-1 py-0.5 text-[11px]">
                            {[...COLUMNS, 'LOST' as const].map((c) => <option key={c} value={c}>{t.status[c]}</option>)}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [listings, setListings] = useState<AgencyListing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'ready' && !user) router.replace('/login?next=/dashboard');
  }, [status, user, router]);

  const load = useCallback(async () => {
    if (DEMO) {
      setStats(demoStats()); setLeads(demoLeads()); setListings(demoListings()); setOffers(demoOffers()); setViewings(demoViewings());
      return;
    }
    const [s, board, ls, os, vs] = await Promise.allSettled([
      api<AgencyStats>('/agency/stats'),
      api<{ columns: { status: LeadStatus; items: Lead[] }[] }>('/agency/leads/board'),
      api<Paginated<AgencyListing>>('/agency/properties?limit=48'),
      api<Paginated<Offer>>('/agency/offers?limit=48'),
      api<Viewing[]>('/agency/viewings'),
    ]);
    if (s.status === 'fulfilled') setStats(s.value);
    if (board.status === 'fulfilled') setLeads(board.value.columns.flatMap((c) => c.items));
    if (ls.status === 'fulfilled') setListings(ls.value.items);
    if (os.status === 'fulfilled') setOffers(os.value.items);
    if (vs.status === 'fulfilled') setViewings(vs.value);
  }, []);

  useEffect(() => {
    if (user && isAgencyStaff(user)) void load();
  }, [user, load]);

  async function moveLead(id: string, to: LeadStatus) {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: to } : l)));
    try {
      if (!DEMO) await api(`/agency/leads/${id}`, { method: 'PATCH', body: { status: to } });
      toast(`${t.dash.moved} ${t.status[to]}`);
    } catch (e) {
      setLeads(prev);
      toast.error(e instanceof ApiError ? e.message : t.common.error);
    }
  }

  async function offerAction(o: Offer, action: OfferAction, amount?: number) {
    setBusy(o.id);
    try {
      const updated = DEMO
        ? await demoDelay<Offer>({
            ...o,
            status: action === 'accept' ? 'ACCEPTED' : action === 'counter' ? 'COUNTERED' : action === 'complete' ? 'COMPLETED' : 'REJECTED',
            counterAmount: action === 'counter' ? amount ?? null : o.counterAmount,
            allowedActions: action === 'accept' ? ['complete', 'reject'] : action === 'counter' ? ['reject'] : [],
            events: [...o.events, { id: `${o.id}-${Date.now()}`, type: action === 'accept' ? 'ACCEPTED' : action === 'counter' ? 'COUNTERED' : action === 'complete' ? 'COMPLETED' : 'REJECTED', amount: amount ?? null, note: null, createdAt: new Date().toISOString(), actor: null }],
          })
        : await api<Offer>(`/offers/${o.id}/${action}`, { method: 'POST', body: amount ? { amount } : {} });
      setOffers((list) => list.map((x) => (x.id === o.id ? updated : x)));
      toast(t.status[updated.status]);
      if (!DEMO && action === 'accept') void load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t.common.error);
    } finally {
      setBusy(null);
    }
  }

  async function viewingAction(v: Viewing, action: 'confirm' | 'cancel' | 'complete') {
    setBusy(v.id);
    try {
      const next = { confirm: 'CONFIRMED', cancel: 'CANCELLED', complete: 'COMPLETED' } as const;
      const updated = DEMO ? await demoDelay<Viewing>({ ...v, status: next[action] }) : await api<Viewing>(`/viewings/${v.id}`, { method: 'PATCH', body: { action } });
      setViewings((list) => list.map((x) => (x.id === v.id ? updated : x)));
      toast(t.status[updated.status]);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t.common.error);
    } finally {
      setBusy(null);
    }
  }

  async function submitListing(l: AgencyListing) {
    setBusy(l.id);
    try {
      if (DEMO) await demoDelay(null);
      else await api(`/agency/properties/${l.id}/submit`, { method: 'POST' });
      setListings((ls) => ls.map((x) => (x.id === l.id ? { ...x, status: 'PENDING_REVIEW' } : x)));
      toast(t.status.PENDING_REVIEW);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t.common.error);
    } finally {
      setBusy(null);
    }
  }

  if (!user) return <p className="wrap py-20 text-center text-muted">{t.common.loading}</p>;
  if (!isAgencyStaff(user))
    return (
      <div className="wrap py-20 text-center">
        <p className="mb-5 text-muted">{t.dash.noAccess}</p>
        <Link href="/account" className="font-semibold text-teal">{t.nav.account}</Link>
      </div>
    );

  const tabs: [Tab, string, React.ComponentType<{ className?: string }>][] = [
    ['overview', t.dash.pipeline, LayoutDashboard],
    ['listings', t.dash.listings, Home],
    ['offers', t.dash.offers, Handshake],
    ['viewings', t.dash.viewings, CalendarDays],
  ];
  const k = stats?.kpis;
  const spark = stats?.leadsDaily.map((d) => d.count) ?? [0, 0];
  const kpis: [string, number, string, string | null][] = [
    [t.dash.activeListings, k?.activeListings ?? 0, 'var(--teal)', k?.pendingReview ? `+${k.pendingReview} ${t.status.PENDING_REVIEW.toLowerCase()}` : null],
    [t.dash.newLeads, k?.newLeads7d ?? 0, 'var(--copper)', k?.newLeadsChangePct != null ? `${k.newLeadsChangePct > 0 ? '+' : ''}${k.newLeadsChangePct}%` : null],
    [t.dash.viewingsWeek, k?.viewingsNext7d ?? 0, 'var(--teal)', null],
    [t.dash.offersPending, k?.offersAwaitingReply ?? offers.filter((o) => o.status === 'SUBMITTED').length, 'var(--copper)', null],
  ];
  const fmt = (d: string) => new Date(d).toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Muscat' });
  const listingTone = (s: string) => (s === 'PUBLISHED' ? 'ok' : s === 'UNDER_OFFER' ? 'warn' : s === 'DRAFT' ? 'bad' : 'info') as 'ok' | 'warn' | 'bad' | 'info';

  return (
    <>
      <section className="wrap flex flex-wrap items-end justify-between gap-4 pb-6 pt-9">
        <div>
          {DEMO && <span className="rounded-full bg-warn-bg px-3 py-1 text-xs font-medium text-warn">{t.dash.sample}</span>}
          <h1 className="mt-3 text-[clamp(30px,3.6vw,48px)]">{t.dash.greeting}, {user.fullName.split(' ')[0]}</h1>
          <p className="mt-1 text-muted">{user.agency ? pick(lang, user.agency.name, user.agency.nameAr) : 'Mawtin'}</p>
        </div>
      </section>

      <section className="wrap grid items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="card flex gap-1 overflow-x-auto p-3.5 lg:sticky lg:top-24 lg:grid">
          <div className="mb-1.5 hidden items-center gap-2.5 border-b border-line px-2 pb-3.5 lg:flex">
            <Avatar name={user.fullName} color={user.agency?.brandColor} size={40} />
            <div className="min-w-0">
              <b className="block truncate text-sm">{user.fullName}</b>
              <span className="block truncate text-xs text-muted">{user.agency?.title ?? user.role}</span>
            </div>
          </div>
          {tabs.map(([key, label, Icon]) => (
            <button key={key} type="button" onClick={() => setTab(key)} aria-current={tab === key ? 'page' : undefined}
              className={cn('relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm transition-colors', tab === key ? 'font-semibold text-teal' : 'text-ink-2 hover:text-ink')}>
              {tab === key && <motion.span layoutId="dash-tab" className="absolute inset-0 rounded-xl bg-teal-soft" />}
              <Icon className="relative size-[18px]" />
              <span className="relative">{label}</span>
            </button>
          ))}
          <button type="button" onClick={async () => { await logout(); router.push('/'); }} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-2 hover:text-ink">
            <LogOut className="size-[18px]" />
            {t.nav.signOut}
          </button>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 grid grid-cols-2 gap-3.5 xl:grid-cols-4">
            {kpis.map(([label, value, color, delta]) => (
              <div key={label} className="card p-4">
                <span className="text-[12.5px] text-muted">{label}</span>
                <b className="mt-1 block font-display text-3xl"><CountUp to={value} /></b>
                {delta && <em className="tabular text-xs not-italic text-ok">{delta}</em>}
                <Spark values={spark} color={color} />
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {tab === 'overview' && (
                <div className="grid gap-6">
                  <Pipeline leads={leads} onMove={moveLead} />
                  {stats && <LeadsChart data={stats.leadsDaily} label={t.dash.leadsChart} />}
                </div>
              )}

              {tab === 'listings' && (
                <div className="overflow-x-auto rounded-[18px] border border-line bg-surface">
                  <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
                    <thead>
                      <tr className="text-start text-[12.5px] text-muted">
                        {[t.dash.home, t.dash.price, t.dash.status, t.dash.views, t.dash.leads, ''].map((h, i) => <th key={i} className="border-b border-line px-4 py-3 text-start font-medium">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((l) => (
                        <tr key={l.id} className="transition-colors hover:bg-paper">
                          <td className="border-b border-line px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="relative h-10 w-[52px] overflow-hidden rounded-lg"><Image src={l.images[0]?.url ?? '/homes/villa.webp'} alt="" fill sizes="52px" className="object-cover" /></div>
                              <div>
                                <Link href={`/properties/${l.slug}`} className="font-semibold hover:text-teal">{pick(lang, l.title, l.titleAr)}</Link>
                                <div className="text-xs text-muted">{pick(lang, l.area.name, l.area.nameAr)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="tabular border-b border-line px-4 py-3">{omr(l.price)}</td>
                          <td className="border-b border-line px-4 py-3"><Pill tone={listingTone(l.status)}>{t.status[l.status]}</Pill></td>
                          <td className="tabular border-b border-line px-4 py-3">{l.viewCount.toLocaleString('en-US')}</td>
                          <td className="tabular border-b border-line px-4 py-3">{l.counts.enquiries}</td>
                          <td className="border-b border-line px-4 py-3 text-end">
                            {l.status === 'DRAFT' && <Button size="sm" variant="soft" disabled={busy === l.id} onClick={() => submitListing(l)}>{t.dash.submitReview}</Button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'offers' && (
                <div className="grid gap-3.5">
                  {offers.length ? offers.map((o) => <OfferCard key={o.id} offer={o} busy={busy === o.id} onAction={(a, amt) => offerAction(o, a, amt)} />) : <p className="text-muted">{t.account.none}</p>}
                </div>
              )}

              {tab === 'viewings' && (
                <div className="overflow-x-auto rounded-[18px] border border-line bg-surface">
                  <table className="w-full min-w-[680px] border-collapse text-[13.5px]">
                    <thead>
                      <tr className="text-[12.5px] text-muted">
                        {[t.dash.client, t.dash.home, t.dash.when, t.dash.status, ''].map((h, i) => <th key={i} className="border-b border-line px-4 py-3 text-start font-medium">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {viewings.map((v) => (
                        <tr key={v.id}>
                          <td className="border-b border-line px-4 py-3"><b>{v.name}</b><div className="tabular text-xs text-muted" dir="ltr">{v.phone}</div></td>
                          <td className="border-b border-line px-4 py-3">{pick(lang, v.property.title, v.property.titleAr)}</td>
                          <td className="tabular border-b border-line px-4 py-3">{fmt(v.startsAt)}</td>
                          <td className="border-b border-line px-4 py-3"><Pill tone={v.status === 'CONFIRMED' ? 'ok' : v.status === 'REQUESTED' ? 'warn' : v.status === 'CANCELLED' ? 'bad' : 'info'}>{t.status[v.status]}</Pill></td>
                          <td className="border-b border-line px-4 py-3">
                            <div className="flex justify-end gap-1.5">
                              {v.status === 'REQUESTED' && <Button size="sm" disabled={busy === v.id} onClick={() => viewingAction(v, 'confirm')}>{t.dash.confirm}</Button>}
                              {v.status === 'CONFIRMED' && <Button size="sm" variant="soft" disabled={busy === v.id} onClick={() => viewingAction(v, 'complete')}>{t.dash.complete}</Button>}
                              {['REQUESTED', 'CONFIRMED'].includes(v.status) && <Button size="sm" variant="outline" disabled={busy === v.id} onClick={() => viewingAction(v, 'cancel')}>{t.dash.cancel}</Button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

