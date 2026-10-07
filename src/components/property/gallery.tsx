'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, X, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useI18n } from '@/i18n/client';
import type { ImageRef } from '@/lib/types';
import { cn } from '@/lib/utils';

export function Gallery({ images, title }: { images: ImageRef[]; title: string }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);

  const list = images.length > 0 ? images : [{ id: 'fallback', url: '/homes/villa.webp', alt: title }];

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setIsZoomed(false);
      setOpen((curr) => (curr === null ? curr : (curr + d + list.length) % list.length));
    },
    [list.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') go(lang === 'ar' ? -1 : 1);
      if (e.key === 'ArrowLeft') go(lang === 'ar' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, go, lang]);

  return (
    <>
      {/* ───────── Editorial Asymmetric Gallery Grid ───────── */}
      <div className="relative isolate overflow-hidden rounded-[24px] sm:rounded-[30px] border border-border bg-sand-2 shadow-xs">
        <div className="grid h-[280px] sm:h-[440px] lg:h-[500px] gap-2 sm:gap-2.5 sm:grid-cols-4 sm:grid-rows-2">
          {/* Main Hero Photo (Spans 2 cols & 2 rows on desktop) */}
          <motion.button
            type="button"
            onClick={() => setOpen(previewIdx)}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="group relative h-full w-full overflow-hidden bg-sand sm:col-span-2 sm:row-span-2 text-start focus:outline-none"
            aria-label={`${title} - Photo 1`}
          >
            <Image
              src={list[previewIdx]?.url ?? '/homes/villa.webp'}
              alt={list[previewIdx]?.alt ?? title}
              fill
              priority
              loading="eager"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>

          {/* Secondary Photo 1 */}
          <motion.button
            type="button"
            onClick={() => setOpen(1 % list.length)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative hidden sm:block h-full w-full overflow-hidden bg-sand text-start focus:outline-none"
            aria-label={`${title} - Photo 2`}
          >
            <Image
              src={list[1]?.url ?? list[0]?.url ?? '/homes/villa.webp'}
              alt={list[1]?.alt ?? title}
              fill
              loading="eager"
              sizes="(max-width: 1024px) 30vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>

          {/* Secondary Photo 2 */}
          <motion.button
            type="button"
            onClick={() => setOpen(2 % list.length)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="group relative hidden sm:block h-full w-full overflow-hidden bg-sand text-start focus:outline-none"
            aria-label={`${title} - Photo 3`}
          >
            <Image
              src={list[2]?.url ?? list[0]?.url ?? '/homes/villa.webp'}
              alt={list[2]?.alt ?? title}
              fill
              loading="eager"
              sizes="(max-width: 1024px) 30vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>

          {/* Secondary Photo 3 */}
          <motion.button
            type="button"
            onClick={() => setOpen(3 % list.length)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative hidden sm:block h-full w-full overflow-hidden bg-sand text-start focus:outline-none"
            aria-label={`${title} - Photo 4`}
          >
            <Image
              src={list[3]?.url ?? list[1]?.url ?? '/homes/villa.webp'}
              alt={list[3]?.alt ?? title}
              fill
              loading="eager"
              sizes="(max-width: 1024px) 30vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>

          {/* Secondary Photo 4 */}
          <motion.button
            type="button"
            onClick={() => setOpen(4 % list.length)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="group relative hidden sm:block h-full w-full overflow-hidden bg-sand text-start focus:outline-none"
            aria-label={`${title} - Photo 5`}
          >
            <Image
              src={list[4]?.url ?? list[2]?.url ?? '/homes/villa.webp'}
              alt={list[4]?.alt ?? title}
              fill
              loading="eager"
              sizes="(max-width: 1024px) 30vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </div>

        {/* Mobile Prev / Next Carousel Controls (on small preview area) */}
        {list.length > 1 && (
          <div className="sm:hidden">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIdx((curr) => (curr === 0 ? list.length - 1 : curr - 1));
              }}
              aria-label={t.detail?.prev ?? 'Previous photo'}
              className="absolute start-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-text hover:bg-surface shadow-md border border-border/80"
            >
              <ChevronLeft className="size-4 rtl-flip" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIdx((curr) => (curr === list.length - 1 ? 0 : curr + 1));
              }}
              aria-label={t.detail?.next ?? 'Next photo'}
              className="absolute end-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-text hover:bg-surface shadow-md border border-border/80"
            >
              <ChevronRight className="size-4 rtl-flip" />
            </button>

            {/* Mobile Pagination Dots */}
            <div className="absolute bottom-4 start-4 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-none">
              {list.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    idx === previewIdx ? 'w-3.5 bg-white shadow-xs' : 'w-1.5 bg-white/60'
                  )}
                />
              ))}
              {list.length > 5 && (
                <span className="text-[10px] font-bold text-white ps-0.5">
                  +{list.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Floating View All Photos Button */}
        <button
          type="button"
          onClick={() => setOpen(previewIdx)}
          className="absolute bottom-4 end-4 z-10 flex items-center gap-2 rounded-full border border-border/80 bg-surface/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-text shadow-md hover:bg-surface hover:border-primaryColor transition-all duration-200"
        >
          <Images className="size-4 text-primaryColor" />
          <span>
            {lang === 'ar'
              ? `عرض كل الصور (${list.length})`
              : `View all ${list.length} photos`}
          </span>
        </button>
      </div>

      {/* ───────── Fullscreen Lightbox Modal ───────── */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          >
            {/* Lightbox Header Bar */}
            <div className="flex items-center justify-between text-white pb-3 border-b border-white/10 z-10">
              <div className="flex items-center gap-3">
                <span className="tabular font-display text-sm font-bold bg-white/15 px-3 py-1 rounded-full">
                  {open + 1} / {list.length}
                </span>
                <span className="truncate max-w-[280px] sm:max-w-[480px] text-sm text-white/80 font-medium">
                  {title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed((z) => !z)}
                  aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                  title={isZoomed ? 'Zoom out' : 'Zoom in'}
                >
                  {isZoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsZoomed(false);
                    setOpen(null);
                  }}
                  aria-label={t.detail?.close ?? 'Close'}
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                  autoFocus
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Main Stage Image Display */}
            <div className="relative flex-1 flex items-center justify-center py-4 overflow-hidden">
              <AnimatePresence mode="popLayout" custom={dir}>
                <motion.div
                  key={open}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 50, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: isZoomed ? 1.45 : 1 }}
                  exit={{ opacity: 0, x: dir * -50 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                  className={cn(
                    'relative h-full max-h-[75vh] w-full max-w-[1200px] transition-transform duration-300',
                    isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                  )}
                  onClick={() => setIsZoomed((z) => !z)}
                >
                  <Image
                    src={list[open]?.url ?? '/homes/villa.webp'}
                    alt={list[open]?.alt ?? title}
                    fill
                    sizes="100vw"
                    className="object-contain rounded-2xl"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next Chevrons */}
              {list.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={t.detail?.prev ?? 'Previous photo'}
                    className="absolute start-2 sm:start-6 top-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-full bg-black/50 text-white/90 backdrop-blur-md border border-white/15 hover:bg-black/80 hover:scale-105 transition-all"
                  >
                    <ChevronLeft className="size-6 rtl-flip" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={t.detail?.next ?? 'Next photo'}
                    className="absolute end-2 sm:end-6 top-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-full bg-black/50 text-white/90 backdrop-blur-md border border-white/15 hover:bg-black/80 hover:scale-105 transition-all"
                  >
                    <ChevronRight className="size-6 rtl-flip" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Interactive Thumbnail Strip */}
            {list.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
                {list.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDir(idx > (open ?? 0) ? 1 : -1);
                      setOpen(idx);
                    }}
                    className={cn(
                      'relative size-14 sm:size-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200',
                      idx === open
                        ? 'border-primaryColor scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                    aria-label={`Jump to photo ${idx + 1}`}
                  >
                    <Image
                      src={thumb.url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
