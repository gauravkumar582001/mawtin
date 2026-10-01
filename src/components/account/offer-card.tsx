'use client';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Pill, inputCls } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import type { Offer, OfferAction } from '@/lib/types';
import { omr, pick } from '@/lib/utils';

const TONE: Record<string, 'ok' | 'warn' | 'bad' | 'info'> = {
  SUBMITTED: 'info', COUNTERED: 'warn', ACCEPTED: 'ok', COMPLETED: 'ok', REJECTED: 'bad', WITHDRAWN: 'bad', EXPIRED: 'bad',
};

/** One offer with its timeline and the actions the current viewer is allowed to take. */
export function OfferCard({ offer: o, onAction, busy }: { offer: Offer; onAction: (a: OfferAction, amount?: number) => void; busy?: boolean }) {
  const { t, lang } = useI18n();
  const [amountFor, setAmountFor] = useState<OfferAction | null>(null);
  const [amount, setAmount] = useState<number>(o.counterAmount ?? o.amount);
  const isAgency = o.viewerRole === 'agency';
  const fmt = (d: string) => new Date(d).toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Muscat' });

  const labels: Partial<Record<OfferAction, string>> = isAgency
    ? { accept: t.dash.accept, counter: t.dash.counter, reject: t.dash.reject, complete: t.dash.close }
    : { accept: t.account.accept, revise: t.account.revise, reject: t.account.reject, withdraw: t.account.withdraw };
  const needsAmount = (a: OfferAction) => a === 'counter' || a === 'revise';

  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card grid gap-4 p-5 md:grid-cols-[1fr_auto]">
      <div className="flex min-w-0 gap-4">
        <div className="relative hidden h-[72px] w-[96px] shrink-0 overflow-hidden rounded-xl sm:block">
          <Image src={o.property.images[0]?.url ?? '/homes/villa.webp'} alt="" fill sizes="96px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <b className="text-base">{isAgency ? o.buyer.fullName : pick(lang, o.property.title, o.property.titleAr)}</b>
            <Pill tone={TONE[o.status]}>{t.status[o.status]}</Pill>
          </div>
          <div className="text-[13px] text-muted">
            {isAgency ? (
              <Link href={`/properties/${o.property.slug}`} className="hover:text-teal">{pick(lang, o.property.title, o.property.titleAr)}</Link>
            ) : (
              pick(lang, o.agency.name, o.agency.nameAr)
            )}{' '}
            · {t.dash.asking} <span className="tabular">{omr(o.property.price)}</span>
          </div>
          <ol className="mt-2.5 flex flex-wrap gap-1.5 text-xs text-muted">
            {o.events.map((e) => (
              <li key={e.id} className="rounded-lg border border-line bg-paper px-2 py-0.5">
                {t.status[e.type === 'REVISED' ? 'SUBMITTED' : e.type] ?? e.type}
                {e.amount ? <span className="tabular"> · {omr(e.amount)}</span> : null} · <span className="tabular">{fmt(e.createdAt)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="grid content-start gap-2 md:justify-items-end md:text-end">
        <div className="tabular font-display text-[23px] font-bold text-teal">{omr(o.counterAmount ?? o.amount)}</div>
        <div className="text-xs text-muted">
          {t.offer[o.financing]} · <span className="tabular">{Math.round(((o.counterAmount ?? o.amount) / o.property.price) * 100)}%</span>
          {(o.status === 'SUBMITTED' || o.status === 'COUNTERED') && (
            <> · {t.account.expires} <span className="tabular">{fmt(o.expiresAt)}</span></>
          )}
        </div>
        {amountFor ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onAction(amountFor, amount);
              setAmountFor(null);
            }}
          >
            <label htmlFor={`amt-${o.id}`} className="sr-only">{isAgency ? t.dash.counterAmount : t.account.newAmount}</label>
            <input id={`amt-${o.id}`} type="number" step={500} min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={`${inputCls} tabular w-36 py-1.5`} autoFocus />
            <Button type="submit" size="sm" disabled={busy}>{labels[amountFor]}</Button>
            <Button size="sm" variant="ghost" onClick={() => setAmountFor(null)}>×</Button>
          </form>
        ) : (
          o.allowedActions.length > 0 && (
            <div className="flex flex-wrap gap-2 md:justify-end">
              {o.allowedActions
                .filter((a) => labels[a])
                .map((a, i) => (
                  <Button key={a} size="sm" disabled={busy} variant={i === 0 ? 'primary' : a === 'reject' || a === 'withdraw' ? 'outline' : 'soft'} onClick={() => (needsAmount(a) ? setAmountFor(a) : onAction(a))}>
                    {labels[a]}
                  </Button>
                ))}
            </div>
          )
        )}
      </div>
    </motion.article>
  );
}
