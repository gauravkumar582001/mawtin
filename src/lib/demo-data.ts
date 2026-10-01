// Example workspace data for demo mode (NEXT_PUBLIC_DEMO_MODE=true). Clearly fictional.
import { LISTINGS, toCard } from './mock';
import type { AgencyListing, AgencyStats, Lead, LeadStatus, Offer, OfferStatus, Viewing } from './types';

const prop = (slug: string) => {
  const p = LISTINGS.find((l) => l.slug === slug)!;
  return { id: p.id, slug: p.slug, title: p.title, titleAr: p.titleAr, images: p.images.slice(0, 1).map((i) => ({ url: i.url })) };
};
const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const ahead = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

const lead = (id: string, name: string, slug: string, status: LeadStatus, source: Lead['source'], h: number): Lead => ({
  id, name, email: `${name.split(' ')[0].toLowerCase()}@example.com`, phone: null, message: 'I would like to know more about this home.',
  status, source, createdAt: ago(h), updatedAt: ago(h / 2), property: prop(slug), assignedTo: { id: 'u-aisha', fullName: 'Aisha Al Balushi' },
});

export const demoLeads = (): Lead[] => [
  lead('l1', 'Hamed Al Siyabi', 'qurum-courtyard-villa', 'NEW', 'WEBSITE', 2),
  lead('l2', 'Laura Bennett', 'msq-embassy-row-villa', 'NEW', 'WEBSITE', 5),
  lead('l3', 'Zainab Al Mahrouqi', 'qurum-terrace-apartment', 'CONTACTED', 'PHONE', 26),
  lead('l4', 'Rahul Menon', 'qurum-courtyard-villa', 'VIEWING_BOOKED', 'WEBSITE', 30),
  lead('l5', 'Fatma Al Shukaili', 'msq-garden-townhouse', 'VIEWING_BOOKED', 'WALK_IN', 50),
  lead('l6', 'Omar Al Farsi', 'msq-embassy-row-villa', 'OFFER_MADE', 'WEBSITE', 72),
  lead('l7', 'Sara Qasim', 'qurum-terrace-apartment', 'WON', 'REFERRAL', 140),
];

const offer = (id: string, slug: string, buyer: string, amount: number, status: OfferStatus, counter: number | null, fin: Offer['financing'], hoursAgo: number): Offer => {
  const p = LISTINGS.find((l) => l.slug === slug)!;
  const events: Offer['events'] = [{ id: `${id}-e1`, type: 'SUBMITTED', amount, note: null, createdAt: ago(hoursAgo), actor: { id: 'b', fullName: buyer } }];
  if (counter) events.push({ id: `${id}-e2`, type: 'COUNTERED', amount: counter, note: null, createdAt: ago(hoursAgo - 14), actor: { id: 'u-aisha', fullName: 'Aisha Al Balushi' } });
  return {
    id, amount, counterAmount: counter, financing: fin, conditions: null, moveInDate: null, status, expiresAt: ahead(30), createdAt: ago(hoursAgo), updatedAt: ago(hoursAgo - 1),
    property: { ...prop(slug), price: p.price, status: 'PUBLISHED' },
    buyer: { id: 'b', fullName: buyer, email: `${buyer.split(' ')[0].toLowerCase()}@example.com`, phone: null },
    agency: { id: p.agency.id, slug: p.agency.slug, name: p.agency.name, nameAr: p.agency.nameAr },
    events,
    allowedActions: status === 'SUBMITTED' ? ['counter', 'accept', 'reject'] : status === 'COUNTERED' ? ['reject'] : status === 'ACCEPTED' ? ['complete', 'reject'] : [],
    viewerRole: 'agency',
  };
};

export const demoOffers = (): Offer[] => [
  offer('o1', 'msq-embassy-row-villa', 'Omar Al Farsi', 292000, 'SUBMITTED', null, 'MORTGAGE_APPROVED', 40),
  offer('o2', 'qurum-courtyard-villa', 'Rahul Menon', 176000, 'COUNTERED', 181000, 'CASH', 90),
  offer('o3', 'msq-garden-townhouse', 'Fatma Al Shukaili', 139500, 'SUBMITTED', null, 'MORTGAGE_PENDING', 20),
];

/** The buyer's side of the same data, for /account in demo mode. */
export const demoMyOffers = (): Offer[] =>
  demoOffers()
    .slice(1, 2)
    .map((o) => ({ ...o, buyer: { ...o.buyer, fullName: 'Hamed Al Siyabi' }, viewerRole: 'buyer', allowedActions: ['accept', 'revise', 'reject', 'withdraw'] }));

export const demoViewings = (): Viewing[] => [
  { id: 'v1', propertyId: 'p-01', name: 'Rahul Menon', email: 'rahul@example.com', phone: '+968 9200 0000', startsAt: ahead(26), endsAt: ahead(26.75), status: 'CONFIRMED', notes: null, property: prop('qurum-courtyard-villa'), agent: { id: 'u-aisha', fullName: 'Aisha Al Balushi', phone: '+968 9123 4501' } },
  { id: 'v2', propertyId: 'p-12', name: 'Fatma Al Shukaili', email: 'fatma@example.com', phone: '+968 9300 0000', startsAt: ahead(32), endsAt: ahead(32.75), status: 'CONFIRMED', notes: null, property: prop('msq-garden-townhouse'), agent: null },
  { id: 'v3', propertyId: 'p-07', name: 'Laura Bennett', email: 'laura@example.com', phone: '+968 9400 0000', startsAt: ahead(74), endsAt: ahead(74.75), status: 'REQUESTED', notes: 'Can we see the guest suite?', property: prop('msq-embassy-row-villa'), agent: null },
];

export const demoListings = (): AgencyListing[] =>
  LISTINGS.filter((l) => ['saraya-estates', 'sidr-and-stone'].includes(l.agency.slug)).map((l, i) => ({
    ...toCard(l),
    status: (['PUBLISHED', 'UNDER_OFFER', 'PUBLISHED', 'PENDING_REVIEW', 'PUBLISHED', 'DRAFT'] as const)[i % 6],
    viewCount: [1240, 860, 432, 210, 980, 0][i % 6],
    reviewNote: null,
    agent: { id: 'u-aisha', fullName: 'Aisha Al Balushi' },
    counts: { enquiries: [14, 9, 6, 2, 11, 0][i % 6], viewings: [4, 3, 1, 0, 2, 0][i % 6], offers: [2, 1, 0, 0, 1, 0][i % 6], favorites: [31, 18, 9, 4, 22, 0][i % 6] },
    updatedAt: ago(i * 20),
  }));

export const demoStats = (): AgencyStats => ({
  kpis: { activeListings: 5, pendingReview: 1, newLeads7d: 11, newLeadsChangePct: 22, viewingsNext7d: 4, offersAwaitingReply: 2, acceptedOfferValue: 0, openLeads: 6 },
  leadsDaily: [0, 1, 0, 2, 1, 1, 0, 2, 1, 3, 1, 2, 2, 3].map((count, i) => ({ day: new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10), count })),
  topListings: [],
});
