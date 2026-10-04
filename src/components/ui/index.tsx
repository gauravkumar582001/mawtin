'use client';
import { animate, motion, useInView, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from 'motion/react';
import Link from 'next/link';
import { forwardRef, useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ───────── Velra Logo ─────────
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <svg viewBox="0 0 40 40" className="size-8 lg:size-[36px] shrink-0" fill="none" aria-hidden>
        <rect width="40" height="40" rx="12" fill="var(--primaryColor)" />
        <path d="M12 14L20 28L28 14" stroke="var(--on-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 14L20 21L24 14" stroke="var(--primary-tint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="11" r="2" fill="var(--on-primary)" />
      </svg>
      <span dir="ltr" className="font-[family-name:var(--font-manrope)] text-[26px] lg:text-[30px] font-bold leading-none tracking-[-0.03em] text-[var(--text)]">
        Velra
      </span>
    </span>
  );
}

// ───────── Velra Pill Button ─────────
export { btn, btnVariants, btnSizes, type BtnProps } from '@/lib/ui-styles';
import { btn, type BtnProps } from '@/lib/ui-styles';

export const Button = forwardRef<HTMLButtonElement, ComponentProps<'button'> & BtnProps>(function Button(
  { variant, size, className, type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={cn(btn({ variant, size }), className)} {...rest} />;
});

export function ButtonLink({ href, variant, size, className, children }: BtnProps & { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={cn(btn({ variant, size }), className)}>
      {children}
    </Link>
  );
}

// ───────── Motion helpers ─────────
/** Fades and lifts content in as it scrolls into view. */
export function Reveal({ children, delay = 0, y = 28, className, ...rest }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.75, 0.2, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Mouse-driven 3D tilt with a moving glare. Disabled on touch devices by CSS media. */
export function TiltCard({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 220, damping: 22 });
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const glare = useTransform([gx, gy], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,.32), transparent 45%)`);

  return (
    <motion.div
      ref={ref}
      className={cn('group/tilt relative [transform-style:preserve-3d]', className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return;
        const b = ref.current.getBoundingClientRect();
        mx.set((e.clientX - b.left) / b.width);
        my.set((e.clientY - b.top) / b.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
        style={{ background: glare }}
      />
    </motion.div>
  );
}

/** Counts up from 0 when scrolled into view. */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.2, 0.75, 0.2, 1],
      onUpdate: (v) => (node.textContent = Math.round(v).toLocaleString('en-US')),
    });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={cn('tabular', className)}>
      {to.toLocaleString('en-US')}
    </span>
  );
}

// ───────── Layout bits ─────────
export function SectionHead({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className="mt-2.5 text-[clamp(28px,3.2vw,44px)] font-bold text-[var(--text)]">{title}</h2>
        {sub && <p className="mt-2 text-base text-[var(--text-muted)]">{sub}</p>}
      </div>
      {action}
    </Reveal>
  );
}

export function Pill({ tone = 'info', children }: { tone?: 'ok' | 'warn' | 'bad' | 'info'; children: ReactNode }) {
  const tones = {
    ok: 'bg-[var(--success-tint)] text-[var(--success)]',
    warn: 'bg-[var(--warn-bg)] text-[var(--warn)]',
    bad: 'bg-[var(--error-tint)] text-[var(--errorColor)]',
    info: 'bg-[var(--primary-tint)] text-[var(--primaryColor)]',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold', tones[tone])}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function Avatar({ name, color = '#236b79', size = 34 }: { name: string; color?: string | null; size?: number }) {
  const letters = name
    .split(' ')
    .filter((w) => w && w !== 'Al' && w[0] === w[0].toUpperCase())
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ background: color ?? 'var(--primaryColor)', width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {letters || name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="grid gap-1.5 text-[13px] font-medium text-[var(--text-muted)]">
      {label}
      {children}
      {hint && <span className="text-[12px] font-normal text-[var(--text-subtle)]">{hint}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-[var(--radius-field)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[14.5px] text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none transition focus:border-[var(--primaryColor)] focus:ring-[3px] focus:ring-[var(--primary-tint)]';
