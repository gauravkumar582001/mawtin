import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Manrope, Noto_Sans_Arabic, Readex_Pro, Reem_Kufi } from 'next/font/google';
import { CompareTray } from '@/components/layout/compare-tray';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Providers } from '@/components/layout/providers';
import { getLang } from '@/i18n/server';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], variable: '--font-noto-arabic', display: 'swap' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
const readex = Readex_Pro({ subsets: ['latin', 'arabic'], variable: '--font-readex', display: 'swap' });
const reem = Reem_Kufi({ subsets: ['arabic', 'latin'], variable: '--font-reem', display: 'swap' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Velra | Homes to buy or rent in Muscat', template: '%s · Velra' },
  description: 'Find a place that feels like yours. Homes to buy or rent in Muscat from verified partner agencies, with guidance from your first shortlist to your next viewing.',
  openGraph: { type: 'website', siteName: 'Velra', images: ['/homes/villa.webp'] },
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f7f8' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1a1e' },
  ],
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`${manrope.variable} ${notoArabic.variable} ${bricolage.variable} ${readex.variable} ${reem.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var r=document.documentElement,c=null,t="light";try{c=window.localStorage.getItem("velra-theme")}catch(e){}if(c==="light"||c==="dark"){t=c}else{try{if(window.matchMedia("(prefers-color-scheme: dark)").matches){t="dark"}}catch(e){}}r.dataset.theme=t;r.style.colorScheme=t})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--text)] antialiased">
        <Providers lang={lang}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--surface)] focus:px-5 focus:py-3 focus:font-semibold focus:text-[var(--text)] focus:shadow-raised"
          >
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CompareTray />
        </Providers>
      </body>
    </html>
  );
}
