'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bed, Bath, Maximize2, MapPin, Compass, Navigation, ChevronLeft, ChevronRight, ArrowUpRight, Images, X } from 'lucide-react';
import type { Map as MapLibreMapInstance, Marker, Popup } from 'maplibre-gl';
import type { Area, PropertyCard, PropertyDetail } from '@/lib/types';
import { useI18n } from '@/i18n/client';
import { cn, pick } from '@/lib/utils';

// OpenFreeMap: 100% free, no key, no watermark, MapLibre-native vector styles
const OPENFREEMAP_POSITRON = 'https://tiles.openfreemap.org/styles/positron';
const OPENFREEMAP_LIBERTY = 'https://tiles.openfreemap.org/styles/liberty';

function formatPriceShort(price: number, purpose: string): string {
  if (purpose === 'RENT') {
    return `${price.toLocaleString('en-US')}/mo`;
  }
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(1)}M OMR`;
  }
  if (price >= 1_000) {
    return `${Math.round(price / 1_000)}k OMR`;
  }
  return `${price.toLocaleString('en-US')} OMR`;
}

export interface MapLibreMapProps {
  properties?: (PropertyCard | PropertyDetail)[];
  areas?: Area[];
  selectedArea?: string | null;
  onPickArea?: (slug: string) => void;
  singleProperty?: PropertyCard | PropertyDetail;
  className?: string;
  height?: number | string;
}

export function MapLibreMap({
  properties = [],
  areas = [],
  selectedArea,
  onPickArea,
  singleProperty,
  className = '',
  height = 420,
}: MapLibreMapProps) {
  const { t, lang } = useI18n();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMapInstance | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const popupRef = useRef<Popup | null>(null);
  const [activeProperty, setActiveProperty] = useState<(PropertyCard | PropertyDetail) | null>(null);
  const [popupImgIdx, setPopupImgIdx] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapTheme, setMapTheme] = useState<'positron' | 'liberty'>('positron');

  // Reset popup image index when active property changes
  useEffect(() => {
    setPopupImgIdx(0);
  }, [activeProperty?.id]);

  // Initialize MapLibre GL
  useEffect(() => {
    let isCancelled = false;
    let map: MapLibreMapInstance | null = null;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const maplibregl = await import('maplibre-gl');
      if (isCancelled || !mapContainerRef.current) return;

      // Set worker URL to locally served static worker script to eliminate worker bundle errors
      if (typeof window !== 'undefined') {
        maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
        if (maplibregl.config) {
          maplibregl.config.WORKER_URL = '/maplibre-gl-worker.mjs';
        }
      }

      // Determine initial center: single property or Muscat coast center
      let initialCenter: [number, number] = [58.42, 23.6];
      let initialZoom = 11;

      if (singleProperty?.lng && singleProperty?.lat) {
        initialCenter = [singleProperty.lng, singleProperty.lat];
        initialZoom = 14;
      } else if (properties.length > 0) {
        const firstWithCoords = properties.find((p) => p.lng && p.lat);
        if (firstWithCoords && firstWithCoords.lng && firstWithCoords.lat) {
          initialCenter = [firstWithCoords.lng, firstWithCoords.lat];
        }
      }

      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: OPENFREEMAP_POSITRON,
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 8,
        maxZoom: 18,
        attributionControl: { compact: true },
      });

      // Add navigation controls (zoom, compass)
      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true,
        }),
        lang === 'ar' ? 'top-left' : 'top-right'
      );

      map.on('load', () => {
        if (isCancelled) return;
        setMapLoaded(true);
        map?.resize();
      });

      // Supply a 1x1 transparent pixel so missing POI sprites (office, atm, gate, etc.) don't flood the console
      map.on('styleimagemissing', (e: { id: string }) => {
        if (map && !map.hasImage(e.id)) {
          map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
        }
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isCancelled = true;
      if (popupRef.current) {
        popupRef.current.remove();
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lang, singleProperty]);

  // Update markers when properties or mapLoaded changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const displayList = singleProperty ? [singleProperty] : properties;

    import('maplibre-gl').then((maplibregl) => {
      const bounds = new maplibregl.LngLatBounds();
      let hasValidCoords = false;

      displayList.forEach((property) => {
        if (!property.lat || !property.lng) return;

        hasValidCoords = true;
        bounds.extend([property.lng, property.lat]);

        // Create marker DOM element
        const el = document.createElement('div');
        el.className = 'velra-map-marker';
        el.id = `map-marker-${property.slug}`;
        el.innerHTML = `<span>${formatPriceShort(property.price, property.purpose)}</span>`;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setActiveProperty(property);

          // Fly smoothly to marker
          map.flyTo({
            center: [property.lng!, property.lat!],
            zoom: Math.max(map.getZoom(), 13.5),
            offset: [0, -60],
            essential: true,
            duration: 800,
          });

          // Highlight marker element
          document.querySelectorAll('.velra-map-marker').forEach((m) => m.classList.remove('active'));
          el.classList.add('active');
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([property.lng, property.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Fit bounds if multiple properties and not singleProperty
      if (!singleProperty && hasValidCoords && displayList.length > 1) {
        map.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          maxZoom: 14,
          duration: 1000,
        });
      }
    });
  }, [properties, singleProperty, mapLoaded]);

  // Handle selected area change (fly to area center)
  useEffect(() => {
    if (!selectedArea || !mapInstanceRef.current || !mapLoaded) return;
    const area = areas.find((a) => a.slug === selectedArea);
    if (area && area.lat && area.lng) {
      mapInstanceRef.current.flyTo({
        center: [area.lng, area.lat],
        zoom: 13,
        duration: 1200,
        essential: true,
      });
    }
  }, [selectedArea, areas, mapLoaded]);

  // Reset / Fit All bounds function
  const handleFitAll = async () => {
    if (!mapInstanceRef.current || properties.length === 0) return;
    const maplibregl = await import('maplibre-gl');
    const bounds = new maplibregl.LngLatBounds();
    let count = 0;
    properties.forEach((p) => {
      if (p.lng && p.lat) {
        bounds.extend([p.lng, p.lat]);
        count++;
      }
    });
    if (count > 0) {
      mapInstanceRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
        duration: 800,
      });
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border border-line bg-surface shadow-xs ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {/* MapLibre DOM mount */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Top area quick-filter chips bar */}
      {areas.length > 0 && onPickArea && (
        <div className="absolute top-3 inset-x-3 pointer-events-none flex items-center gap-1.5 overflow-x-auto pb-1 z-10 scrollbar-none">
          <div className="pointer-events-auto flex items-center gap-1.5 bg-surface/90 backdrop-blur-md p-1.5 rounded-full border border-line shadow-sm">
            <button
              type="button"
              onClick={() => onPickArea('')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                !selectedArea
                  ? 'bg-primaryColor text-white shadow-xs'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'
              }`}
            >
              {t.featured?.all ?? 'All Areas'}
            </button>
            {areas.map((a) => {
              const isSelected = selectedArea === a.slug;
              return (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => onPickArea(a.slug)}
                  className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-primaryColor text-white shadow-xs'
                      : 'text-text-muted hover:text-text hover:bg-surface-hover'
                  }`}
                >
                  {lang === 'ar' ? a.nameAr : a.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating control buttons */}
      <div className="absolute bottom-4 start-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={handleFitAll}
          title={t.results?.found ?? 'Fit all'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/95 backdrop-blur-md text-text text-xs font-semibold border border-line shadow-md hover:bg-surface hover:border-primaryColor transition-colors"
        >
          <Compass className="size-3.5 text-primaryColor" />
          <span>{lang === 'ar' ? 'عرض الكل' : 'Fit all'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const next = mapTheme === 'positron' ? 'liberty' : 'positron';
            setMapTheme(next);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setStyle(
                next === 'liberty' ? OPENFREEMAP_LIBERTY : OPENFREEMAP_POSITRON
              );
            }
          }}
          title={lang === 'ar' ? 'تبديل مظهر الخريطة' : 'Toggle map theme'}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface/95 backdrop-blur-md text-text text-[11px] font-semibold border border-line shadow-md hover:bg-surface hover:border-primaryColor transition-colors"
        >
          <span className="text-text-muted">{lang === 'ar' ? 'المظهر:' : 'Theme:'}</span>
          <span className="text-primaryColor font-bold capitalize">{mapTheme}</span>
        </button>
      </div>

      {/* Interactive Property Detail Popup Card (shows on marker click) */}
      {activeProperty && (() => {
        const popupImages =
          activeProperty.images && activeProperty.images.length > 0
            ? activeProperty.images
            : [{ id: 'fallback', url: '/homes/villa.webp', alt: pick(lang, activeProperty.title, activeProperty.titleAr) }];
        const currentImg = popupImages[popupImgIdx % popupImages.length];

        return (
          <div
            className="absolute bottom-4 end-4 z-20 w-[320px] sm:w-[360px] md:w-[380px] rounded-[22px] border border-border/80 bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-label={pick(lang, activeProperty.title, activeProperty.titleAr)}
          >
            {/* Card Media / Photo Preview Area */}
            <div className="group/popup-media relative aspect-[16/10] w-full overflow-hidden bg-sand-2">
              {/* Clickable Image -> navigates to full property page */}
              <Link
                href={`/properties/${activeProperty.slug}`}
                className="relative block h-full w-full focus:outline-none"
                aria-label={pick(lang, activeProperty.title, activeProperty.titleAr)}
              >
                <img
                  src={currentImg?.url ?? '/homes/villa.webp'}
                  alt={currentImg?.alt ?? pick(lang, activeProperty.title, activeProperty.titleAr)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/popup-media:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              </Link>

              {/* Badges (Top Left in LTR, Top Right in RTL) */}
              <div className="absolute top-2.5 start-2.5 z-10 flex items-center gap-1.5 pointer-events-none">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primaryColor text-white shadow-xs">
                  {activeProperty.purpose === 'RENT'
                    ? lang === 'ar'
                      ? 'للإيجار'
                      : 'Rent'
                    : lang === 'ar'
                    ? 'للبيع'
                    : 'Sale'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface/90 backdrop-blur-sm text-text border border-border shadow-xs">
                  {t.typeOne?.[activeProperty.type] ?? activeProperty.type}
                </span>
              </div>

              {/* Top End: Photo Counter & Close Button */}
              <div className="absolute top-2.5 end-2.5 z-20 flex items-center gap-1.5">
                {popupImages.length > 1 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/55 backdrop-blur-md text-white shadow-xs flex items-center gap-1">
                    <Images className="size-3" />
                    <span>
                      {popupImgIdx + 1}/{popupImages.length}
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveProperty(null);
                    document.querySelectorAll('.velra-map-marker').forEach((m) => m.classList.remove('active'));
                  }}
                  className="size-7 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-text hover:bg-surface hover:scale-105 transition-all shadow-md border border-border/60"
                  aria-label={t.detail?.close ?? 'Close'}
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Left / Right Carousel Navigation Controls */}
              {popupImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPopupImgIdx((prev) => (prev === 0 ? popupImages.length - 1 : prev - 1));
                    }}
                    aria-label={t.detail?.prev ?? 'Previous photo'}
                    className="absolute start-2.5 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-text hover:bg-surface hover:scale-110 active:scale-95 transition-all shadow-md border border-border/60"
                  >
                    <ChevronLeft className="size-4 rtl-flip" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPopupImgIdx((prev) => (prev === popupImages.length - 1 ? 0 : prev + 1));
                    }}
                    aria-label={t.detail?.next ?? 'Next photo'}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 z-20 size-8 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-text hover:bg-surface hover:scale-110 active:scale-95 transition-all shadow-md border border-border/60"
                  >
                    <ChevronRight className="size-4 rtl-flip" />
                  </button>
                </>
              )}

              {/* Bottom Row on Preview Media: Pagination Dots & Floating "View More" Pill */}
              <div className="absolute bottom-2.5 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                {/* Pagination Dots */}
                {popupImages.length > 1 ? (
                  <div className="flex items-center gap-1 bg-black/45 backdrop-blur-xs px-2 py-1 rounded-full">
                    {popupImages.slice(0, 5).map((_, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          'h-1.5 rounded-full transition-all duration-300',
                          idx === popupImgIdx ? 'w-3.5 bg-white shadow-xs' : 'w-1.5 bg-white/60'
                        )}
                      />
                    ))}
                    {popupImages.length > 5 && (
                      <span className="text-[9.5px] font-bold text-white ps-0.5">
                        +{popupImages.length - 5}
                      </span>
                    )}
                  </div>
                ) : (
                  <div />
                )}

                {/* Floating "View More" button on the Preview Area */}
                <Link
                  href={`/properties/${activeProperty.slug}`}
                  className="pointer-events-auto flex items-center gap-1 px-3 py-1 rounded-full bg-surface/95 backdrop-blur-md text-text text-[11px] font-bold border border-border/80 shadow-md hover:bg-primaryColor hover:text-white hover:border-primaryColor transition-all group/vmore"
                >
                  <span>{t.card?.viewMore ?? 'View More'}</span>
                  <ArrowUpRight className="size-3 transition-transform group-hover/vmore:translate-x-0.5 group-hover/vmore:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <div className="font-display text-[19px] font-bold text-primaryColor tabular">
                  {activeProperty.price.toLocaleString('en-US')}{' '}
                  <span className="text-xs font-semibold text-text-muted">
                    {activeProperty.currency}{' '}
                    {activeProperty.purpose === 'RENT' ? (t.card?.perMonth ?? '/ mo') : ''}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs text-text-muted truncate max-w-[140px]">
                  <MapPin className="size-3 text-primaryColor shrink-0" />
                  <span className="truncate">
                    {lang === 'ar' ? activeProperty.area.nameAr : activeProperty.area.name}
                  </span>
                </span>
              </div>

              <h4 className="text-[14px] font-bold text-text line-clamp-1 mb-2">
                <Link
                  href={`/properties/${activeProperty.slug}`}
                  className="hover:text-primaryColor transition-colors"
                >
                  {pick(lang, activeProperty.title, activeProperty.titleAr)}
                </Link>
              </h4>

              {/* Specs Row */}
              <div className="flex items-center gap-3 text-xs text-text-muted pb-3 border-b border-border/80 mb-3">
                <span className="flex items-center gap-1">
                  <Bed className="size-3.5 text-primaryColor" />
                  <span className="tabular font-medium">{activeProperty.bedrooms}</span>{' '}
                  {t.card?.bd ?? 'bd'}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="size-3.5 text-primaryColor" />
                  <span className="tabular font-medium">{activeProperty.bathrooms}</span>{' '}
                  {t.card?.ba ?? 'ba'}
                </span>
                <span className="flex items-center gap-1">
                  <Maximize2 className="size-3.5 text-primaryColor" />
                  <span className="tabular font-medium">{activeProperty.builtUpArea}</span>{' '}
                  {t.card?.sqm ?? 'm²'}
                </span>
              </div>

              {/* Full-Page View Button */}
              <Link
                href={`/properties/${activeProperty.slug}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primaryColor text-white text-xs font-bold hover:bg-primaryColorHover transition-colors shadow-sm"
              >
                <span>{t.card?.fullDetails ?? 'View Full Details'}</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
