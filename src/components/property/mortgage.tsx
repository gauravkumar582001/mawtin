'use client';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/client';
import { omr } from '@/lib/utils';

/** Standard annuity formula. Rates in Oman typically sit between 4.5% and 7%. */
export function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 1200;
  const n = years * 12;
  return r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function MortgageCalculator({ price }: { price: number }) {
  const { t } = useI18n();
  const [down, setDown] = useState(30);
  const [rate, setRate] = useState(5.25);
  const [years, setYears] = useState(20);

  const { loan, pay, interest } = useMemo(() => {
    const loan = price * (1 - down / 100);
    const pay = monthlyPayment(loan, rate, years);
    return { loan, pay, interest: pay * years * 12 - loan };
  }, [price, down, rate, years]);

  const row = (id: string, label: string, value: string, input: React.ReactNode) => (
    <div className="grid gap-1.5">
      <div className="flex justify-between text-[13.5px]">
        <label htmlFor={id}>{label}</label>
        <b className="tabular">{value}</b>
      </div>
      {input}
    </div>
  );
  const range = 'w-full accent-[var(--teal)]';

  return (
    <div className="grid gap-4">
      {row('m-down', t.calc.down, `${down}% · ${omr(price * down / 100)}`, <input id="m-down" type="range" min={10} max={60} step={5} value={down} onChange={(e) => setDown(+e.target.value)} className={range} />)}
      {row('m-rate', t.calc.rate, `${rate.toFixed(2)}%`, <input id="m-rate" type="range" min={3} max={8} step={0.25} value={rate} onChange={(e) => setRate(+e.target.value)} className={range} />)}
      {row('m-years', t.calc.term, `${years} ${t.calc.years}`, <input id="m-years" type="range" min={5} max={25} step={1} value={years} onChange={(e) => setYears(+e.target.value)} className={range} />)}
      <div className="flex items-center justify-between rounded-2xl bg-teal-soft px-5 py-4">
        <span>{t.calc.monthly}</span>
        <motion.b key={Math.round(pay)} initial={{ y: -6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className="tabular font-display text-[28px] text-teal">
          {omr(pay)}
        </motion.b>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-md bg-line" aria-hidden>
        <motion.i className="block h-full bg-teal" animate={{ width: `${(loan / (loan + interest)) * 100}%` }} />
        <motion.i className="block h-full bg-copper" animate={{ width: `${(interest / (loan + interest)) * 100}%` }} />
      </div>
      <div className="flex flex-wrap gap-5 text-[12.5px] text-muted">
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-teal" /> {t.calc.loan} <b className="tabular text-ink">{omr(loan)}</b></span>
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-copper" /> {t.calc.interest} <b className="tabular text-ink">{omr(interest)}</b></span>
      </div>
      <p className="text-xs text-muted">{t.calc.note}</p>
    </div>
  );
}
