'use client';
import { Box, Moon, RotateCw, Sun } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/utils';

// three.js is ~150 kB gzipped: load it only in the browser, only where a viewer is shown.
const VillaScene = dynamic(() => import('./villa-scene'), {
  ssr: false,
  loading: () => <SceneFallback />,
});

function SceneFallback() {
  const { t } = useI18n();
  return (
    <div className="grid h-full place-items-center">
      <div className="flex items-center gap-2 text-sm text-ink-2">
        <span className="size-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />
        {t.show3d.loading}
      </div>
    </div>
  );
}

const group = 'flex gap-1 rounded-full border border-line p-1 glass';
const item = (on: boolean) =>
  cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition [&_svg]:size-3.5', on ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink');

export function VillaViewer({ label, className, height = 470 }: { label?: { title: string; sub: string }; className?: string; height?: number }) {
  const { t } = useI18n();
  const [exploded, setExploded] = useState(false);
  const [dusk, setDusk] = useState(false);
  const [auto, setAuto] = useState(true);

  return (
    <div
      className={cn('relative overflow-hidden rounded-[28px] border border-line shadow-soft transition-colors duration-700', className)}
      style={{
        background: dusk
          ? 'radial-gradient(ellipse at 50% 20%, #34425a, #141d2b 90%)'
          : 'radial-gradient(ellipse at 50% 30%, var(--sand-2), color-mix(in oklab, var(--teal) 25%, var(--paper)) 95%)',
      }}
    >
      <div style={{ height }} className="max-h-[70vh] min-h-[320px]">
        <VillaScene exploded={exploded} dusk={dusk} autoRotate={auto} className="h-full w-full cursor-grab active:cursor-grabbing" />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute start-4 top-4 flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-2 glass">
          <RotateCw className="size-3.5" />
          {t.show3d.drag}
        </div>
        {label && (
          <div className="absolute end-4 top-4 rounded-2xl border border-line px-3 py-2 text-xs leading-snug glass">
            <b className="block text-[13.5px]">{label.title}</b>
            {label.sub}
          </div>
        )}
        <div className="pointer-events-auto absolute inset-x-4 bottom-4 flex flex-wrap justify-between gap-2.5">
          <div className={group}>
            <button type="button" className={item(!exploded)} onClick={() => setExploded(false)} aria-pressed={!exploded}>
              <Box />
              {t.show3d.assembled}
            </button>
            <button type="button" className={item(exploded)} onClick={() => setExploded(true)} aria-pressed={exploded}>
              {t.show3d.explode}
            </button>
          </div>
          <div className={group}>
            <button type="button" className={item(!dusk)} onClick={() => setDusk(false)} aria-pressed={!dusk}>
              <Sun />
              {t.show3d.day}
            </button>
            <button type="button" className={item(dusk)} onClick={() => setDusk(true)} aria-pressed={dusk}>
              <Moon />
              {t.show3d.dusk}
            </button>
            <button type="button" className={item(auto)} onClick={() => setAuto(!auto)} aria-pressed={auto}>
              {t.show3d.auto}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small, non-interactive spinning villa for the hero card. */
export function MiniVilla({ className }: { className?: string }) {
  return <VillaScene interactive={false} autoRotate zoom={1.25} className={className} />;
}
