'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  LogIn,
  MessageCircle,
  Phone,
  ShieldCheck,
  Send,
  Calendar,
  Clock,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-2 py-6 text-center"
      role="status"
    >
      <motion.div
        initial={{ scale: 0.4 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 14 }}
        className="mx-auto mb-3.5 grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      >
        <Check className="size-7 stroke-[2.5]" />
      </motion.div>
      <h3 className="mb-1 text-lg font-bold text-text">{title}</h3>
      {extra}
      <p className="text-xs text-text-muted leading-relaxed max-w-[280px] mx-auto">{body}</p>
    </motion.div>
  );
}

function ErrorLine({ msg }: { msg: string | null }) {
  return msg ? (
    <p role="alert" className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
      {msg}
    </p>
  ) : null;
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
    const load = DEMO
      ? Promise.resolve(demoAvailability())
      : api<AvailabilityDay[]>(`/properties/${p.id}/availability?days=7`).catch(() => demoAvailability());
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
      const body = {
        propertyId: p.id,
        date: days[day].date,
        time,
        name: String(f.get('name')),
        email: String(f.get('email')),
        phone: String(f.get('phone')),
        notes: String(f.get('notes') || '') || undefined,
      };
      if (DEMO) await demoDelay(body);
      else await api('/viewings', { method: 'POST', body });
      const when = new Date(`${days[day].date}T${time}:00+04:00`).toLocaleString(
        lang === 'ar' ? 'ar-OM' : 'en-GB',
        { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Muscat' }
      );
      setDone(when);
      onDone();
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : t.common?.error ?? 'An error occurred');
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <Success
        title={t.viewing?.done ?? 'Viewing requested'}
        body={t.viewing?.doneP ?? 'The agent will confirm your slot by email.'}
        extra={<p className="tabular mb-1 text-xs font-bold text-primaryColor">{done}</p>}
      />
    );

  if (!days)
    return (
      <div className="py-10 text-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primaryColor border-t-transparent mx-auto" />
        <p className="mt-3 text-xs text-text-muted">{t.viewing?.loading ?? 'Checking availability…'}</p>
      </div>
    );

  const fmtDay = (d: string, opt: Intl.DateTimeFormatOptions) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-GB', { ...opt, timeZone: 'UTC' });

  return (
    <form onSubmit={submit} className="grid gap-3.5">
      {/* Day Selector */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
          <Calendar className="size-3.5 text-primaryColor" />
          <span>{t.viewing?.day ?? 'Choose a day'}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label={t.viewing?.day ?? 'Day'}>
          {days.map((d, i) => (
            <button
              key={d.date}
              type="button"
              role="radio"
              aria-checked={i === day}
              onClick={() => {
                setDay(i);
                setTime(null);
              }}
              className={cn(
                'relative grid rounded-xl border py-2.5 text-center text-xs transition-all shadow-2xs',
                i === day
                  ? 'border-primaryColor bg-primaryColor text-white font-bold shadow-xs'
                  : 'border-border bg-surface text-text-muted hover:border-primaryColor hover:text-text'
              )}
            >
              <span className="text-[11px] font-medium leading-none">{fmtDay(d.date, { weekday: 'short' })}</span>
              <b className="tabular font-display text-[16px] leading-tight mt-1">{fmtDay(d.date, { day: 'numeric' })}</b>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
          <Clock className="size-3.5 text-primaryColor" />
          <span>{t.viewing?.time ?? 'Choose a time'}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={t.viewing?.time ?? 'Time'}>
          {days[day]?.slots.map((s) => (
            <button
              key={s.time}
              type="button"
              role="radio"
              aria-checked={time === s.time}
              disabled={!s.available}
              onClick={() => setTime(s.time)}
              className={cn(
                'tabular rounded-xl border py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:line-through disabled:opacity-30',
                time === s.time
                  ? 'border-primaryColor bg-primary-tint text-primaryColor font-bold shadow-2xs'
                  : 'border-border bg-surface text-text hover:border-primaryColor'
              )}
            >
              {s.time}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <Field label={t.viewing?.name ?? 'Full name'} htmlFor="v-name">
        <input
          id="v-name"
          name="name"
          required
          minLength={2}
          autoComplete="name"
          defaultValue={user?.fullName ?? ''}
          className={inputCls}
        />
      </Field>

      <div className="grid gap-2 sm:grid-cols-2">
        <Field label={t.viewing?.email ?? 'Email'} htmlFor="v-email">
          <input
            id="v-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={user?.email ?? ''}
            className={inputCls}
          />
        </Field>
        <Field label={t.viewing?.phone ?? 'Phone'} htmlFor="v-phone">
          <input
            id="v-phone"
            name="phone"
            type="tel"
            required
            pattern="^\+?[0-9 ]{7,20}$"
            autoComplete="tel"
            placeholder="+968 9xxx xxxx"
            defaultValue={user?.phone ?? ''}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label={t.viewing?.notes ?? 'Notes (optional)'} htmlFor="v-notes">
        <textarea id="v-notes" name="notes" rows={2} maxLength={500} className={inputCls} />
      </Field>

      <ErrorLine msg={err} />

      <Button type="submit" disabled={!time || busy} className="w-full shadow-md mt-1">
        <CalendarCheck className="size-4" />
        <span>{busy ? (t.common?.loading ?? 'Submitting…') : (t.viewing?.submit ?? 'Request viewing')}</span>
      </Button>
    </form>
  );
}

// ───────── Offer wizard ─────────
function OfferWizard({ p, onDone }: { p: PropertyDetail; onDone: () => void }) {
  const { t } = useI18n();
  const user = useAuth((s) => s.user);
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(Math.round((p.price * 0.95) / 500) * 500);
  const [financing, setFinancing] = useState<Financing>('CASH');
  const [moveIn, setMoveIn] = useState('');
  const [conditions, setConditions] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (p.purpose === 'RENT') {
    return <p className="py-6 text-center text-xs text-text-muted">{t.offer?.rentOnly ?? 'This home is for rent.'}</p>;
  }

  if (!user) {
    return (
      <div className="grid gap-3 py-6 text-center">
        <LogIn className="mx-auto size-8 text-primaryColor" />
        <h3 className="text-base font-bold text-text">{t.offer?.signIn ?? 'Sign in to make an offer'}</h3>
        <p className="text-xs text-text-muted max-w-[280px] mx-auto">
          {t.offer?.signInP ?? 'Offers are tied to your account so you can track replies.'}
        </p>
        <ButtonLink href={`/login?next=/properties/${p.slug}`} className="mt-2 mx-auto">
          {t.nav?.signIn ?? 'Sign in'}
        </ButtonLink>
      </div>
    );
  }

  if (done) {
    return (
      <Success
        title={t.offer?.done ?? 'Offer submitted'}
        body={t.offer?.doneP ?? 'The agency has 48 hours to reply.'}
        extra={<p className="tabular mb-1 font-display text-lg font-bold text-primaryColor">{omr(amount)}</p>}
      />
    );
  }

  const pct = Math.round((amount / p.price) * 100);

  async function submit() {
    if (!agree) return setErr(t.offer?.consent ?? 'Please agree to the non-binding terms');
    setBusy(true);
    setErr(null);
    try {
      const body = {
        propertyId: p.id,
        amount,
        financing,
        conditions: conditions || undefined,
        moveInDate: moveIn ? `${moveIn}-01` : undefined,
      };
      if (DEMO) await demoDelay(body);
      else await api('/offers', { method: 'POST', body });
      setDone(true);
      onDone();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : t.common?.error ?? 'Error occurred');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3.5">
      {/* Wizard Progress Steps */}
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="relative h-1 flex-1 overflow-hidden rounded-full bg-border">
            <motion.span
              className="absolute inset-0 origin-left bg-primaryColor rtl:origin-right"
              initial={false}
              animate={{ scaleX: step >= i ? 1 : 0 }}
            />
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="grid gap-3"
        >
          {step === 0 && (
            <>
              <Field label={t.offer?.amount ?? 'Your offer'} htmlFor="o-amount">
                <input
                  id="o-amount"
                  type="number"
                  inputMode="numeric"
                  min={Math.round(p.price * 0.5)}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={cn(inputCls, 'tabular font-display text-lg font-bold text-primaryColor')}
                />
              </Field>

              <input
                type="range"
                aria-label={t.offer?.amount ?? 'Your offer'}
                min={Math.round(p.price * 0.8)}
                max={p.price}
                step={500}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-[var(--primaryColor)] cursor-pointer"
              />

              <div className="flex justify-between text-xs text-text-muted">
                <span>{pct}% {t.offer?.ofAsking ?? 'of asking price'}</span>
                <span>Asking: {omr(p.price)}</span>
              </div>

              <Button onClick={() => setStep(1)} disabled={amount < p.price * 0.5} className="w-full mt-2">
                <span>{t.offer?.next ?? 'Continue'}</span>
                <ArrowRight className="size-4 rtl-flip" />
              </Button>
            </>
          )}

          {step === 1 && (
            <>
              <Field label={t.offer?.finance ?? 'Financing'} htmlFor="o-fin">
                <select
                  id="o-fin"
                  value={financing}
                  onChange={(e) => setFinancing(e.target.value as Financing)}
                  className={inputCls}
                >
                  {(['CASH', 'MORTGAGE_APPROVED', 'MORTGAGE_PENDING'] as const).map((k) => (
                    <option key={k} value={k}>
                      {t.offer?.[k] ?? k}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={t.offer?.moveIn ?? 'Preferred move-in'} htmlFor="o-move">
                <input
                  id="o-move"
                  type="month"
                  value={moveIn}
                  onChange={(e) => setMoveIn(e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label={t.offer?.conditions ?? 'Conditions'} htmlFor="o-cond">
                <textarea
                  id="o-cond"
                  rows={2}
                  maxLength={1000}
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="Subject to mortgage approval, inspection, etc."
                  className={inputCls}
                />
              </Field>

              <div className="flex gap-2 mt-1">
                <Button variant="soft" onClick={() => setStep(0)}>
                  {t.offer?.back ?? 'Back'}
                </Button>
                <Button className="flex-1" onClick={() => setStep(2)}>
                  {t.offer?.review ?? 'Review offer'}
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="rounded-2xl border border-primaryColor/20 bg-primary-tint/50 p-4">
                <div className="text-xs text-text-muted">{t.offer?.amount ?? 'Offer Amount'}</div>
                <div className="font-display text-2xl font-bold text-primaryColor tabular">{omr(amount)}</div>
                <div className="mt-1 text-xs text-text-muted">
                  {t.offer?.[financing] ?? financing} · {pct}% of asking
                </div>
              </div>

              <label htmlFor="o-agree" className="flex items-start gap-2.5 text-xs text-text-muted cursor-pointer mt-1">
                <input
                  id="o-agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 size-4 accent-[var(--primaryColor)]"
                />
                <span>{t.offer?.consent ?? 'I understand this offer is non-binding until a formal agreement is executed.'}</span>
              </label>

              <ErrorLine msg={err} />

              <div className="flex gap-2 mt-1">
                <Button variant="soft" onClick={() => setStep(1)}>
                  {t.offer?.back ?? 'Back'}
                </Button>
                <Button className="flex-1" onClick={submit} disabled={busy}>
                  {busy ? (t.common?.loading ?? 'Submitting…') : (t.offer?.submit ?? 'Submit offer')}
                </Button>
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
      const body = {
        propertyId: p.id,
        name: String(f.get('name')),
        email: String(f.get('email')),
        message: String(f.get('message')),
        consent: f.get('consent') === 'on',
        website: String(f.get('website') ?? ''),
      };
      if (DEMO) await demoDelay(body);
      else await api('/enquiries', { method: 'POST', body });
      setDone(true);
      onDone();
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : t.common?.error ?? 'Error occurred');
    } finally {
      setBusy(false);
    }
  }

  if (done) return <Success title={t.ask?.done ?? 'Message sent'} body={t.ask?.doneP ?? 'The agent will reply within a working day.'} />;

  return (
    <form onSubmit={submit} className="grid gap-3">
      <Field label={t.viewing?.name ?? 'Full name'} htmlFor="a-name">
        <input
          id="a-name"
          name="name"
          required
          minLength={2}
          autoComplete="name"
          defaultValue={user?.fullName ?? ''}
          className={inputCls}
        />
      </Field>

      <Field label={t.viewing?.email ?? 'Email'} htmlFor="a-email">
        <input
          id="a-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={user?.email ?? ''}
          className={inputCls}
        />
      </Field>

      <Field label={t.ask?.message ?? 'Message'} htmlFor="a-msg">
        <textarea
          id="a-msg"
          name="message"
          rows={3}
          required
          minLength={5}
          maxLength={2000}
          defaultValue={t.ask?.default ?? "I'd like to know more about this home."}
          className={inputCls}
        />
      </Field>

      {/* Honeypot: hidden from people, bots fill it in */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <label htmlFor="a-consent" className="flex items-start gap-2 text-xs text-text-muted cursor-pointer">
        <input id="a-consent" name="consent" type="checkbox" required className="mt-0.5 size-4 accent-[var(--primaryColor)]" />
        <span>{t.ask?.consent ?? 'I agree to be contacted about this home.'}</span>
      </label>

      <ErrorLine msg={err} />

      <Button type="submit" disabled={busy} className="w-full shadow-md mt-1">
        <Send className="size-4" />
        <span>{busy ? (t.common?.loading ?? 'Sending…') : (t.ask?.submit ?? 'Send message')}</span>
      </Button>
    </form>
  );
}

// ───────── Main Action Panel ─────────
export function ActionPanel({ p }: { p: PropertyDetail }) {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<Tab>('view');
  const [stage, setStage] = useState(0);

  const tabs: [Tab, string][] = [
    ['view', t.detail?.tabView ?? 'Book viewing'],
    ...(p.purpose === 'SALE' ? ([['offer', t.detail?.tabOffer ?? 'Make offer']] as [Tab, string][]) : []),
    ['ask', t.detail?.tabAsk ?? 'Ask'],
  ];

  // WhatsApp prefilled message
  const waText = encodeURIComponent(
    `Hello, I am interested in ${p.title} (${p.slug}) listed for ${omr(p.price)}.`
  );
  const waUrl = `https://wa.me/96890000000?text=${waText}`;

  return (
    <div className="grid gap-5">
      {/* ───────── Agent & Agency Profile Card ───────── */}
      <div className="rounded-[22px] border border-border bg-surface p-5 shadow-xs">
        {p.agent && (
          <div className="flex items-start gap-3.5">
            <Avatar name={p.agent.fullName} color={p.agency.brandColor} size={50} />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
                {t.detail?.listedBy ?? 'Listed by'}
              </span>
              <b className="text-base font-bold text-text block truncate mt-0.5">
                {p.agent.fullName}
              </b>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                <Link
                  href={`/agencies/${p.agency.slug}`}
                  className="font-semibold text-primaryColor hover:underline truncate"
                >
                  {pick(lang, p.agency.name, p.agency.nameAr)}
                </Link>
                <ShieldCheck className="size-3.5 text-primaryColor shrink-0" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Contact Buttons (WhatsApp & Call) */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 py-2 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <MessageCircle className="size-3.5" />
            <span>WhatsApp</span>
          </a>

          <a
            href="tel:+96890000000"
            className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface py-2 px-3 text-xs font-semibold text-text hover:border-primaryColor hover:text-primaryColor transition-colors shadow-2xs"
          >
            <Phone className="size-3.5" />
            <span>{lang === 'ar' ? 'اتصال' : 'Call'}</span>
          </a>
        </div>

        {/* Transaction Flow Timeline */}
        <div className="mt-5 border-t border-border/80 pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2">
            {lang === 'ar' ? 'مراحل الشراء والمعاينة:' : 'Buying & Viewing Journey:'}
          </span>
          <ol className="flex" aria-label="Progress">
            {t.detail?.flow?.map((s, i) => {
              const on = i <= stage;
              return (
                <li key={s} className={cn('relative flex-1 pt-5 text-center text-[11px]', on ? 'text-text font-bold' : 'text-text-muted')}>
                  <span
                    className={cn(
                      'absolute left-1/2 top-1 z-10 size-2.5 -translate-x-1/2 rounded-full transition-all duration-500',
                      on ? 'bg-primaryColor ring-4 ring-primary-tint' : 'bg-border'
                    )}
                  />
                  {i < (t.detail?.flow?.length ?? 5) - 1 && (
                    <span className="absolute start-1/2 top-[5px] h-0.5 w-full bg-border">
                      <motion.span
                        className="block h-full origin-left bg-primaryColor rtl:origin-right"
                        initial={false}
                        animate={{ scaleX: i < stage ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </span>
                  )}
                  <span className="truncate block max-w-full px-0.5">{s}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* ───────── Action Tabs Box ───────── */}
      <div className="rounded-[22px] border border-border bg-surface p-5 shadow-xs">
        {/* Segmented Tab Headers */}
        <div className="mb-4 flex gap-1 rounded-xl bg-surface-hover/80 p-1 border border-border/60" role="tablist">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={cn(
                'relative flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-all',
                tab === k ? 'text-primaryColor' : 'text-text-muted hover:text-text'
              )}
            >
              {tab === k && (
                <motion.span
                  layoutId="action-tab-pill"
                  className="absolute inset-0 rounded-lg bg-surface shadow-2xs border border-border/80"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Form Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'view' && <ViewingBooker p={p} onDone={() => setStage((s) => Math.max(s, 1))} />}
            {tab === 'offer' && <OfferWizard p={p} onDone={() => setStage((s) => Math.max(s, 2))} />}
            {tab === 'ask' && <AskForm p={p} onDone={() => setStage((s) => Math.max(s, 0))} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
