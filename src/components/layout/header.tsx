'use client';
import { Check, ChevronDown, Heart, Layers, LogOut, Menu, Moon, Sun, Monitor, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Logo } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { isAgencyStaff, useAuth } from '@/store/auth';
import { useCompare, useSaved } from '@/store/shortlist';

function useTheme() {
  const [theme, setThemeState] = useState<'system' | 'light' | 'dark'>('system');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('velra-theme') as 'light' | 'dark' | null;
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
      } else {
        setThemeState('system');
      }
    } catch {}
  }, []);

  const setTheme = (t: 'system' | 'light' | 'dark') => {
    setThemeState(t);
    const root = document.documentElement;
    try {
      if (t === 'system') {
        localStorage.removeItem('velra-theme');
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.dataset.theme = isDark ? 'dark' : 'light';
        root.style.colorScheme = isDark ? 'dark' : 'light';
      } else {
        localStorage.setItem('velra-theme', t);
        root.dataset.theme = t;
        root.style.colorScheme = t;
      }
    } catch {}
  };

  return { theme, setTheme };
}

function NavLinks({ onNavigate, mobile }: { onNavigate?: () => void; mobile?: boolean }) {
  const { t } = useI18n();
  const path = usePathname();
  const sp = useSearchParams();
  const purpose = sp.get('purpose');

  const items = [
    { href: '/properties?purpose=buy', label: t.nav.buy, active: path === '/properties' && purpose === 'buy' },
    { href: '/properties?purpose=rent', label: t.nav.rent, active: path === '/properties' && purpose === 'rent' },
    { href: '/#neighborhoods', label: t.nav.neighborhoods, active: false },
    { href: '/agencies', label: t.nav.agencies, active: path.startsWith('/agencies') },
  ];

  return (
    <ul className={cn(mobile ? 'flex flex-col gap-1 py-2' : 'flex items-center gap-1')}>
      {items.map((i) => (
        <li key={i.href}>
          <Link
            href={i.href}
            onClick={onNavigate}
            aria-current={i.active ? 'page' : undefined}
            className={cn(
              mobile
                ? 'flex h-12 items-center rounded-xl px-4 text-base font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]'
                : 'inline-flex h-11 items-center rounded-full px-4 text-[15px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]',
              i.active && 'bg-[var(--surface-hover)] font-semibold text-[var(--primaryColor)]',
            )}
          >
            {i.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Header() {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [langMenu, setLangMenu] = useState(false);
  const [themeMenu, setThemeMenu] = useState(false);
  const { theme, setTheme } = useTheme();

  const saved = useSaved((s) => s.items.length);
  const compare = useCompare((s) => s.items.length);
  const { user, logout } = useAuth();

  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenu(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] w-full max-w-[1440px] items-center justify-between gap-4 px-5 md:px-8 lg:h-20 lg:px-16">
        {/* Left: Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-8 xl:gap-12">
          <Link href="/" aria-label="Velra, home" className="inline-flex items-center gap-2.5">
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden lg:block">
            <Suspense>
              <NavLinks />
            </Suspense>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-2.5">
          {/* Compare shortcut */}
          <Link
            href="/compare"
            aria-label={t.nav.compare}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <Layers className="h-5 w-5" />
            {compare > 0 && (
              <span className="absolute -end-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--primaryColor)] px-1 text-[11px] font-semibold text-white">
                {compare}
              </span>
            )}
          </Link>

          {/* Saved homes shortcut */}
          <Link
            href="/saved"
            aria-label={t.nav.saved}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <Heart className="h-5 w-5" />
            <AnimatePresence>
              {saved > 0 && (
                <motion.span
                  key={saved}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className="absolute -end-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--primaryColor)] px-1 text-[11px] font-semibold text-white"
                >
                  {saved}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Language selector dropdown */}
          <div ref={langRef} className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => {
                setLangMenu(!langMenu);
                setThemeMenu(false);
              }}
              aria-expanded={langMenu}
              aria-label={t.nav.language}
              className="group inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[14.5px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] aria-expanded:bg-[var(--surface-hover)]"
            >
              <span dir="ltr">{lang === 'en' ? 'EN' : 'AR'}</span>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-150 group-aria-expanded:rotate-180" />
            </button>
            <AnimatePresence>
              {langMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute end-0 top-full z-50 mt-1.5 min-w-[130px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-raised"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setLang('en');
                      setLangMenu(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--surface-hover)]',
                      lang === 'en' && 'font-semibold text-[var(--primaryColor)]',
                    )}
                  >
                    <span>English</span>
                    {lang === 'en' && <Check className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLang('ar');
                      setLangMenu(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--surface-hover)]',
                      lang === 'ar' && 'font-semibold text-[var(--primaryColor)]',
                    )}
                  >
                    <span>العربية</span>
                    {lang === 'ar' && <Check className="h-4 w-4" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme selector dropdown */}
          <div ref={themeRef} className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => {
                setThemeMenu(!themeMenu);
                setLangMenu(false);
              }}
              aria-expanded={themeMenu}
              aria-label={t.nav.theme}
              className="group inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[14.5px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] aria-expanded:bg-[var(--surface-hover)]"
            >
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : theme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-150 group-aria-expanded:rotate-180" />
            </button>
            <AnimatePresence>
              {themeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute end-0 top-full z-50 mt-1.5 min-w-[130px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-raised"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      setThemeMenu(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--surface-hover)]',
                      theme === 'light' && 'font-semibold text-[var(--primaryColor)]',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      {t.nav.light}
                    </span>
                    {theme === 'light' && <Check className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      setThemeMenu(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--surface-hover)]',
                      theme === 'dark' && 'font-semibold text-[var(--primaryColor)]',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      {t.nav.dark}
                    </span>
                    {theme === 'dark' && <Check className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('system');
                      setThemeMenu(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--surface-hover)]',
                      theme === 'system' && 'font-semibold text-[var(--primaryColor)]',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      {t.nav.system}
                    </span>
                    {theme === 'system' && <Check className="h-4 w-4" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile / Dashboard / Sign In */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href={isAgencyStaff(user) ? '/dashboard' : '/account'}
                className="inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.fullName.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                aria-label={t.nav.signOut}
                onClick={async () => {
                  await logout();
                  toast(t.auth.signedOut);
                  router.push('/');
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              {t.nav.signIn}
            </Link>
          )}

          {/* Velra Signature 'Get in touch' pill button */}
          <Link
            href="/#faq"
            className="ms-2 hidden h-12 items-center justify-center rounded-full border-[1.5px] border-[var(--text)] bg-transparent px-8 text-[15px] font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] lg:inline-flex"
          >
            {t.nav.getInTouch}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-base font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)] lg:hidden"
            aria-label={t.nav.menu}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span>{t.nav.menu}</span>
            {open ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {open && (
          <motion.div
            aria-label="Mobile Navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--border)] bg-[var(--surface)] px-5 pb-6 pt-3 lg:hidden"
          >
            <Suspense>
              <NavLinks mobile onNavigate={() => setOpen(false)} />
            </Suspense>

            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-muted)]">{t.nav.language}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLang('en');
                      setOpen(false);
                    }}
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                      lang === 'en' ? 'bg-[var(--primary-tint)] font-semibold text-[var(--primaryColor)]' : 'text-[var(--text-muted)]',
                    )}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLang('ar');
                      setOpen(false);
                    }}
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                      lang === 'ar' ? 'bg-[var(--primary-tint)] font-semibold text-[var(--primaryColor)]' : 'text-[var(--text-muted)]',
                    )}
                  >
                    العربية
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-muted)]">{t.nav.theme}</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors',
                      theme === 'light' ? 'bg-[var(--primary-tint)] text-[var(--primaryColor)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]',
                    )}
                  >
                    <Sun className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors',
                      theme === 'dark' ? 'bg-[var(--primary-tint)] text-[var(--primaryColor)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]',
                    )}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors',
                      theme === 'system' ? 'bg-[var(--primary-tint)] text-[var(--primaryColor)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]',
                    )}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Link
                href="/#faq"
                onClick={() => setOpen(false)}
                className="mt-2 flex h-12 items-center justify-center rounded-full border-[1.5px] border-[var(--text)] font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                {t.nav.getInTouch}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
