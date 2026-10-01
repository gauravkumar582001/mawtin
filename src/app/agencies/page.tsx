import type { Metadata } from 'next';
import { AgencyList } from '@/components/agency/agency-views';
import { getAgencies } from '@/lib/api';

export const metadata: Metadata = { title: 'Licensed real estate agencies in Muscat', alternates: { canonical: '/agencies' } };
export const revalidate = 600;

export default async function AgenciesPage() {
  return <AgencyList agencies={await getAgencies()} />;
}
