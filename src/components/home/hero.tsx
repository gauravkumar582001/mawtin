'use client';
import { ArrowRight, Box, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { MiniVilla } from '@/components/three/villa-viewer';
import { useI18n } from '@/i18n/client';
import type { Area } from '@/lib/types';
import { pick } from '@/lib/utils';
import { SearchBar } from './search-bar';

export function Hero({ areas, featuredTitle }: { areas: Area[]; featuredTitle: string }) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer parallax for the photo and floating 3D card
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 22 });
  const sy = useSpring(py, { stiffness: 90, damping: 22 });
  const imgX = useTransform(sx, (v) => v * -16);
  const imgY = useTransform(sy, (v) => v * -12);
  const cardRY = useTransform(sx, (v) => v * 10);
  const cardRX = useTransform(sy, (v) => v * -8);

  // Scroll dynamics
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -45]);

  const words = t.hero.title.split(' ');

  return (
    <section className="wrap pt-3 pb-8 md:pt-4">
      {/* ───────── Hero Stage Container ───────── */}
      <div
        ref={ref}
        className="relative isolate min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] rounded-[24px] sm:rounded-[32px] px-6 pb-[180px] pt-12 sm:px-10 sm:pb-[140px] lg:px-14 lg:pb-[120px] lg:pt-16 overflow-visible shadow-sm"
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse' || !ref.current) return;
          const b = ref.current.getBoundingClientRect();
          px.set((e.clientX - b.left) / b.width - 0.5);
          py.set((e.clientY - b.top) / b.height - 0.5);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
      >
        {/* Background Visual Canvas */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[var(--surface)]">
          <motion.div className="absolute inset-[-4%]" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.4 }}>
            <motion.div className="absolute inset-0" style={{ x: imgX, y: imgY, scale }}>
              <Image
                src="/homes/villa.webp"
                alt="Contemporary luxury architecture in Muscat"
                fill
                priority
                sizes="100vw"
                className="object-cover object-[center_50%]"
              />
            </motion.div>
          </motion.div>

          {/* Architectural Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a1f]/85 via-[#0b1a1f]/45 to-[#0b1a1f]/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(35,107,121,0.25),transparent_60%)]" />
        </div>

        {/* Hero Editorial Content */}
        <motion.div style={{ y: copyY }} className="relative max-w-[680px] text-white">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-md"
          >
            <Sparkles className="size-3.5 text-[#8fe3bd]" />
            <span>{t.hero.eyebrow}</span>
          </motion.div>

          {/* Headline with word-by-word reveal */}
          <h1 className="mt-4 text-[clamp(34px,4.6vw,60px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-white">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top">
                <motion.span
                  className="inline-block"
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, delay: 0.12 + i * 0.06, ease: [0.2, 0.75, 0.2, 1] }}
                >
                  {w}
                </motion.span>
                {i < words.length - 1 && '\u00A0'}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-3.5 max-w-[540px] text-[clamp(15px,1.3vw,17.5px)] leading-relaxed text-white/85"
          >
            {t.hero.sub}
          </motion.p>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 hidden flex-wrap gap-2.5 sm:flex"
          >
            {t.hero.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[12.5px] font-medium text-white/90 backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ───────── Floating 3D Villa Preview Card ───────── */}
        <motion.aside
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          style={{ rotateX: cardRX, rotateY: cardRY, transformPerspective: 900 }}
          className="absolute end-8 top-8 hidden w-[270px] rounded-2xl border border-white/25 bg-black/25 p-4 text-white shadow-raised backdrop-blur-xl xl:block"
          aria-label={t.hero.explore3d}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="truncate font-semibold text-white/95 text-[13px]">{featuredTitle}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-[#8fe3bd]">
              <span className="size-1.5 animate-pulse rounded-full bg-[#8fe3bd]" />
              3D
            </span>
          </div>
          <MiniVilla className="h-[175px] w-full" />
          <Link
            href="/#show3d"
            className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white text-[13.5px] font-semibold text-[#0f1a1e] transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Box className="h-4 w-4" />
            <span>{t.hero.explore3d}</span>
          </Link>
        </motion.aside>

        {/* ───────── Overlapping Floating Search Bar ───────── */}
        <div className="absolute inset-x-3.5 bottom-0 translate-y-1/2 sm:inset-x-8 lg:bottom-0 lg:left-1/2 lg:w-[min(1240px,calc(100%-64px))] lg:-translate-x-1/2 lg:translate-y-1/2 rtl:lg:translate-x-1/2 z-20">
          <SearchBar areas={areas} />
        </div>
      </div>

      {/* ───────── Popular Areas Strip ───────── */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-[80px] sm:pt-[70px] lg:pt-[60px] text-[13.5px] text-[var(--text-muted)]">
        <span className="font-semibold text-[var(--text-subtle)]">{t.search.popular}</span>
        {areas.slice(0, 5).map((a) => (
          <Link
            key={a.slug}
            href={`/properties?area=${a.slug}`}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-[13px] font-semibold text-[var(--text)] transition-all hover:-translate-y-0.5 hover:border-[var(--primaryColor)] hover:text-[var(--primaryColor)] shadow-sm"
          >
            {pick(lang, a.name, a.nameAr)}
          </Link>
        ))}
        <Link
          href="/properties"
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold text-[var(--primaryColor)] hover:underline"
        >
          <span>{t.search.allAreasLink}</span>
          <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
        </Link>
      </div>
    </section>
  );
}
