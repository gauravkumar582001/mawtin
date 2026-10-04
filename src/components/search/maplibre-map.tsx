'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bed, Bath, Maximize2, MapPin, Compass, Navigation } from 'lucide-react';
import type { Map as MapLibreMapInstance, Marker, Popup } from 'maplibre-gl';
import type { Area, PropertyCard, PropertyDetail } from '@/lib/types';
import { useI18n } from '@/i18n/client';
import { pick } from '@/lib/utils';

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapTheme, setMapTheme] = useState<'positron' | 'liberty'>('positron');

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
      {activeProperty && (
        <div
          className="absolute bottom-4 end-4 z-20 w-[300px] sm:w-[320px] rounded-[20px] border border-line bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-label={pick(lang, activeProperty.title, activeProperty.titleAr)}
        >
          {/* Card Media Header */}
          <div className="relative aspect-video w-full overflow-hidden bg-sand-2">
            {activeProperty.images?.[0]?.url ? (
              <img
                src={activeProperty.images[0].url}
                alt={pick(lang, activeProperty.title, activeProperty.titleAr)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-teal-soft/30 flex items-center justify-center text-muted">
                <MapPin className="size-8 text-primaryColor opacity-40" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primaryColor text-white shadow-xs">
                {activeProperty.purpose === 'RENT'
                  ? lang === 'ar'
                    ? 'للإيجار'
                    : 'Rent'
                  : lang === 'ar'
                  ? 'للبيع'
                  : 'Sale'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface/90 backdrop-blur-sm text-text border border-line shadow-xs">
                {t.typeOne?.[activeProperty.type] ?? activeProperty.type}
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setActiveProperty(null);
                document.querySelectorAll('.velra-map-marker').forEach((m) => m.classList.remove('active'));
              }}
              className="absolute top-2.5 end-2.5 size-7 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-text hover:bg-surface hover:scale-105 transition-all shadow-md"
              aria-label={t.detail?.close ?? 'Close'}
            >
              ✕
            </button>
          </div>

          {/* Card Body */}
          <div className="p-4">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <div className="font-display text-[18px] font-bold text-primaryColor tabular">
                {activeProperty.price.toLocaleString('en-US')}{' '}
                <span className="text-xs font-semibold text-text-muted">
                  {activeProperty.currency}{' '}
                  {activeProperty.purpose === 'RENT' ? (t.card?.perMonth ?? '/ mo') : ''}
                </span>
              </div>
            </div>

            <h4 className="text-[14px] font-semibold text-text line-clamp-1 mb-2">
              {pick(lang, activeProperty.title, activeProperty.titleAr)}
            </h4>

            {/* Specs Row */}
            <div className="flex items-center gap-3 text-xs text-text-muted pb-3 border-b border-line mb-3">
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

            {/* Location & View Button */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-xs text-text-muted truncate">
                <MapPin className="size-3 text-primaryColor shrink-0" />
                <span className="truncate">
                  {lang === 'ar' ? activeProperty.area.nameAr : activeProperty.area.name}
                </span>
              </span>
              <Link
                href={`/properties/${activeProperty.slug}`}
                className="shrink-0 px-3.5 py-1.5 rounded-full bg-primaryColor text-white text-xs font-semibold hover:bg-primaryColorHover transition-colors shadow-xs"
              >
                {lang === 'ar' ? 'عرض التفاصيل' : 'View home'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
