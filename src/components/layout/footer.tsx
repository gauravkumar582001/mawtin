'use client';
import { ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui';
import { useI18n } from '@/i18n/client';

export function Footer() {
  const { t, lang, setLang } = useI18n();

  return (
    <>
      {/* Velra Demo Info Strip */}
      <aside aria-label="Demo notice" className="border-t border-[var(--border)] bg-[var(--primary-tint)]">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center gap-2 px-5 py-3 text-center text-sm text-[var(--text)] md:px-8 lg:px-16">
          <Info className="hidden h-4 w-4 shrink-0 text-[var(--primaryColor)] sm:block" aria-hidden />
          <p>{t.footer.demoNotice}</p>
        </div>
      </aside>

      {/* Velra 4-Column Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:py-16 xl:grid-cols-[1.33fr_1fr_1fr_1fr] xl:gap-0">
            {/* Column 1: Brand & Bio */}
            <div className="flex flex-col gap-5">
              <Link href="/" aria-label="Velra, home" className="inline-flex items-center gap-2.5">
                <Logo />
              </Link>
              <p className="max-w-sm text-lg text-[var(--text-muted)]">{t.footer.tagline}</p>
              <p className="text-base font-medium text-[var(--text-muted)]">{t.footer.location}</p>
            </div>

            {/* Column 2: Explore */}
            <div className="min-w-0 xl:border-s xl:border-[var(--border)] xl:pe-10 xl:ps-10">
              <h2 className="text-lg font-bold text-[var(--text)]">{t.footer.explore}</h2>
              <ul className="mt-4 flex flex-col gap-1 lg:mt-6">
                <li>
                  <Link
                    href="/properties?purpose=buy"
                    className="group flex h-11 items-center justify-between gap-4 text-[16px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span>{t.footer.buyAHome}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties?purpose=rent"
                    className="group flex h-11 items-center justify-between gap-4 text-[16px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span>{t.footer.rentAHome}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#neighborhoods"
                    className="group flex h-11 items-center justify-between gap-4 text-[16px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span>{t.footer.neighborhoods}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Your Search */}
            <div className="min-w-0 xl:border-s xl:border-[var(--border)] xl:pe-10 xl:ps-10">
              <h2 className="text-lg font-bold text-[var(--text)]">{t.footer.help}</h2>
              <ul className="mt-4 flex flex-col gap-1 lg:mt-6">
                <li>
                  <Link
                    href="/saved"
                    className="group flex h-11 items-center justify-between gap-4 text-[16px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span>{t.footer.savedHomes}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compare"
                    className="group flex h-11 items-center justify-between gap-4 text-[16px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span>{t.footer.compareHomes}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties"
                    className="group flex h-11 items-center justify-between gap-4 text-[16px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span>{t.footer.requestViewing}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Platform / Agency */}
            <div className="min-w-0 xl:border-s xl:border-[var(--border)] xl:pe-10 xl:ps-10">
              <h2 className="text-lg font-bold text-[var(--text)]">{t.footer.forAgencies}</h2>
              <ul className="mt-4 flex flex-col gap-1 lg:mt-6">
                <li>
                  <Link
                    href="/agencies"
                    className="group flex h-11 items-center justify-between gap-4 text-[16px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span>{t.footer.ourAgency}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="group flex h-11 items-center justify-between gap-4 text-[16px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span>{t.nav.workspace}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="group flex h-11 items-center justify-between gap-4 text-[16px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <span>{t.faq.title}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright & settings bar */}
          <div className="flex flex-col gap-4 border-t border-[var(--border)] py-6 text-[14.5px] text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Velra. {t.footer.rights}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <p className="text-xs text-[var(--text-subtle)]">{t.footer.note}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                  className="inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <span dir="ltr">{lang === 'en' ? 'العربية' : 'English'}</span>
                </button>
                <span aria-hidden className="h-4 w-px bg-[var(--border)]" />
                <span className="px-2 text-xs font-semibold text-[var(--text)]" dir="ltr">
                  {t.footer.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
