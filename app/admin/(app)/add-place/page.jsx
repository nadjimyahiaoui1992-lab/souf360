"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, PlusCircle } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { uploadPlaceImages, encodeImageUrls } from "@/lib/placeImages";
import { useHasPermission } from "@/components/admin/AdminProvider";
import CoordinatesField from "@/components/admin/CoordinatesField";
import ImageUploader from "@/components/admin/ImageUploader";

const SELECTABLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== "الكل");

const INITIAL_FORM = {
  name: "",
  category: "",
  description: "",
  municipality: "",
  district: "",
  phone: "",
  website: "",
  opening_hours: "",
  facebook: "",
  instagram: "",
};

export default function AddPlacePage() {
  const router = useRouter();
  const canAddPlace = useHasPermission("add_place");

  const [form, setForm] = useState(INITIAL_FORM);
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const [mapLink, setMapLink] = useState("");
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "اسم المعلم إلزامي.";
    if (!form.category) next.category = "الرجاء اختيار تصنيف.";
    if (!coords.lat || !coords.lng) {
      next.coords = "حدّد إحداثيات الموقع بإحدى الطرق المتاحة.";
    } else {
      const latNum = Number(coords.lat);
      const lngNum = Number(coords.lng);
      if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
        next.coords = "قيمة خط العرض غير صالحة (يجب أن تكون بين 90- و90).";
      } else if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
        next.coords = "قيمة خط الطول غير صالحة (يجب أن تكون بين 180- و180).";
      }
    }
    if (form.website && !/^https?:\/\/.+/i.test(form.website)) {
      next.website = "رابط الموقع يجب أن يبدأ بـ http:// أو https://";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!canAddPlace) {
      setFeedback({ type: "error", text: "ليست لديك صلاحية إضافة معالم." });
      return;
    }

    if (!validate()) return;

    setSubmitting(true);

    try {
      let imageUrls = [];
      if (images.length > 0) {
        setUploading(true);
        imageUrls = await uploadPlaceImages(images);
        setUploading(false);
      }

      const res = await fetch("/api/admin/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: coords.lat,
          lng: coords.lng,
          map_link: mapLink || null,
          image_url: encodeImageUrls(imageUrls),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذّرت إضافة المعلم.");
      }

      setFeedback({ type: "success", text: `تم نشر "${form.name}" بنجاح.` });
      setForm(INITIAL_FORM);
      setCoords({ lat: "", lng: "" });
      setMapLink("");
      setImages([]);

      setTimeout(() => router.push("/admin/dashboard"), 1200);
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "حدث خطأ غير متوقع." });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <PlusCircle size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-800 sm:text-xl">إضافة معلم جديد</h1>
          <p className="text-xs text-gray-400">
            املأ البيانات التالية لنشر معلم سياحي جديد على المنصة.
          </p>
        </div>
      </header>

      {!canAddPlace && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3.5 text-xs font-bold text-amber-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          حسابك لا يملك صلاحية إضافة المعالم. تواصل مع المدير لمنحك هذه الصلاحية.
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm sm:p-6"
      >
        {/* البيانات الأساسية */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              اسم المعلم *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="مثال: واحة قمار"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              التصنيف *
            </label>
            <select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.category ? "border-red-300" : "border-gray-200"
              }`}
            >
              <option value="">اختر تصنيفاً</option>
              {SELECTABLE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-[11px] text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">البلدية</label>
            <input
              type="text"
              value={form.municipality}
              onChange={(e) => setField("municipality", e.target.value)}
              placeholder="الوادي"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">الدائرة</label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setField("district", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">نبذة عن المعلم</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="وصف مختصر يبرز أهمية المعلم وما يميزه..."
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* معلومات الاتصال */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">رقم الهاتف</label>
            <input
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="+213 6XX XXX XXX"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">الموقع الإلكتروني</label>
            <input
              type="text"
              dir="ltr"
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="https://example.com"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.website ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.website && (
              <p className="mt-1 text-[11px] text-red-500">{errors.website}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">فيسبوك</label>
            <input
              type="text"
              dir="ltr"
              value={form.facebook}
              onChange={(e) => setField("facebook", e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">إنستغرام</label>
            <input
              type="text"
              dir="ltr"
              value={form.instagram}
              onChange={(e) => setField("instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-gray-600">أوقات العمل</label>
            <input
              type="text"
              value={form.opening_hours}
              onChange={(e) => setField("opening_hours", e.target.value)}
              placeholder="يومياً من 8:00 صباحاً إلى 6:00 مساءً"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* الإحداثيات */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-3 text-sm font-bold text-gray-700">موقع المعلم *</h3>
          <CoordinatesField value={coords} onChange={setCoords} />
          {errors.coords && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-red-500">
              <AlertCircle size={12} />
              {errors.coords}
            </p>
          )}
          <div className="mt-3">
            <label className="mb-1 block text-xs font-bold text-gray-600">
              رابط خرائط جوجل (اختياري، يُعرض للزوار)
            </label>
            <input
              type="text"
              dir="ltr"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* الصور */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-3 text-sm font-bold text-gray-700">ألبوم الصور</h3>
          <ImageUploader value={images} onChange={setImages} uploading={uploading} />
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={15} />
            ) : (
              <AlertCircle size={15} />
            )}
            {feedback.text}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !canAddPlace}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {uploading ? "جارٍ رفع الصور..." : "نشر المعلم"}
        </button>
      </motion.form>
    </div>
  );
}
