'use client';

import { useMemo, useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '@/i18n/client';
import { omr } from '@/lib/utils';
import { cn } from '@/lib/utils';

/** Standard annuity formula. Rates in Oman typically sit between 4.5% and 7%. */
export function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 1200;
  const n = years * 12;
  return r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function MortgageCalculator({ price }: { price: number }) {
  const { t, lang } = useI18n();
  const [downPct, setDownPct] = useState(25);
  const [rate, setRate] = useState(5.25);
  const [years, setYears] = useState(20);

  const { downAmount, loan, pay, interest, totalPaid } = useMemo(() => {
    const downAmount = Math.round(price * (downPct / 100));
    const loan = price - downAmount;
    const pay = Math.round(monthlyPayment(loan, rate, years));
    const totalPaid = pay * years * 12;
    const interest = Math.max(0, totalPaid - loan);
    return { downAmount, loan, pay, interest, totalPaid };
  }, [price, downPct, rate, years]);

  const downPresets = [10, 20, 25, 30, 40, 50];
  const yearPresets = [10, 15, 20, 25];

  const principalRatio = totalPaid > 0 ? (loan / totalPaid) * 100 : 70;
  const interestRatio = totalPaid > 0 ? (interest / totalPaid) * 100 : 30;

  return (
    <div className="rounded-[22px] sm:rounded-[24px] border border-border bg-surface p-4 sm:p-6 shadow-xs">
      {/* Monthly Payment Hero Box */}
      <div className="relative overflow-hidden rounded-[18px] sm:rounded-[20px] bg-gradient-to-br from-primary-tint/90 via-surface to-primary-tint/40 p-4 sm:p-6 border border-primaryColor/20 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primaryColor">
              <Calculator className="size-4" />
              <span>{t.calc?.monthly ?? 'Estimated Monthly Payment'}</span>
            </div>
            <motion.div
              key={pay}
              initial={{ y: -8, opacity: 0.4 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-2 font-display text-[32px] sm:text-[42px] font-extrabold text-primaryColor tracking-tight tabular"
            >
              {omr(pay)}
              <span className="ms-2 font-sans text-xs font-medium text-text-muted">
                {lang === 'ar' ? '/ شهر' : '/ month'}
              </span>
            </motion.div>
          </div>

          <div className="flex flex-col gap-1 text-xs text-text-muted sm:text-end border-t sm:border-t-0 sm:border-s border-border/80 pt-3 sm:pt-0 sm:ps-6">
            <div>
              <span>{lang === 'ar' ? 'سعر العقار:' : 'Home Price:'}</span>{' '}
              <b className="tabular text-text">{omr(price)}</b>
            </div>
            <div>
              <span>{t.calc?.down ?? 'Down payment'}:</span>{' '}
              <b className="tabular text-text">{omr(downAmount)}</b> ({downPct}%)
            </div>
          </div>
        </div>

        {/* Visual Progress Bar: Principal vs Total Interest */}
        <div className="mt-5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-border/60">
            <motion.div
              className="h-full bg-primaryColor"
              initial={{ width: 0 }}
              animate={{ width: `${principalRatio}%` }}
              transition={{ duration: 0.6 }}
              title="Loan Principal"
            />
            <motion.div
              className="h-full bg-[#b0693a]"
              initial={{ width: 0 }}
              animate={{ width: `${interestRatio}%` }}
              transition={{ duration: 0.6 }}
              title="Total Interest"
            />
          </div>

          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primaryColor" />
              <span>{t.calc?.loan ?? 'Loan principal'}:</span>
              <b className="tabular text-text">{omr(loan)}</b>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#b0693a]" />
              <span>{t.calc?.interest ?? 'Total interest'}:</span>
              <b className="tabular text-text">{omr(interest)}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="mt-6 space-y-5">
        {/* Down Payment Slider & Presets */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor="m-down" className="font-bold text-text">
              {t.calc?.down ?? 'Down payment'}
            </label>
            <span className="font-display font-bold text-primaryColor tabular text-sm">
              {downPct}% · {omr(downAmount)}
            </span>
          </div>
          <input
            id="m-down"
            type="range"
            min={10}
            max={60}
            step={5}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="w-full accent-[var(--primaryColor)] cursor-pointer"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {downPresets.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setDownPct(pct)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all border',
                  downPct === pct
                    ? 'border-primaryColor bg-primaryColor text-white'
                    : 'border-border bg-surface text-text-muted hover:border-primaryColor hover:text-text'
                )}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Interest Rate Slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor="m-rate" className="font-bold text-text">
              {t.calc?.rate ?? 'Interest rate'}
            </label>
            <span className="font-display font-bold text-primaryColor tabular text-sm">
              {rate.toFixed(2)}%
            </span>
          </div>
          <input
            id="m-rate"
            type="range"
            min={3}
            max={8}
            step={0.25}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-[var(--primaryColor)] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-text-muted mt-1 tabular">
            <span>3.00% ({lang === 'ar' ? 'أقل فائدة' : 'Lowest'})</span>
            <span>5.25% ({lang === 'ar' ? 'متوسط عمان' : 'Oman Avg'})</span>
            <span>8.00%</span>
          </div>
        </div>

        {/* Loan Term Slider & Presets */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label htmlFor="m-years" className="font-bold text-text">
              {t.calc?.term ?? 'Loan Term'}
            </label>
            <span className="font-display font-bold text-primaryColor tabular text-sm">
              {years} {t.calc?.years ?? 'years'}
            </span>
          </div>
          <input
            id="m-years"
            type="range"
            min={5}
            max={25}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-[var(--primaryColor)] cursor-pointer"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {yearPresets.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYears(y)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all border',
                  years === y
                    ? 'border-primaryColor bg-primaryColor text-white'
                    : 'border-border bg-surface text-text-muted hover:border-primaryColor hover:text-text'
                )}
              >
                {y} {t.calc?.years ?? 'years'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer Note */}
      <p className="mt-5 text-[11px] leading-relaxed text-text-muted border-t border-border pt-3">
        {t.calc?.note ?? 'Estimate only. Bank approval, insurance, and administrative fees are determined by your lending institution.'}
      </p>
    </div>
  );
}
