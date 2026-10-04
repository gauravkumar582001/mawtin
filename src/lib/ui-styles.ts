import { cn } from './utils';

// ───────── Velra Pill Button Styles ─────────
export const btnVariants = {
  primary: 'bg-[var(--primaryColor)] text-[var(--on-primary)] shadow-sm hover:bg-[var(--primaryColorHover)] hover:-translate-y-0.5 active:translate-y-0',
  outline: 'border-[1.5px] border-[var(--text)] text-[var(--text)] hover:bg-[var(--surface-hover)] bg-transparent',
  soft: 'bg-[var(--primary-tint)] text-[var(--text)] hover:bg-[var(--primary-tint-hover)]',
  white: 'bg-white text-[#263f48] shadow-sm hover:-translate-y-0.5 hover:bg-[#f0f4f5]',
  ghost: 'text-[var(--primaryColor)] hover:bg-[var(--primary-tint)]',
} as const;

export const btnSizes = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-[46px] px-[22px] text-[14.5px]',
  lg: 'h-12 lg:h-[52px] px-8 text-[15px]',
} as const;

export type BtnProps = { variant?: keyof typeof btnVariants; size?: keyof typeof btnSizes };

export const btn = ({ variant = 'primary', size = 'md' }: BtnProps = {}) =>
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px]',
    btnVariants[variant],
    btnSizes[size],
  );

export const inputCls =
  'h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none transition-all focus:border-[var(--primaryColor)] focus:ring-2 focus:ring-[var(--primary-tint)]';
