import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DetailView } from '@/components/property/detail-view';
import { getAreas, getProperty, getSimilar } from '@/lib/api';

type Props = { params: Promise<{ slug: string }> };

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) return { title: 'Home not found' };
  const verb = p.purpose === 'SALE' ? 'for sale' : 'for rent';
  return {
    title: `${p.title} ${verb} in ${p.area.name}`,
    description: `${p.bedrooms}-bedroom ${p.type.toLowerCase()} ${verb} in ${p.area.name}, Muscat. OMR ${p.price.toLocaleString('en-US')}. ${p.description.slice(0, 120)}`,
    alternates: { canonical: `/properties/${p.slug}` },
    openGraph: { images: p.images.slice(0, 1).map((i) => ({ url: i.url })) },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) notFound();
  const [similar, areas] = await Promise.all([getSimilar(p.id), getAreas()]);

  // Structured data for search engines (schema.org RealEstateListing).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: p.title,
    url: `${SITE}/properties/${p.slug}`,
    image: p.images.map((i) => (i.url.startsWith('http') ? i.url : `${SITE}${i.url}`)),
    datePosted: p.publishedAt,
    offers: { '@type': 'Offer', price: p.price, priceCurrency: p.currency, availability: 'https://schema.org/InStock' },
    about: {
      '@type': p.type === 'APARTMENT' || p.type === 'PENTHOUSE' ? 'Apartment' : 'SingleFamilyResidence',
      numberOfRooms: p.bedrooms,
      numberOfBathroomsTotal: p.bathrooms,
      floorSize: { '@type': 'QuantitativeValue', value: p.builtUpArea, unitCode: 'MTK' },
      address: { '@type': 'PostalAddress', addressLocality: p.area.name, addressRegion: 'Muscat', addressCountry: 'OM' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <DetailView p={p} similar={similar} areas={areas} />
    </>
  );
}
