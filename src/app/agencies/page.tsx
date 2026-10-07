import type { Metadata } from 'next';
import { AgencyList } from '@/components/agency/agency-views';
import { getAgencies } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Licensed Real Estate Agencies in Muscat — Velra',
  description: 'Browse licensed real estate brokerages in Muscat, Oman verified with the Ministry of Housing & Urban Planning (MHUP).',
  alternates: { canonical: '/agencies' },
};
export const revalidate = 600;

export default async function AgenciesPage() {
  return <AgencyList agencies={await getAgencies()} />;
}
