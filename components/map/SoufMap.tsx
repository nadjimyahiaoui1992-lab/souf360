"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Navigation, Compass, AlertTriangle, PhoneCall, X, Play, Clock, MapPin, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Place } from '@/data/places';
import { RouteInfo } from './Map';

const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 w-full flex items-center justify-center bg-[#0f172a]">
      <div className="text-center space-y-3 p-4">
        <Compass className="mx-auto text-amber-400 animate-spin-slow" size={40} />
        <h3 className="text-sm font-bold text-white">جاري تحميل خريطة سوف 360 التفاعلية...</h3>
      </div>
    </div>
  )
});

export default function SoufMap({ places, initialDestinationQuery }: { places: Place[]; initialDestinationQuery?: string | null }) {
  const [activeMapType, setActiveMapType] = useState<'standard' | 'satellite'>('standard');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialDestinationQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeTarget, setRouteTarget] = useState<Place | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // مثبّتة بـ useCallback حتى لا تتغيّر مرجعيتها في كل تصيير،
  // لأن Map.tsx يعتمد عليها كـ dependency في useEffect الخاص بحساب المسار.
  // بدون هذا التثبيت يدخل التطبيق في حلقة إعادة حساب لا نهائية ويبقى عالقاً على "جاري الحساب".
  const handleRouteInfoCalculated = useCallback((info: RouteInfo | null) => {
    setRouteInfo(info);
  }, []);

  const handleRouteStatusChange = useCallback(({ loading, error }: { loading: boolean; error: string | null }) => {
    setIsRouteLoading(loading);
    setRouteError(error);
  }, []);

  const categories = [
    { id: null, label: "الكل" },
    { id: "فنادق وإقامة", label: "الفنادق" },
    { id: "مرافق صحية", label: "المرافق الصحية" },
    { id: "أسواق ومتاجر", label: "أسواق" },
    { id: "تاريخ وثقافة", label: "تاريخ وثقافة" }
  ];

  const filteredPlaces = (places || []).filter(place => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      place.name.toLowerCase().includes(q) ||
      place.municipality.toLowerCase().includes(q);
    const matchesCategory = selectedCategory ? place.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    let watchId: number | null = null;
    if (isNavigating && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.error("خطأ في التتبع الحي:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationError("متصفحك لا يدعم تحديد الموقع الجغرافي.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationError(null);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocationError("تعذّر الوصول لموقعك، تأكد من تفعيل خدمة الموقع GPS.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleRequestRoute = (place: Place) => {
    setIsNavigating(false);
    setRouteError(null);
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationError(null);
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setRouteTarget(place);
          setSelectedPlace(place);
        },
        () => {
          setLocationError("تعذّر تحديد موقعك تلقائياً، تم استخدام موقع افتراضي بولاية الوادي.");
          setUserLocation({ lat: 33.3683, lng: 6.8667 });
          setRouteTarget(place);
          setSelectedPlace(place);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setRouteTarget(place);
      setSelectedPlace(place);
    }
  };

  const handleCloseRoute = () => {
    setRouteTarget(null);
    setRouteInfo(null);
    setIsNavigating(false);
    setRouteError(null);
  };

  return (
    <div className="relative w-full h-[calc(100vh-60px)] min-h-[500px] flex flex-col bg-[#0f172a] text-white overflow-hidden">

      {/* 1. الشريط العلوي الاحترافي */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
          <a href="/" className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
            الرئيسية ←
          </a>
        </div>

        <div className="pointer-events-auto">
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all animate-pulse"
          >
            <AlertTriangle size={15} />
            <span>الطوارئ والخدمات</span>
          </button>
        </div>
      </div>

      {/* 2. شريط البحث والتصنيفات */}
      <div className="absolute top-16 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto relative w-full md:max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
          <input
            type="text"
            placeholder="ابحث في معالم وادي سوف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/95 backdrop-blur-md text-white text-xs pr-9 pl-3 py-2.5 rounded-xl border border-white/15 shadow-xl focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="pointer-events-auto flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all shadow-md ${selectedCategory === cat.id ? 'bg-amber-600 text-white' : 'bg-slate-900/80 text-gray-300 border border-white/10 hover:bg-slate-800'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* رسالة خطأ تحديد الموقع */}
      {locationError && (
        <div className="absolute top-[9.5rem] left-3 right-3 z-[1000] pointer-events-auto">
          <div className="bg-rose-950/95 backdrop-blur-md border border-rose-500/40 text-rose-200 text-[11px] font-bold px-3.5 py-2.5 rounded-xl shadow-xl flex items-center justify-between gap-2 max-w-sm">
            <span>{locationError}</span>
            <button onClick={() => setLocationError(null)} className="shrink-0 text-rose-300 hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 3. نافذة معلومات المسار وزر بدء الرحلة والتوجيه الخارجي عبر الطرق */}
      {routeTarget && (
        <div className="absolute top-36 left-3 right-3 md:left-auto md:right-3 z-[1000] bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-sky-500/40 shadow-2xl flex flex-col gap-3 pointer-events-auto max-w-sm">

          {/* حالة التحميل */}
          {isRouteLoading && (
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
              <Loader2 size={16} className="animate-spin" />
              <span>جاري حساب المسار الأدق عبر الطرق...</span>
            </div>
          )}

          {/* حالة الخطأ */}
          {!isRouteLoading && routeError && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
              <AlertTriangle size={16} />
              <span>{routeError}</span>
            </div>
          )}

          {/* بيانات المسار الناجحة */}
          {!isRouteLoading && !routeError && routeInfo && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-600/20 text-sky-400 rounded-xl">
                  <Navigation size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[160px]">{routeTarget.name}</div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-300 mt-0.5">
                    <span className="flex items-center gap-1 font-bold text-amber-400"><MapPin size={12}/> {routeInfo.distanceKm} كم</span>
                    <span className="flex items-center gap-1 font-bold text-emerald-400"><Clock size={12}/> {routeInfo.durationMin} دقيقة</span>
                  </div>
                  {routeInfo.estimated && (
                    <div className="text-[10px] text-amber-300/80 mt-1">مسار تقديري (خط مباشر) — قد يختلف قليلاً عن الطريق الفعلي</div>
                  )}
                </div>
              </div>
              <button
                onClick={handleCloseRoute}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {(isRouteLoading || routeError) && (
            <button
              onClick={handleCloseRoute}
              className="self-end p-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl -mt-1"
            >
              <X size={16} />
            </button>
          )}

          {/* زر بدء الرحلة (تتبع حي داخل الموقع بالكامل) */}
          {!isRouteLoading && !routeError && routeInfo && (
            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
              <button
                onClick={() => setIsNavigating(!isNavigating)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold shadow-lg transition-all ${isNavigating ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                <Play size={13} />
                <span>{isNavigating ? 'إيقاف التتبع' : 'بدء الرحلة'}</span>
              </button>
            </div>
          )}

          {/* إعادة محاولة عند انقطاع الاتصال بالكامل (لا إنترنت) */}
          {!isRouteLoading && routeError && (
            <button
              onClick={() => routeTarget && handleRequestRoute(routeTarget)}
              className="flex items-center justify-center gap-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
            >
              <Navigation size={13} />
              <span>إعادة المحاولة</span>
            </button>
          )}
        </div>
      )}

      {/* 4. أزرار التحكم الجانبية */}
      <div className={`absolute ${routeTarget ? 'top-60 md:top-36' : 'top-36'} right-3 z-[1000] flex flex-col gap-2 pointer-events-auto transition-all`}>
        <div className="flex flex-col bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
          <button
            onClick={() => setActiveMapType('standard')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeMapType === 'standard' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:text-white'}`}
          >
            القياسية
          </button>
          <button
            onClick={() => setActiveMapType('satellite')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeMapType === 'satellite' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:text-white'}`}
          >
            الأقمار
          </button>
        </div>

        <button
          onClick={handleLocateUser}
          className="flex items-center justify-center p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-all"
          title="تحديد موقعي"
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* 5. الخريطة التفاعلية */}
      <div className="flex-1 w-full relative z-0 mt-20">
        <DynamicMap
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
          mapType={activeMapType}
          userLocation={userLocation}
          routeTarget={routeTarget}
          onRequestRoute={handleRequestRoute}
          onRouteInfoCalculated={handleRouteInfoCalculated}
          onRouteStatusChange={handleRouteStatusChange}
          isNavigating={isNavigating}
        />
      </div>

      {/* 6. الشريط السفلي للمعالم */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex gap-2.5 overflow-x-auto pb-1 pointer-events-auto no-scrollbar">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            onClick={() => setSelectedPlace(place)}
            className="min-w-[190px] max-w-[210px] bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-2xl cursor-pointer hover:border-amber-500 transition-all shrink-0"
          >
            <div className="text-[10px] text-amber-400 font-bold uppercase truncate">{place.category}</div>
            <div className="text-xs font-bold text-white truncate mt-0.5">{place.name}</div>
            <div className="text-[10px] text-gray-300 truncate mt-0.5">{place.municipality}</div>
          </div>
        ))}
        {filteredPlaces.length === 0 && (
          <div className="min-w-[220px] bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-2xl text-center text-[11px] text-gray-400 shrink-0">
            لا توجد نتائج مطابقة للبحث الحالي
          </div>
        )}
      </div>

      {/* نافذة الطوارئ */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 text-rose-500">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-base text-white">أرقام الطوارئ والخدمات</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <a href="tel:14" className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-rose-900/40 border border-white/5 transition-all">
                <span className="font-bold text-white">الحماية المدنية</span>
                <span className="flex items-center gap-1 bg-rose-600 text-white px-2.5 py-1 rounded-lg font-bold"><PhoneCall size={12}/> 14</span>
              </a>

              <a href="tel:1548" className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-rose-900/40 border border-white/5 transition-all">
                <span className="font-bold text-white">الشرطة (الأمن الوطني)</span>
                <span className="flex items-center gap-1 bg-rose-600 text-white px-2.5 py-1 rounded-lg font-bold"><PhoneCall size={12}/> 1548</span>
              </a>

              <a href="tel:1021" className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-rose-900/40 border border-white/5 transition-all">
                <span className="font-bold text-white">الدرك الوطني</span>
                <span className="flex items-center gap-1 bg-rose-600 text-white px-2.5 py-1 rounded-lg font-bold"><PhoneCall size={12}/> 1021</span>
              </a>
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="mt-5 w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

    </div>
  );
}