import { Hero } from '@/components/home/hero';
import {
  AgencyMarquee,
  BuyingRenting,
  Cta,
  Faq,
  Featured,
  Guidance,
  Journey,
  Neighbourhoods,
  Showcase3D,
  Stats,
  Types,
} from '@/components/home/sections';
import { getAgencies, getAreas, searchProperties } from '@/lib/api';
import { getLang } from '@/i18n/server';

export const revalidate = 60;

export default async function HomePage() {
  const [lang, areas, agencies, featured, all] = await Promise.all([
    getLang(),
    getAreas(),
    getAgencies(),
    searchProperties({ featured: true, limit: 12 }),
    searchProperties({ limit: 48 }),
  ]);

  // Show featured homes first, topped up with the newest listings.
  const cards = [...featured.items, ...all.items.filter((c) => !c.featured)].slice(0, 12);
  const counts = all.items.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.type]: (acc[c.type] ?? 0) + 1 }), {});
  const hero = featured.items.find((c) => c.type === 'VILLA') ?? cards[0];
  const heroTitle = hero ? (lang === 'ar' && hero.titleAr ? hero.titleAr : hero.title) : 'Velra';

  return (
    <>
      <Hero areas={areas} featuredTitle={heroTitle} />
      <Stats homes={all.meta.total} agencies={agencies.length} areas={areas.length} />
      <Featured cards={cards} />
      <Types counts={counts} />
      <BuyingRenting />
      <Neighbourhoods areas={areas} />
      <Guidance />
      <Showcase3D featured={hero} />
      <Journey />
      <AgencyMarquee agencies={agencies} />
      <Faq />
      <Cta />
    </>
  );
}
