// Sample data used when the API is unreachable or NEXT_PUBLIC_DEMO_MODE=true.
// Matches the seed in apps/api/prisma/seed.ts so screens look the same in both modes.
import type { Agency, Area, Paginated, PropertyCard, PropertyDetail, PropertyType, Purpose, SearchParams } from './types';

const AREAS: Area[] = [
  { id: 'a-seeb', slug: 'seeb', name: 'Seeb', nameAr: 'السيب', city: 'Muscat', lat: 23.6703, lng: 58.1891, blurb: 'Family streets near the beach', blurbAr: 'أحياء عائلية قرب الشاطئ', listingCount: 0 },
  { id: 'a-mouj', slug: 'al-mouj', name: 'Al Mouj', nameAr: 'الموج', city: 'Muscat', lat: 23.6186, lng: 58.2745, blurb: 'Marina living and golf', blurbAr: 'حياة المرسى والغولف', listingCount: 0 },
  { id: 'a-msq', slug: 'msq', name: 'Madinat Sultan Qaboos', nameAr: 'مدينة السلطان قابوس', city: 'Muscat', lat: 23.5963, lng: 58.4236, blurb: 'Leafy, central, embassy district', blurbAr: 'هادئة ومركزية وحي السفارات', listingCount: 0 },
  { id: 'a-qurum', slug: 'qurum', name: 'Qurum', nameAr: 'القرم', city: 'Muscat', lat: 23.6139, lng: 58.4777, blurb: 'Parks, beach and cafés', blurbAr: 'حدائق وشاطئ ومقاهٍ', listingCount: 0 },
  { id: 'a-bausher', slug: 'bausher', name: 'Bausher', nameAr: 'بوشر', city: 'Muscat', lat: 23.568, lng: 58.4, blurb: 'Mountain views, easy commute', blurbAr: 'إطلالات جبلية وتنقل سهل', listingCount: 0 },
  { id: 'a-muttrah', slug: 'muttrah', name: 'Muttrah', nameAr: 'مطرح', city: 'Muscat', lat: 23.6153, lng: 58.564, blurb: 'Corniche and old souq', blurbAr: 'الكورنيش والسوق القديم', listingCount: 0 },
];

const AREA_IMG: Record<string, string> = {
  seeb: '/homes/townhouse.webp', 'al-mouj': '/homes/view.webp', msq: '/homes/villa-facade.webp',
  qurum: '/homes/villa.webp', bausher: '/homes/garden.webp', muttrah: '/homes/terrace.webp',
};
export const areaImage = (slug: string) => AREA_IMG[slug] ?? '/homes/villa.webp';

type Team = { id: string; fullName: string; title: string; titleAr: string; phone: string; email: string };
const TEAM: Record<string, Team[]> = {
  'saraya-estates': [
    { id: 'u-aisha', fullName: 'Aisha Al Balushi', title: 'Senior agent', titleAr: 'وكيلة أولى', phone: '+968 9123 4501', email: 'aisha@saraya.om' },
    { id: 'u-khalid', fullName: 'Khalid Al Harthy', title: 'Sales agent', titleAr: 'وكيل مبيعات', phone: '+968 9123 4502', email: 'khalid@saraya.om' },
  ],
  'al-khaleej-homes': [
    { id: 'u-maryam', fullName: 'Maryam Al Lawati', title: 'Leasing lead', titleAr: 'مسؤولة التأجير', phone: '+968 9123 4503', email: 'maryam@alkhaleej.om' },
    { id: 'u-salim', fullName: 'Salim Al Hinai', title: 'Sales agent', titleAr: 'وكيل مبيعات', phone: '+968 9123 4504', email: 'salim@alkhaleej.om' },
  ],
  'liwan-realty': [{ id: 'u-yousef', fullName: 'Yousef Al Rawahi', title: 'Sales agent', titleAr: 'وكيل مبيعات', phone: '+968 9123 4505', email: 'yousef@liwan.om' }],
  'sidr-and-stone': [{ id: 'u-noor', fullName: 'Noor Al Kindi', title: 'Director', titleAr: 'مديرة', phone: '+968 9123 4506', email: 'noor@sidrstone.om' }],
};

const AGENCIES: Agency[] = [
  { id: 'g-saraya', slug: 'saraya-estates', name: 'Saraya Estates', nameAr: 'سرايا العقارية', brandColor: '#236777', logoUrl: null, licenseNo: 'RERA-MCT-0412', status: 'VERIFIED', coverUrl: '/homes/villa-facade.webp', about: 'Villas and family homes across Qurum and Madinat Sultan Qaboos.', aboutAr: 'فلل ومنازل عائلية في القرم ومدينة السلطان قابوس.', phone: '+968 2456 0412', email: 'hello@saraya.om', website: null, foundedYear: 2011, area: { slug: 'qurum', name: 'Qurum', nameAr: 'القرم' }, team: [], listingCount: 0 },
  { id: 'g-khaleej', slug: 'al-khaleej-homes', name: 'Al Khaleej Homes', nameAr: 'منازل الخليج', brandColor: '#b0693a', logoUrl: null, licenseNo: 'RERA-MCT-0877', status: 'VERIFIED', coverUrl: '/homes/view.webp', about: 'Freehold apartments and villas in Al Mouj and along the coast.', aboutAr: 'شقق وفلل تملك حر في الموج والساحل.', phone: '+968 2456 0877', email: 'hello@alkhaleej.om', website: null, foundedYear: 2015, area: { slug: 'al-mouj', name: 'Al Mouj', nameAr: 'الموج' }, team: [], listingCount: 0 },
  { id: 'g-liwan', slug: 'liwan-realty', name: 'Liwan Realty', nameAr: 'ليوان للعقارات', brandColor: '#5a7d4e', logoUrl: null, licenseNo: 'RERA-MCT-1120', status: 'VERIFIED', coverUrl: '/homes/townhouse.webp', about: 'Townhouses and rentals for growing families in Seeb.', aboutAr: 'منازل متلاصقة وإيجارات للعائلات في السيب.', phone: '+968 2456 1120', email: 'hello@liwan.om', website: null, foundedYear: 2018, area: { slug: 'seeb', name: 'Seeb', nameAr: 'السيب' }, team: [], listingCount: 0 },
  { id: 'g-sidr', slug: 'sidr-and-stone', name: 'Sidr & Stone', nameAr: 'سدر وحجر', brandColor: '#4b5a8a', logoUrl: null, licenseNo: 'RERA-MCT-0215', status: 'VERIFIED', coverUrl: '/homes/terrace.webp', about: 'Architect-led homes and city apartments.', aboutAr: 'منازل بتصاميم معمارية وشقق في المدينة.', phone: '+968 2456 0215', email: 'hello@sidrstone.om', website: null, foundedYear: 2009, area: { slug: 'msq', name: 'Madinat Sultan Qaboos', nameAr: 'مدينة السلطان قابوس' }, team: [], listingCount: 0 },
];

type Row = [slug: string, title: string, titleAr: string, area: string, type: PropertyType, purpose: Purpose, price: number, beds: number, baths: number, size: number, imgs: string[], agency: string, agent: number, featured: boolean, amen: string[], desc: string, descAr: string, year?: number, floors?: number, coords?: [lat: number, lng: number]];

const ROWS: Row[] = [
  ['qurum-courtyard-villa', 'The Qurum Courtyard Villa', 'فيلا القرم ذات الفناء', 'qurum', 'VILLA', 'SALE', 185000, 4, 4, 320, ['villa', 'villa-facade', 'garden', 'living'], 'saraya-estates', 0, true, ['pool', 'garden', 'parking', 'ac', 'maid', 'wifi'], 'A limestone and teak villa set around a shaded courtyard, five minutes from Qurum beach. Double-height entrance, open kitchen, and a roof terrace facing the Hajar mountains.', 'فيلا من الحجر الجيري وخشب الساج حول فناء مظلل، على بعد خمس دقائق من شاطئ القرم. مدخل مزدوج الارتفاع ومطبخ مفتوح وسطح يطل على جبال الحجر.', 2023, 2, [23.6182, 58.4795]],
  ['al-mouj-marina-residence', 'Al Mouj Marina Residence', 'شقة مرسى الموج', 'al-mouj', 'APARTMENT', 'RENT', 950, 2, 2, 128, ['living', 'view', 'living-2'], 'al-khaleej-homes', 0, false, ['pool', 'gym', 'sea', 'ac', 'parking', 'wifi'], 'Bright two-bedroom apartment with floor-to-ceiling glazing and a wide balcony over the marina.', 'شقة مشرقة بغرفتي نوم وواجهات زجاجية وشرفة واسعة تطل على المرسى.', 2021, 1, [23.6231, 58.2715]],
  ['seeb-garden-house', 'Seeb Garden House', 'بيت حديقة السيب', 'seeb', 'TOWNHOUSE', 'SALE', 99000, 3, 3, 210, ['townhouse', 'terrace', 'townhouse-2'], 'liwan-realty', 0, false, ['garden', 'parking', 'ac', 'maid'], 'A calm corner townhouse with a planted front garden and a covered majlis.', 'منزل هادئ على زاوية مع حديقة أمامية ومجلس مغطى.', 2022, 2, [23.6742, 58.1852]],
  ['qurum-terrace-apartment', 'Qurum Terrace Apartment', 'شقة شرفة القرم', 'qurum', 'APARTMENT', 'RENT', 720, 2, 2, 116, ['living-2', 'view'], 'saraya-estates', 1, false, ['gym', 'ac', 'parking', 'wifi'], 'Two bedrooms, a generous terrace and a short walk to Qurum Natural Park.', 'غرفتا نوم وشرفة واسعة وعلى مسافة قصيرة من حديقة القرم الطبيعية.', 2020, 1, [23.6095, 58.4718]],
  ['al-mouj-garden-villa', 'Al Mouj Garden Villa', 'فيلا حديقة الموج', 'al-mouj', 'VILLA', 'SALE', 245000, 5, 5, 366, ['villa-2', 'garden', 'living'], 'al-khaleej-homes', 1, true, ['pool', 'garden', 'sea', 'parking', 'ac', 'maid'], 'Freehold five-bedroom villa on the golf course with a private pool and a shaded pergola.', 'فيلا تملك حر بخمس غرف على ملعب الغولف مع مسبح خاص وعريشة مظللة.', 2023, 2, [23.6148, 58.2812]],
  ['seeb-corner-home', 'Seeb Corner Home', 'منزل زاوية السيب', 'seeb', 'TOWNHOUSE', 'RENT', 610, 3, 3, 190, ['townhouse-2', 'terrace'], 'liwan-realty', 0, false, ['garden', 'parking', 'ac'], 'Three-bedroom family home close to schools and Seeb beach.', 'منزل عائلي بثلاث غرف قريب من المدارس وشاطئ السيب.', 2021, 2, [23.6664, 58.1963]],
  ['msq-embassy-row-villa', 'Embassy Row Villa', 'فيلا حي السفارات', 'msq', 'VILLA', 'SALE', 310000, 5, 6, 420, ['villa-facade', 'villa', 'living-2'], 'sidr-and-stone', 0, true, ['pool', 'garden', 'parking', 'ac', 'maid', 'gym'], 'Architect-designed villa on a quiet MSQ street, with a courtyard pool and a separate guest suite.', 'فيلا بتصميم معماري في شارع هادئ بمدينة السلطان قابوس، مع مسبح في الفناء وجناح ضيوف مستقل.', 2024, 2, [23.5985, 58.4208]],
  ['bausher-heights-apartment', 'Bausher Heights Apartment', 'شقة مرتفعات بوشر', 'bausher', 'APARTMENT', 'SALE', 68000, 2, 2, 124, ['view', 'living'], 'sidr-and-stone', 0, false, ['gym', 'ac', 'parking'], 'Mountain-view apartment with easy access to the expressway and Muscat Grand Mall.', 'شقة بإطلالة جبلية وسهولة الوصول إلى الطريق السريع.', 2019, 1, [23.5642, 58.3965]],
  ['muttrah-corniche-loft', 'Muttrah Corniche Loft', 'لوفت كورنيش مطرح', 'muttrah', 'APARTMENT', 'RENT', 540, 1, 1, 82, ['living-2', 'view'], 'al-khaleej-homes', 0, false, ['sea', 'ac', 'wifi'], 'A compact loft above the corniche, a few steps from the souq and the harbour.', 'لوفت فوق الكورنيش على بعد خطوات من السوق والميناء.', 2018, 1, [23.6165, 58.5658]],
  ['bausher-family-townhouse', 'Bausher Family Townhouse', 'منزل بوشر العائلي', 'bausher', 'TOWNHOUSE', 'RENT', 780, 4, 3, 240, ['townhouse', 'garden'], 'liwan-realty', 0, false, ['garden', 'parking', 'ac', 'maid'], 'Four bedrooms, a private yard and a shaded parking court.', 'أربع غرف وفناء خاص ومواقف مظللة.', 2022, 2, [23.5718, 58.4062]],
  ['al-mouj-lagoon-penthouse', 'Lagoon Penthouse', 'بنتهاوس البحيرة', 'al-mouj', 'PENTHOUSE', 'SALE', 275000, 3, 4, 260, ['living', 'view', 'villa-2'], 'al-khaleej-homes', 1, true, ['pool', 'sea', 'gym', 'parking', 'ac', 'wifi'], 'Top-floor penthouse with a wraparound terrace and a private plunge pool.', 'بنتهاوس في الطابق الأخير بشرفة محيطة ومسبح خاص.', 2022, 1, [23.6262, 58.2678]],
  ['msq-garden-townhouse', 'MSQ Garden Townhouse', 'منزل حديقة المدينة', 'msq', 'TOWNHOUSE', 'SALE', 142000, 4, 4, 280, ['terrace', 'townhouse-2'], 'sidr-and-stone', 0, false, ['garden', 'parking', 'ac', 'maid', 'majlis'], 'Four-bedroom townhouse with a rooftop majlis and a walled garden.', 'منزل بأربع غرف مع مجلس على السطح وحديقة مسوّرة.', 2023, 2, [23.5932, 58.4295]],
];

const areaRef = (slug: string) => {
  const a = AREAS.find((x) => x.slug === slug)!;
  return { id: a.id, slug: a.slug, name: a.name, nameAr: a.nameAr };
};
const agencyOf = (slug: string) => AGENCIES.find((a) => a.slug === slug)!;

export const LISTINGS: PropertyDetail[] = ROWS.map((r, i) => {
  const [slug, title, titleAr, area, type, purpose, price, beds, baths, size, imgs, agencySlug, agentIdx, featured, amen, desc, descAr, year, floors, coords] = r;
  const ag = agencyOf(agencySlug);
  const agent = TEAM[agencySlug][agentIdx] ?? TEAM[agencySlug][0];
  const a = AREAS.find((x) => x.slug === area)!;
  const published = new Date(Date.UTC(2026, 8, 1 + i)).toISOString();
  const lat = coords?.[0] ?? a.lat;
  const lng = coords?.[1] ?? a.lng;
  return {
    id: `p-${String(i + 1).padStart(2, '0')}`,
    slug, title, titleAr, purpose, type, status: 'PUBLISHED', price, currency: 'OMR',
    rentPeriod: purpose === 'RENT' ? 'MONTHLY' : null,
    bedrooms: beds, bathrooms: baths, builtUpArea: size, featured, amenities: amen,
    area: { ...areaRef(area), lat, lng },
    agency: { id: ag.id, slug: ag.slug, name: ag.name, nameAr: ag.nameAr, brandColor: ag.brandColor, logoUrl: null, phone: ag.phone, email: ag.email, licenseNo: ag.licenseNo },
    images: imgs.map((n, j) => ({ id: `${slug}-${j}`, url: `/homes/${n}.webp`, alt: `${title}, photo ${j + 1}`, width: 1600, height: 900 })),
    publishedAt: published, createdAt: published,
    description: desc, descriptionAr: descAr, plotArea: type === 'VILLA' ? Math.round(size * 1.6) : null,
    yearBuilt: year ?? 2022, parking: 2, floors: floors ?? 2, furnished: false, freehold: area === 'al-mouj',
    lat, lng, addressLine: null, viewCount: 120 + i * 37, model3dUrl: null,
    pricePerSqm: purpose === 'SALE' ? Math.round(price / size) : null,
    agent: { id: agent.id, fullName: agent.fullName, phone: agent.phone, email: agent.email, title: agent.title, titleAr: agent.titleAr },
  };
});

for (const a of AREAS) a.listingCount = LISTINGS.filter((l) => l.area.slug === a.slug).length;
for (const g of AGENCIES) {
  g.listingCount = LISTINGS.filter((l) => l.agency.slug === g.slug).length;
  g.team = TEAM[g.slug].map((m) => ({
    id: m.id,
    fullName: m.fullName,
    title: m.title,
    titleAr: m.titleAr,
    phone: m.phone,
    email: m.email,
    languages: ['Arabic', 'English'],
  }));
  g.memberCount = g.team.length;
}

export const toCard = (p: PropertyDetail): PropertyCard => ({
  id: p.id, slug: p.slug, title: p.title, titleAr: p.titleAr, purpose: p.purpose, type: p.type, status: p.status,
  price: p.price, currency: p.currency, rentPeriod: p.rentPeriod, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
  builtUpArea: p.builtUpArea, featured: p.featured, amenities: p.amenities,
  area: { id: p.area.id, slug: p.area.slug, name: p.area.name, nameAr: p.area.nameAr },
  agency: { id: p.agency.id, slug: p.agency.slug, name: p.agency.name, nameAr: p.agency.nameAr, brandColor: p.agency.brandColor, logoUrl: null },
  images: p.images.slice(0, 2), publishedAt: p.publishedAt, createdAt: p.createdAt,
  lat: p.lat, lng: p.lng,
});

export function mockSearch(sp: SearchParams & { featured?: boolean; limit?: number; agency?: string }): Paginated<PropertyCard> {
  const purpose: Purpose | undefined = sp.purpose === 'rent' ? 'RENT' : sp.purpose === 'buy' ? 'SALE' : undefined;
  const types = sp.type?.toUpperCase().split(',').filter(Boolean);
  const areas = sp.area?.split(',').filter(Boolean);
  const amen = sp.amenities?.split(',').filter(Boolean);
  let rows = LISTINGS.filter((l) =>
    (!purpose || l.purpose === purpose) &&
    (!types?.length || types.includes(l.type)) &&
    (!areas?.length || areas.includes(l.area.slug)) &&
    (!sp.agency || l.agency.slug === sp.agency) &&
    (!sp.maxPrice || l.price <= Number(sp.maxPrice)) &&
    (!sp.minPrice || l.price >= Number(sp.minPrice)) &&
    (!sp.beds || l.bedrooms >= Number(sp.beds)) &&
    (!sp.baths || l.bathrooms >= Number(sp.baths)) &&
    (!sp.minArea || l.builtUpArea >= Number(sp.minArea)) &&
    (!sp.maxArea || l.builtUpArea <= Number(sp.maxArea)) &&
    (!amen?.length || amen.every((a) => l.amenities.includes(a))) &&
    (sp.featured === undefined || l.featured === sp.featured) &&
    (!sp.q || `${l.title} ${l.titleAr} ${l.area.name}`.toLowerCase().includes(sp.q.toLowerCase())),
  );
  const sorters: Record<string, (a: PropertyDetail, b: PropertyDetail) => number> = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    size_desc: (a, b) => b.builtUpArea - a.builtUpArea,
    popular: (a, b) => b.viewCount - a.viewCount,
    newest: (a, b) => Number(b.featured) - Number(a.featured) || b.id.localeCompare(a.id),
  };
  rows = [...rows].sort(sorters[sp.sort ?? 'newest'] ?? sorters.newest);
  const limit = sp.limit ?? 12;
  const page = Math.max(1, Number(sp.page ?? 1));
  const items = rows.slice((page - 1) * limit, page * limit).map(toCard);
  return { items, meta: { page, limit, total: rows.length, pages: Math.max(1, Math.ceil(rows.length / limit)) } };
}

export const mockDetail = (slug: string) => LISTINGS.find((l) => l.slug === slug) ?? null;
export function mockSimilar(id: string): PropertyCard[] {
  const p = LISTINGS.find((l) => l.id === id);
  if (!p) return [];
  return LISTINGS.filter((l) => l.id !== id && l.purpose === p.purpose && (l.area.slug === p.area.slug || l.type === p.type)).slice(0, 3).map(toCard);
}
export const mockAreas = () => AREAS;
export const mockAgencies = (): Paginated<Agency> => ({ items: AGENCIES, meta: { page: 1, limit: 12, total: AGENCIES.length, pages: 1 } });
export const mockAgency = (slug: string) => AGENCIES.find((a) => a.slug === slug) ?? null;
