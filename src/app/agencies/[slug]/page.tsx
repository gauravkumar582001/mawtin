import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AgencyProfile } from '@/components/agency/agency-views';
import { getAgency, searchProperties } from '@/lib/api';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getAgency((await params).slug);
  return a
    ? {
        title: `${a.name} — Licensed Brokerage in Muscat | Velra`,
        description: a.about ?? `Browse verified properties listed by ${a.name} in Muscat, Oman.`,
        alternates: { canonical: `/agencies/${a.slug}` },
      }
    : { title: 'Agency Not Found — Velra' };
}

export default async function AgencyPage({ params }: Props) {
  const { slug } = await params;
  const agency = await getAgency(slug);
  if (!agency) notFound();
  const listings = await searchProperties({ agency: slug, limit: 48 });
  return <AgencyProfile agency={agency} listings={listings.items} />;
}
