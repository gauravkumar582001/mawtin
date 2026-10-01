'use client';
import { motion } from 'motion/react';
import type { Area } from '@/lib/types';
import { cn, mapXY, pick } from '@/lib/utils';
import { useI18n } from '@/i18n/client';

/**
 * Stylised map of the Muscat coastline with a pin per neighbourhood.
 * Drawn in SVG so it needs no map tiles or third-party keys.
 */
export function MuscatMap({
  areas,
  counts,
  active,
  highlight,
  onPick,
  className,
}: {
  areas: Area[];
  counts: Record<string, number>;
  active?: string[];
  highlight?: string | null;
  onPick?: (slug: string) => void;
  className?: string;
}) {
  const { t, lang } = useI18n();
  const coast = 'M0 58C40 64 70 72 110 80C150 88 180 104 220 112C250 118 270 130 300 124C330 118 350 134 372 142C392 150 410 126 440 120';
  return (
    <div className={cn('overflow-hidden rounded-[22px] border border-line bg-surface', className)}>
      <svg viewBox="0 0 440 240" role="img" aria-label={t.results.map} direction="ltr" className="block h-auto w-full">
        <defs>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--teal)" stopOpacity=".22" />
            <stop offset="1" stopColor="var(--teal)" stopOpacity=".08" />
          </linearGradient>
        </defs>
        <rect width="440" height="240" fill="var(--sand-2)" />
        <path d="M0 0H440V120C410 126 392 150 372 142C350 134 330 118 300 124C270 130 250 118 220 112C180 104 150 88 110 80C70 72 40 64 0 58Z" fill="url(#sea)" />
        <motion.path d={coast} fill="none" stroke="var(--teal)" strokeOpacity=".5" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6 }} />
        <path d="M40 200C90 186 140 214 200 206S330 190 440 214" fill="none" stroke="var(--copper)" strokeOpacity=".35" strokeWidth="6" strokeLinecap="round" />
        <text x="24" y="30" fontSize="9" fill="var(--teal)" letterSpacing="3" opacity=".8">
          GULF OF OMAN
        </text>
        {areas.map((a, i) => {
          const { x, y } = mapXY(a.lat, a.lng);
          const n = counts[a.slug] ?? 0;
          const on = active?.includes(a.slug);
          const hl = highlight === a.slug;
          return (
            <motion.g
              key={a.slug}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: n || on ? 1 : 0.45, y: hl ? -4 : 0 }}
              transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 300, damping: 18 }}
              style={{ cursor: onPick ? 'pointer' : 'default' }}
              onClick={() => onPick?.(a.slug)}
              role={onPick ? 'button' : undefined}
              aria-label={`${pick(lang, a.name, a.nameAr)}: ${n}`}
              tabIndex={onPick ? 0 : undefined}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick?.(a.slug)}
            >
              <g transform={`translate(${x} ${y}) scale(.72)`}>
                <path d="M0 0C-9-10-13-15-13-21A13 13 0 0 1 13-21C13-15 9-10 0 0Z" fill={on || hl ? 'var(--copper)' : 'var(--teal)'} />
                <text y="-17" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                  {n}
                </text>
                <text y="17" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--ink)">
                  {lang === 'ar' ? a.nameAr : a.slug === 'msq' ? 'MSQ' : a.name}
                </text>
              </g>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
