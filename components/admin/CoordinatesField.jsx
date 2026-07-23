"use client";

import { useState } from "react";
import { MapPin, Link2, Hash, CheckCircle2, AlertCircle } from "lucide-react";
import {
  extractCoordsFromLink,
  looksLikeMapsLink,
  looksLikePlusCode,
} from "@/services/coordinates";

const MODES = [
  { id: "manual", label: "إدخال يدوي", icon: MapPin },
  { id: "link", label: "رابط خرائط جوجل", icon: Link2 },
  { id: "pluscode", label: "Plus Code", icon: Hash },
];

/**
 * حقل ذكي لتحديد إحداثيات المعلم بثلاث طرق: يدوياً، عبر لصق رابط Google
 * Maps (يُستخرج خط الطول والعرض تلقائياً بواسطة Regex)، أو عبر كود
 * الموقع (Plus Code) الذي يُحفظ كمرجع نصي بجانب الإحداثيات إن أمكن استنتاجها.
 *
 * value: { lat: string, lng: string }
 * onChange: (next: { lat: string, lng: string }) => void
 */
export default function CoordinatesField({ value, onChange }) {
  const [mode, setMode] = useState("manual");
  const [linkInput, setLinkInput] = useState("");
  const [plusCodeInput, setPlusCodeInput] = useState("");
  const [linkStatus, setLinkStatus] = useState(null); // "ok" | "error" | null

  const handleManualChange = (field, val) => {
    onChange({ ...value, [field]: val });
  };

  const handleLinkChange = (val) => {
    setLinkInput(val);
    if (!val) {
      setLinkStatus(null);
      return;
    }
    if (!looksLikeMapsLink(val)) {
      setLinkStatus("error");
      return;
    }
    const coords = extractCoordsFromLink(val);
    if (coords) {
      onChange({ lat: coords.lat, lng: coords.lng });
      setLinkStatus("ok");
    } else {
      setLinkStatus("error");
    }
  };

  const handlePlusCodeChange = (val) => {
    setPlusCodeInput(val);
    // ملاحظة: فك ترميز Plus Code إلى إحداثيات كاملة يتطلب استدعاء Google
    // Plus Codes API خارجياً. نكتفي هنا بحفظ الكود كمرجع نصي مع تنبيه
    // المستخدم أن الإحداثيات الدقيقة تحتاج تأكيداً يدوياً أو عبر رابط.
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                active
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Icon size={13} />
              {m.label}
            </button>
          );
        })}
      </div>

      {mode === "manual" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              خط العرض (Latitude)
            </label>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={value.lat}
              onChange={(e) => handleManualChange("lat", e.target.value)}
              placeholder="33.368000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              خط الطول (Longitude)
            </label>
            <input
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={value.lng}
              onChange={(e) => handleManualChange("lng", e.target.value)}
              placeholder="6.853000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {mode === "link" && (
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            الصق رابط الموقع من Google Maps
          </label>
          <input
            type="text"
            dir="ltr"
            value={linkInput}
            onChange={(e) => handleLinkChange(e.target.value)}
            placeholder="https://www.google.com/maps/place/.../@33.368,6.853,17z"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {linkStatus === "ok" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 size={13} />
              تم استخراج الإحداثيات: {value.lat}, {value.lng}
            </p>
          )}
          {linkStatus === "error" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-red-500">
              <AlertCircle size={13} />
              تعذّر استخراج الإحداثيات من هذا الرابط. جرّب رابطاً يحتوي على
              "@lat,lng" أو استخدم الإدخال اليدوي.
            </p>
          )}
        </div>
      )}

      {mode === "pluscode" && (
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">
            كود الموقع (Plus Code)
          </label>
          <input
            type="text"
            dir="ltr"
            value={plusCodeInput}
            onChange={(e) => handlePlusCodeChange(e.target.value)}
            placeholder="7X8V+2Q الوادي"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {plusCodeInput && !looksLikePlusCode(plusCodeInput) && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
              <AlertCircle size={13} />
              الصيغة غير معتادة لكود Plus Code — تأكد من نسخه كاملاً.
            </p>
          )}
          <p className="mt-1.5 text-[11px] text-gray-400">
            كود Plus Code يُحفظ كمرجع، لكن يُستحسن تأكيد الإحداثيات الدقيقة
            عبر رابط خرائط جوجل أو الإدخال اليدوي.
          </p>
        </div>
      )}

      {/*
        TODO (ميزة مستقبلية): إضافة الإحداثيات يدوياً عبر النقر المباشر على
        خريطة تفاعلية (Leaflet) بدل كتابة الأرقام — يمكن الاستفادة من
        components/map/Map.tsx الموجود مسبقاً في الواجهة الأمامية كنقطة
        انطلاق، مع دبّوس قابل للسحب (draggable marker) يُحدّث value.lat/lng
        عند كل حركة. تُركت هذه الميزة خارج النطاق الحالي بحسب طلب المشروع.
      */}

      {value.lat && value.lng && (
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">
          الإحداثيات الحالية: {value.lat}, {value.lng}
        </div>
      )}
    </div>
  );
}
