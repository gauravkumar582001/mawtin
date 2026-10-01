'use client';
import { ArrowRight, CalendarCheck, Check, LogIn } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Avatar, Button, ButtonLink, Field, inputCls } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import { ApiError, DEMO, api, demoDelay } from '@/lib/client';
import { demoAvailability } from '@/lib/slots';
import type { AvailabilityDay, Financing, PropertyDetail } from '@/lib/types';
import { cn, omr, pick } from '@/lib/utils';
import { useAuth } from '@/store/auth';

type Tab = 'view' | 'offer' | 'ask';

function Success({ title, body, extra }: { title: string; body: string; extra?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-1 py-3.5 text-center" role="status">
      <motion.div initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }} className="mx-auto mb-3 grid size-[62px] place-items-center rounded-full bg-ok-bg text-ok">
        <Check className="size-7" />
      </motion.div>
      <h3 className="mb-1.5 text-xl">{title}</h3>
      {extra}
      <p className="text-[13px] text-muted">{body}</p>
    </motion.div>
  );
}

function ErrorLine({ msg }: { msg: string | null }) {
  return msg ? <p role="alert" className="rounded-xl bg-bad-bg px-3 py-2 text-[13px] text-bad">{msg}</p> : null;
}

// ───────── Viewing booking ─────────
function ViewingBooker({ p, onDone }: { p: PropertyDetail; onDone: () => void }) {
  const { t, lang } = useI18n();
  const user = useAuth((s) => s.user);
  const [days, setDays] = useState<AvailabilityDay[] | null>(null);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = DEMO ? Promise.resolve(demoAvailability()) : api<AvailabilityDay[]>(`/properties/${p.id}/availability?days=7`).catch(() => demoAvailability());
    load.then((d) => {
      if (!alive) return;
      const workingDays = d.filter((x) => x.slots.some((s) => s.available));
      setDays(workingDays.slice(0, 5));
    });
    return () => {
      alive = false;
    };
  }, [p.id]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!days || !time) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    try {
      const body = { propertyId: p.id, date: days[day].date, time, name: String(f.get('name')), email: String(f.get('email')), phone: String(f.get('phone')), notes: String(f.get('notes') || '') || undefined };
      if (DEMO) await demoDelay(body);
      else await api('/viewings', { method: 'POST', body });
      const when = new Date(`${days[day].date}T${time}:00+04:00`).toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Muscat' });
      setDone(when);
      onDone();
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <Success title={t.viewing.done} body={t.viewing.doneP} extra={<p className="tabular mb-1 text-[13px] font-semibold">{done}</p>} />;
  if (!days) return <p className="py-8 text-center text-sm text-muted">{t.viewing.loading}</p>;

  const fmtDay = (d: string, opt: Intl.DateTimeFormatOptions) => new Date(`${d}T12:00:00Z`).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-GB', { ...opt, timeZone: 'UTC' });

  return (
    <form onSubmit={submit} className="grid gap-3">
      <p className="text-xs text-muted">{t.viewing.day}</p>
      <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label={t.viewing.day}>
        {days.map((d, i) => (
          <button key={d.date} type="button" role="radio" aria-checked={i === day} onClick={() => { setDay(i); setTime(null); }}
            className={cn('relative grid rounded-xl border py-2 text-[11.5px] transition', i === day ? 'border-ink text-paper' : 'border-line bg-surface text-muted hover:border-teal')}>
            {i === day && <motion.span layoutId="day-bg" className="absolute inset-0 rounded-[11px] bg-ink" />}
            <span className="relative">{fmtDay(d.date, { weekday: 'short' })}</span>
            <b className={cn('tabular relative font-display text-[17px]', i === day ? 'text-paper' : 'text-ink')}>{fmtDay(d.date, { day: 'numeric' })}</b>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">{t.viewing.time}</p>
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={t.viewing.time}>
        {days[day].slots.map((s) => (
          <button key={s.time} type="button" role="radio" aria-checked={time === s.time} disabled={!s.available} onClick={() => setTime(s.time)}
            className={cn('tabular rounded-[10px] border py-2 text-[13px] transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-40', time === s.time ? 'border-teal bg-teal-soft font-semibold text-teal' : 'border-line bg-surface hover:border-teal')}>
            {s.time}
          </button>
        ))}
      </div>
      <Field label={t.viewing.name} htmlFor="v-name"><input id="v-name" name="name" required minLength={2} autoComplete="name" defaultValue={user?.fullName ?? ''} className={inputCls} /></Field>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label={t.viewing.email} htmlFor="v-email"><input id="v-email" name="email" type="email" required autoComplete="email" defaultValue={user?.email ?? ''} className={inputCls} /></Field>
        <Field label={t.viewing.phone} htmlFor="v-phone"><input id="v-phone" name="phone" type="tel" required pattern="^\+?[0-9 ]{7,20}$" autoComplete="tel" placeholder="+968 9xxx xxxx" defaultValue={user?.phone ?? ''} className={inputCls} /></Field>
      </div>
      <Field label={t.viewing.notes} htmlFor="v-notes"><textarea id="v-notes" name="notes" rows={2} maxLength={500} className={inputCls} /></Field>
      <ErrorLine msg={err} />
      <Button type="submit" disabled={!time || busy} className="w-full">
        <CalendarCheck />
        {busy ? t.common.loading : t.viewing.submit}
      </Button>
    </form>
  );
}

// ───────── Offer wizard ─────────
function OfferWizard({ p, onDone }: { p: PropertyDetail; onDone: () => void }) {
  const { t } = useI18n();
  const user = useAuth((s) => s.user);
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(Math.round((p.price * 0.96) / 500) * 500);
  const [financing, setFinancing] = useState<Financing>('CASH');
  const [moveIn, setMoveIn] = useState('');
  const [conditions, setConditions] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (p.purpose === 'RENT') return <p className="py-6 text-center text-sm text-muted">{t.offer.rentOnly}</p>;
  if (!user)
    return (
      <div className="grid gap-3 py-4 text-center">
        <LogIn className="mx-auto size-7 text-teal" />
        <h3 className="text-lg">{t.offer.signIn}</h3>
        <p className="text-[13px] text-muted">{t.offer.signInP}</p>
        <ButtonLink href={`/login?next=/properties/${p.slug}`}>{t.nav.signIn}</ButtonLink>
      </div>
    );
  if (done) return <Success title={t.offer.done} body={t.offer.doneP} extra={<p className="tabular mb-1 font-semibold">{omr(amount)}</p>} />;

  const pct = Math.round((amount / p.price) * 100);

  async function submit() {
    if (!agree) return setErr(t.offer.consent);
    setBusy(true);
    setErr(null);
    try {
      const body = { propertyId: p.id, amount, financing, conditions: conditions || undefined, moveInDate: moveIn ? `${moveIn}-01` : undefined };
      if (DEMO) await demoDelay(body);
      else await api('/offers', { method: 'POST', body });
      setDone(true);
      onDone();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="relative h-1 flex-1 overflow-hidden rounded bg-line">
            <motion.span className="absolute inset-0 origin-left bg-teal rtl:origin-right" initial={false} animate={{ scaleX: step >= i ? 1 : 0 }} />
          </span>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="grid gap-3">
          {step === 0 && (
            <>
              <Field label={t.offer.amount} htmlFor="o-amount">
                <input id="o-amount" type="number" inputMode="numeric" min={Math.round(p.price * 0.5)} step={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={cn(inputCls, 'tabular text-lg font-semibold')} />
              </Field>
              <input type="range" aria-label={t.offer.amount} min={Math.round(p.price * 0.8)} max={p.price} step={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="accent-[var(--teal)]" />
              <p className="tabular text-xs text-muted">{pct}% {t.offer.ofAsking}</p>
              <Button onClick={() => setStep(1)} disabled={amount < p.price * 0.5}>{t.offer.next}<ArrowRight className="rtl-flip" /></Button>
            </>
          )}
          {step === 1 && (
            <>
              <Field label={t.offer.finance} htmlFor="o-fin">
                <select id="o-fin" value={financing} onChange={(e) => setFinancing(e.target.value as Financing)} className={inputCls}>
                  {(['CASH', 'MORTGAGE_APPROVED', 'MORTGAGE_PENDING'] as const).map((k) => <option key={k} value={k}>{t.offer[k]}</option>)}
                </select>
              </Field>
              <Field label={t.offer.moveIn} htmlFor="o-move"><input id="o-move" type="month" value={moveIn} onChange={(e) => setMoveIn(e.target.value)} className={inputCls} /></Field>
              <Field label={t.offer.conditions} htmlFor="o-cond"><textarea id="o-cond" rows={2} maxLength={1000} value={conditions} onChange={(e) => setConditions(e.target.value)} className={inputCls} /></Field>
              <div className="flex gap-2">
                <Button variant="soft" onClick={() => setStep(0)}>{t.offer.back}</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>{t.offer.review}</Button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="flex items-center justify-between rounded-2xl bg-teal-soft px-5 py-4">
                <span>{t.offer.amount}</span>
                <b className="tabular font-display text-2xl text-teal">{omr(amount)}</b>
              </div>
              <p className="text-xs text-muted">{t.offer[financing]} · {pct}% {t.offer.ofAsking}</p>
              <label htmlFor="o-agree" className="flex items-start gap-2 text-[13px]">
                <input id="o-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[var(--teal)]" />
                {t.offer.consent}
              </label>
              <ErrorLine msg={err} />
              <div className="flex gap-2">
                <Button variant="soft" onClick={() => setStep(1)}>{t.offer.back}</Button>
                <Button className="flex-1" onClick={submit} disabled={busy}>{busy ? t.common.loading : t.offer.submit}</Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ───────── Ask the agent ─────────
function AskForm({ p, onDone }: { p: PropertyDetail; onDone: () => void }) {
  const { t } = useI18n();
  const user = useAuth((s) => s.user);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    try {
      const body = { propertyId: p.id, name: String(f.get('name')), email: String(f.get('email')), message: String(f.get('message')), consent: f.get('consent') === 'on', website: String(f.get('website') ?? '') };
      if (DEMO) await demoDelay(body);
      else await api('/enquiries', { method: 'POST', body });
      setDone(true);
      onDone();
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <Success title={t.ask.done} body={t.ask.doneP} />;
  return (
    <form onSubmit={submit} className="grid gap-3">
      <Field label={t.viewing.name} htmlFor="a-name"><input id="a-name" name="name" required minLength={2} autoComplete="name" defaultValue={user?.fullName ?? ''} className={inputCls} /></Field>
      <Field label={t.viewing.email} htmlFor="a-email"><input id="a-email" name="email" type="email" required autoComplete="email" defaultValue={user?.email ?? ''} className={inputCls} /></Field>
      <Field label={t.ask.message} htmlFor="a-msg"><textarea id="a-msg" name="message" rows={3} required minLength={5} maxLength={2000} defaultValue={t.ask.default} className={inputCls} /></Field>
      {/* Honeypot: hidden from people, bots fill it in */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label htmlFor="a-consent" className="flex items-start gap-2 text-[13px]">
        <input id="a-consent" name="consent" type="checkbox" required className="mt-0.5 accent-[var(--teal)]" />
        {t.ask.consent}
      </label>
      <ErrorLine msg={err} />
      <Button type="submit" disabled={busy}>{busy ? t.common.loading : t.ask.submit}</Button>
    </form>
  );
}

// ───────── Panel ─────────
export function ActionPanel({ p }: { p: PropertyDetail }) {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<Tab>('view');
  const [stage, setStage] = useState(0);
  const tabs: [Tab, string][] = [['view', t.detail.tabView], ...(p.purpose === 'SALE' ? ([['offer', t.detail.tabOffer]] as [Tab, string][]) : []), ['ask', t.detail.tabAsk]];

  return (
    <div className="grid gap-4">
      <div className="card p-5">
        {p.agent && (
          <div className="flex items-center gap-3">
            <Avatar name={p.agent.fullName} color={p.agency.brandColor} size={48} />
            <div className="min-w-0">
              <small className="text-[12.5px] text-muted">{t.detail.listedBy}</small>
              <b className="block">{p.agent.fullName}</b>
              <small className="text-[12.5px] text-muted">
                {pick(lang, p.agent.title ?? '', p.agent.titleAr)} ·{' '}
                <Link href={`/agencies/${p.agency.slug}`} className="font-semibold text-teal hover:underline">{pick(lang, p.agency.name, p.agency.nameAr)}</Link>
              </small>
            </div>
          </div>
        )}
        {/* Where this buyer is in the transaction */}
        <ol className="mt-5 flex" aria-label="Progress">
          {t.detail.flow.map((s, i) => {
            const on = i <= stage;
            return (
              <li key={s} className={cn('relative flex-1 pt-6 text-center text-[11px]', on ? 'text-ink' : 'text-muted')}>
                <span className={cn('absolute left-1/2 top-1.5 z-10 size-3 -translate-x-1/2 rounded-full transition-all duration-500', on ? 'bg-teal shadow-[0_0_0_4px_var(--teal-soft)]' : 'bg-line')} />
                {i < t.detail.flow.length - 1 && (
                  <span className="absolute start-1/2 top-[11px] h-0.5 w-full bg-line">
                    <motion.span className="block h-full origin-left bg-teal rtl:origin-right" initial={false} animate={{ scaleX: i < stage ? 1 : 0 }} transition={{ duration: 0.6 }} />
                  </span>
                )}
                {s}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex gap-1 rounded-[14px] bg-teal-soft p-1" role="tablist">
          {tabs.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('relative flex-1 rounded-[11px] px-1.5 py-2 text-[13px] font-semibold transition-colors', tab === k ? 'text-teal' : 'text-ink-2')}>
              {tab === k && <motion.span layoutId="action-tab" className="absolute inset-0 rounded-[11px] bg-surface shadow-soft" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} role="tabpanel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {tab === 'view' && <ViewingBooker p={p} onDone={() => setStage((s) => Math.max(s, 1))} />}
            {tab === 'offer' && <OfferWizard p={p} onDone={() => setStage((s) => Math.max(s, 2))} />}
            {tab === 'ask' && <AskForm p={p} onDone={() => setStage((s) => Math.max(s, 0))} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
