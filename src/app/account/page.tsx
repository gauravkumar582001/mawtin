'use client';
import { CalendarDays } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OfferCard } from '@/components/account/offer-card';
import { Button, Pill } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import { ApiError, DEMO, api, demoDelay } from '@/lib/client';
import { demoMyOffers, demoViewings } from '@/lib/demo-data';
import type { Offer, OfferAction, Viewing } from '@/lib/types';
import { pick } from '@/lib/utils';
import { useAuth } from '@/store/auth';

export default function AccountPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { user, status } = useAuth();
  const [viewings, setViewings] = useState<Viewing[] | null>(null);
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'ready' && !user) router.replace('/login?next=/account');
  }, [status, user, router]);

  useEffect(() => {
    if (!user) return;
    if (DEMO) {
      setViewings(demoViewings().slice(0, 1));
      setOffers(demoMyOffers());
      return;
    }
    api<Viewing[]>('/me/viewings').then(setViewings).catch(() => setViewings([]));
    api<Offer[]>('/me/offers').then(setOffers).catch(() => setOffers([]));
  }, [user]);

  async function act(o: Offer, action: OfferAction, amount?: number) {
    setBusy(o.id);
    try {
      const updated = DEMO
        ? await demoDelay<Offer>({ ...o, status: action === 'accept' ? 'ACCEPTED' : action === 'revise' ? 'SUBMITTED' : action === 'withdraw' ? 'WITHDRAWN' : 'REJECTED', amount: amount ?? o.counterAmount ?? o.amount, counterAmount: null, allowedActions: action === 'revise' ? ['revise', 'withdraw'] : action === 'accept' ? ['withdraw'] : [] })
        : await api<Offer>(`/offers/${o.id}/${action}`, { method: 'POST', body: amount ? { amount } : {} });
      setOffers((list) => list?.map((x) => (x.id === o.id ? updated : x)) ?? null);
      toast(t.status[updated.status]);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t.common.error);
    } finally {
      setBusy(null);
    }
  }

  async function cancelViewing(v: Viewing) {
    setBusy(v.id);
    try {
      const updated = DEMO ? await demoDelay<Viewing>({ ...v, status: 'CANCELLED' }) : await api<Viewing>(`/viewings/${v.id}`, { method: 'PATCH', body: { action: 'cancel' } });
      setViewings((list) => list?.map((x) => (x.id === v.id ? updated : x)) ?? null);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t.common.error);
    } finally {
      setBusy(null);
    }
  }

  if (!user) return <p className="wrap py-20 text-center text-muted">{t.common.loading}</p>;
  const fmt = (d: string) => new Date(d).toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Muscat' });

  return (
    <>
      <section className="wrap pb-6 pt-9">
        <div className="eyebrow">{t.account.title}</div>
        <h1 className="mt-2 text-[clamp(30px,3.6vw,48px)]">{user.fullName}</h1>
        <p className="text-muted">{user.email}</p>
      </section>

      <section className="wrap grid gap-10">
        <div>
          <h2 className="mb-4 text-2xl">{t.account.offers}</h2>
          {offers === null ? (
            <p className="text-muted">{t.common.loading}</p>
          ) : offers.length ? (
            <div className="grid gap-3.5">
              {offers.map((o) => <OfferCard key={o.id} offer={o} busy={busy === o.id} onAction={(a, amt) => act(o, a, amt)} />)}
            </div>
          ) : (
            <p className="text-muted">{t.account.none}</p>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-2xl">{t.account.viewings}</h2>
          {viewings === null ? (
            <p className="text-muted">{t.common.loading}</p>
          ) : viewings.length ? (
            <ul className="grid gap-3.5">
              {viewings.map((v) => (
                <li key={v.id} className="card flex flex-wrap items-center gap-4 p-4">
                  <div className="relative h-14 w-20 overflow-hidden rounded-xl">
                    <Image src={v.property.images[0]?.url ?? '/homes/villa.webp'} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/properties/${v.property.slug}`} className="font-semibold hover:text-teal">{pick(lang, v.property.title, v.property.titleAr)}</Link>
                    <div className="flex items-center gap-1.5 text-[13px] text-muted">
                      <CalendarDays className="size-3.5" />
                      <span className="tabular">{fmt(v.startsAt)}</span>
                      {v.agent && <> · {v.agent.fullName}</>}
                    </div>
                  </div>
                  <Pill tone={v.status === 'CONFIRMED' ? 'ok' : v.status === 'CANCELLED' ? 'bad' : 'info'}>{t.status[v.status]}</Pill>
                  {['REQUESTED', 'CONFIRMED', 'RESCHEDULED'].includes(v.status) && (
                    <Button size="sm" variant="outline" disabled={busy === v.id} onClick={() => cancelViewing(v)}>{t.account.cancel}</Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">{t.account.none}</p>
          )}
        </div>
      </section>
    </>
  );
}
