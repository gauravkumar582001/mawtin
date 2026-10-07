// Shapes returned by the Mawtin API (apps/api). Keep in sync with the NestJS mappers.

export type Lang = 'en' | 'ar';
export type Purpose = 'SALE' | 'RENT';
export type PropertyType = 'VILLA' | 'APARTMENT' | 'TOWNHOUSE' | 'PENTHOUSE' | 'LAND' | 'OFFICE';
export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'UNDER_OFFER' | 'SOLD' | 'RENTED' | 'ARCHIVED';
export type Role = 'CUSTOMER' | 'AGENT' | 'AGENCY_ADMIN' | 'ADMIN';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'VIEWING_BOOKED' | 'OFFER_MADE' | 'WON' | 'LOST';
export type ViewingStatus = 'REQUESTED' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type OfferStatus = 'SUBMITTED' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED' | 'COMPLETED';
export type OfferAction = 'revise' | 'counter' | 'accept' | 'reject' | 'withdraw' | 'complete';
export type Financing = 'CASH' | 'MORTGAGE_APPROVED' | 'MORTGAGE_PENDING';

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface AreaRef { id: string; slug: string; name: string; nameAr: string }
export interface Area extends AreaRef {
  city: string;
  lat: number | null;
  lng: number | null;
  blurb: string | null;
  blurbAr: string | null;
  listingCount: number;
}

export interface AgencyRef {
  id: string;
  slug: string;
  name: string;
  nameAr: string | null;
  brandColor: string | null;
  logoUrl: string | null;
}

export interface ImageRef { id: string; url: string; alt: string | null; width?: number | null; height?: number | null }

export interface PropertyCard {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  purpose: Purpose;
  type: PropertyType;
  status: ListingStatus;
  price: number;
  currency: string;
  rentPeriod: 'MONTHLY' | 'YEARLY' | null;
  bedrooms: number;
  bathrooms: number;
  builtUpArea: number;
  featured: boolean;
  amenities: string[];
  area: AreaRef;
  agency: AgencyRef;
  images: ImageRef[];
  publishedAt: string | null;
  createdAt: string;
  lat?: number | null;
  lng?: number | null;
}

export interface PropertyDetail extends PropertyCard {
  description: string;
  descriptionAr: string | null;
  plotArea: number | null;
  yearBuilt: number | null;
  parking: number;
  floors: number;
  furnished: boolean;
  freehold: boolean;
  lat: number | null;
  lng: number | null;
  addressLine: string | null;
  viewCount: number;
  model3dUrl: string | null;
  pricePerSqm: number | null;
  area: AreaRef & { lat: number | null; lng: number | null };
  agency: AgencyRef & { phone: string | null; email: string | null; licenseNo: string };
  agent: { id: string; fullName: string; phone: string | null; email: string; title: string | null; titleAr: string | null } | null;
}

export interface Agency extends AgencyRef {
  licenseNo: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  coverUrl: string | null;
  about: string | null;
  aboutAr: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  foundedYear: number | null;
  area: { slug: string; name: string; nameAr: string } | null;
  team: {
    id: string;
    fullName: string;
    title: string | null;
    titleAr: string | null;
    role?: string;
    phone?: string | null;
    email?: string | null;
    languages?: string[];
  }[];
  listingCount: number;
  memberCount?: number;
}

export interface Me {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
  locale: string;
  agency: (AgencyRef & { status: string; memberRole: 'OWNER' | 'MANAGER' | 'AGENT'; title: string | null }) | null;
}

export interface Slot { time: string; startsAt: string; endsAt: string; available: boolean }
export interface AvailabilityDay { date: string; slots: Slot[] }

export interface Viewing {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  startsAt: string;
  endsAt: string;
  status: ViewingStatus;
  notes: string | null;
  property: { id: string; slug: string; title: string; titleAr: string | null; images: { url: string }[] };
  agent: { id: string; fullName: string; phone: string | null } | null;
}

export interface OfferEventRow {
  id: string;
  type: 'SUBMITTED' | 'REVISED' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED' | 'COMPLETED';
  amount: number | null;
  note: string | null;
  createdAt: string;
  actor: { id: string; fullName: string } | null;
}

export interface Offer {
  id: string;
  amount: number;
  counterAmount: number | null;
  financing: Financing;
  conditions: string | null;
  moveInDate: string | null;
  status: OfferStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  property: { id: string; slug: string; title: string; titleAr: string | null; price: number; status: ListingStatus; images: { url: string }[] };
  buyer: { id: string; fullName: string; email: string; phone: string | null };
  agency: { id: string; slug: string; name: string; nameAr: string | null };
  events: OfferEventRow[];
  allowedActions: OfferAction[];
  viewerRole: 'buyer' | 'agency';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: LeadStatus;
  source: 'WEBSITE' | 'PHONE' | 'WALK_IN' | 'REFERRAL';
  createdAt: string;
  updatedAt: string;
  property: { id: string; slug: string; title: string; titleAr: string | null; images: { url: string }[] };
  assignedTo: { id: string; fullName: string } | null;
}

export interface AgencyStats {
  kpis: {
    activeListings: number;
    pendingReview: number;
    newLeads7d: number;
    newLeadsChangePct: number | null;
    viewingsNext7d: number;
    offersAwaitingReply: number;
    acceptedOfferValue: number;
    openLeads: number;
  };
  leadsDaily: { day: string; count: number }[];
  topListings: { id: string; slug: string; title: string; viewCount: number; _count: { enquiries: number; favorites: number } }[];
}

export interface AgencyListing extends PropertyCard {
  viewCount: number;
  reviewNote: string | null;
  agent: { id: string; fullName: string } | null;
  counts: { enquiries: number; viewings: number; offers: number; favorites: number };
  updatedAt: string;
}

export interface SearchParams {
  purpose?: 'buy' | 'rent';
  type?: string;
  area?: string;
  maxPrice?: string;
  minPrice?: string;
  beds?: string;
  baths?: string;
  minArea?: string;
  maxArea?: string;
  agency?: string;
  amenities?: string;
  sort?: string;
  q?: string;
  page?: string;
}
