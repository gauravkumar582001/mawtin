'use client';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '@/i18n/client';
import type { ImageRef } from '@/lib/types';

export function Gallery({ images, title }: { images: ImageRef[]; title: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const shown = [...images];
  while (shown.length < 3 && images.length) shown.push(images[0]);

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setOpen((i) => (i === null ? i : (i + d + images.length) % images.length));
    },
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, go]);

  return (
    <>
      <div className="grid h-[260px] gap-3 overflow-hidden rounded-[26px] sm:h-[472px] sm:grid-cols-[2fr_1fr] sm:grid-rows-2">
        {shown.slice(0, 3).map((img, i) => (
          <motion.button
            key={`${img.id}-${i}`}
            type="button"
            onClick={() => setOpen(i % images.length)}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: i * 0.1 }}
            className={`group relative overflow-hidden bg-sand ${i === 0 ? 'sm:row-span-2' : 'hidden sm:block'}`}
            aria-label={`${title}, ${i + 1}`}
          >
            <Image src={img.url} alt={img.alt ?? title} fill priority={i === 0} sizes={i === 0 ? '(max-width:640px) 100vw, 66vw' : '33vw'} className="object-cover transition-transform duration-[900ms] ease-out-soft group-hover:scale-105" />
            {i === 0 && (
              <span className="absolute bottom-3.5 end-3.5 flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-[13px] font-semibold text-[#16303a]">
                <Images className="size-4" />
                <span className="tabular">{images.length}</span> {t.detail.photos}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[70] grid place-items-center bg-[rgba(6,18,22,.92)] px-4 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          >
            <AnimatePresence mode="popLayout" custom={dir}>
              <motion.div
                key={open}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.45 }}
                className="relative aspect-[16/10] w-full max-w-[1100px]"
              >
                <Image src={images[open].url} alt={images[open].alt ?? title} fill sizes="100vw" className="rounded-2xl object-contain" />
              </motion.div>
            </AnimatePresence>
            <button type="button" onClick={() => setOpen(null)} aria-label={t.detail.close} className="absolute end-5 top-5 grid size-12 place-items-center rounded-full bg-white/15 text-white" autoFocus>
              <X />
            </button>
            <button type="button" onClick={() => go(-1)} aria-label={t.detail.prev} className="absolute start-5 top-1/2 grid size-12 place-items-center rounded-full bg-white/15 text-white">
              <ChevronLeft className="rtl-flip" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t.detail.next} className="absolute end-5 top-1/2 grid size-12 place-items-center rounded-full bg-white/15 text-white">
              <ChevronRight className="rtl-flip" />
            </button>
            <div className="tabular absolute bottom-6 text-[13px] text-[#cfe0e1]">
              {open + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
