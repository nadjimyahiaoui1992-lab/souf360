'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Place } from '@/data/places';

const getCategoryIcon = (category: string) => {
  let emoji = '🏛️';
  let bgColor = '#d97706';

  if (category.includes('فنادق')) {
    emoji = '🏨';
    bgColor = '#2563eb';
  } else if (category.includes('صحي')) {
    emoji = '🏥';
    bgColor = '#dc2626';
  } else if (category.includes('أسواق')) {
    emoji = '🛍️';
    bgColor = '#16a34a';
  } else if (category.includes('تاريخ') || category.includes('ثقافة')) {
    emoji = '🕌';
    bgColor = '#9333ea';
  }

  return L.divIcon({
    className: 'custom-pin-icon',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:${bgColor};border:2.5px solid white;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.3);font-size:16px;">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

const visitorIcon = L.divIcon({
  className: 'custom-visitor-icon',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;background:#0ea5e9;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(14,165,233,0.4);font-size:18px;">👤</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

function ChangeView({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(container);
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [map]);
  return null;
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  estimated?: boolean;
}

interface MapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  mapType?: 'standard' | 'satellite';
  userLocation?: { lat: number; lng: number } | null;
  routeTarget?: Place | null;
  onRequestRoute?: (place: Place) => void;
  onRouteInfoCalculated?: (info: RouteInfo | null) => void;
  onRouteStatusChange?: (status: { loading: boolean; error: string | null }) => void;
  isNavigating?: boolean;
}

export default function Map({
  places,
  selectedPlace,
  onSelectPlace,
  mapType = 'standard',
  userLocation = null,
  routeTarget = null,
  onRequestRoute,
  onRouteInfoCalculated,
  onRouteStatusChange,
  isNavigating = false,
}: MapProps) {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  const defaultCenter: [number, number] = selectedPlace
    ? [selectedPlace.lat, selectedPlace.lng]
    : [33.3683, 6.8667];

  const tileUrl =
    mapType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution =
    mapType === 'satellite'
      ? '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  // حساب مسار حقيقي عبر الشوارع (يتبع الطرق الرئيسية والفرعية فعلياً) مع تبديل تلقائي بين الخوادم عند الفشل
  useEffect(() => {
    let cancelled = false;

    async function fetchRoute() {
      if (!userLocation || !routeTarget) {
        setRouteCoordinates([]);
        if (onRouteInfoCalculated) onRouteInfoCalculated(null);
        if (onRouteStatusChange) onRouteStatusChange({ loading: false, error: null });
        return;
      }

      if (onRouteStatusChange) onRouteStatusChange({ loading: true, error: null });

      try {
        const params = new URLSearchParams({
          originLat: String(userLocation.lat),
          originLng: String(userLocation.lng),
          destLat: String(routeTarget.lat),
          destLng: String(routeTarget.lng),
        });
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`/api/route?${params.toString()}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        setRouteCoordinates(data.coordinates as [number, number][]);

        if (onRouteInfoCalculated) {
          onRouteInfoCalculated({
            distanceKm: data.distanceKm,
            durationMin: data.durationMin,
            estimated: !!data.estimated,
          });
        }
        if (onRouteStatusChange) onRouteStatusChange({ loading: false, error: null });
      } catch (err) {
        console.error('تعذّر الوصول لخدمة حساب المسار الداخلية:', err);
        if (!cancelled) {
          setRouteCoordinates([]);
          if (onRouteInfoCalculated) onRouteInfoCalculated(null);
          if (onRouteStatusChange) {
            onRouteStatusChange({
              loading: false,
              error: 'تحقّق من اتصالك بالإنترنت وحاول مجدداً.',
            });
          }
        }
      }
    }

    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [userLocation, routeTarget, onRouteInfoCalculated, onRouteStatusChange]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={isNavigating ? 17 : 13}
      className="soufmap-container"
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer key={mapType} attribution={tileAttribution} url={tileUrl} />

      <ResizeHandler />

      {selectedPlace && (
        <ChangeView center={[selectedPlace.lat, selectedPlace.lng]} zoom={isNavigating ? 18 : 16} />
      )}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={visitorIcon}>
          <Popup className="soufmap-popup">
            <div className="text-right font-sans text-xs p-1" dir="rtl">
              <span className="font-bold text-sky-600">👤 موقعك الحالي (الزائر)</span>
            </div>
          </Popup>
        </Marker>
      )}

      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{ color: '#0ea5e9', weight: 6, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }}
        />
      )}

      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={getCategoryIcon(place.category)}
          eventHandlers={{
            click: () => onSelectPlace(place),
          }}
        >
          <Popup minWidth={220} maxWidth={260} className="soufmap-popup">
            <div className="text-right font-sans w-full" dir="rtl">
              <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-200 mb-2">
                {place.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    لا توجد صورة
                  </div>
                )}
              </div>
              <h3 className="font-bold text-sm text-gray-800">{place.name}</h3>
              {place.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {place.description}
                </p>
              )}
              <div className="mt-1 text-emerald-600 font-bold text-[11px]">
                {place.category} {place.municipality ? `· ${place.municipality}` : ''}
              </div>
              <button
                onClick={() => onRequestRoute && onRequestRoute(place)}
                className="mt-2 w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              >
                عرض المسار الدقيق 🧭
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}