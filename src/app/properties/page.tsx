import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchView } from '@/components/search/search-view';
import { getDict } from '@/i18n/server';
import { getAreas, searchProperties } from '@/lib/api';
import type { SearchParams } from '@/lib/types';

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: sp.purpose === 'rent' ? 'Homes for rent in Muscat' : 'Homes for sale in Muscat',
    alternates: { canonical: `/properties?purpose=${sp.purpose === 'rent' ? 'rent' : 'buy'}` },
  };
}

export default async function PropertiesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params: SearchParams = { ...sp, purpose: sp.purpose === 'rent' ? 'rent' : 'buy' };
  const [{ t }, areas, results, pool] = await Promise.all([
    getDict(),
    getAreas(),
    searchProperties({ ...params, limit: 12 }),
    // Same filters minus the area, to put counts on the map pins.
    searchProperties({ ...params, area: undefined, page: undefined, limit: 48 }),
  ]);
  const areaCounts = pool.items.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.area.slug]: (acc[c.area.slug] ?? 0) + 1 }), {});

  return (
    <>
      <section className="wrap pb-6 pt-9">
        <nav aria-label="Breadcrumb" className="flex gap-2 text-[13px] text-muted">
          <Link href="/" className="hover:text-teal">{t.nav.discover}</Link>
          <span>/</span>
          <span>{params.purpose === 'rent' ? t.nav.rent : t.nav.buy}</span>
        </nav>
        <h1 className="mt-2 text-[clamp(30px,3.6vw,48px)]">{t.results.title}</h1>
      </section>
      <SearchView results={results} areas={areas} params={params} areaCounts={areaCounts} />
    </>
  );
}
