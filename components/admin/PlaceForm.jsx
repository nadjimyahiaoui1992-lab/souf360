"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, X as XIcon } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";
import CoordinatesField from "@/components/admin/CoordinatesField";
import ImageUploader from "@/components/admin/ImageUploader";

const SELECTABLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== "الكل");

export const EMPTY_PLACE_FORM = {
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

/** يتحقق من صحة بيانات الفورم قبل الإرسال (تُستخدم أيضاً كمرجع للتحقق في الخادم). */
export function validatePlaceForm(form, coords) {
  const errors = {};
  if (!form.name.trim()) errors.name = "اسم المعلم إلزامي.";
  if (!form.category) errors.category = "الرجاء اختيار تصنيف.";

  if (!coords.lat || !coords.lng) {
    errors.coords = "حدّد إحداثيات الموقع بإحدى الطرق المتاحة.";
  } else {
    const latNum = Number(coords.lat);
    const lngNum = Number(coords.lng);
    if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
      errors.coords = "قيمة خط العرض غير صالحة (يجب أن تكون بين 90- و90).";
    } else if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
      errors.coords = "قيمة خط الطول غير صالحة (يجب أن تكون بين 180- و180).";
    }
  }

  if (form.website && !/^https?:\/\/.+/i.test(form.website)) {
    errors.website = "رابط الموقع يجب أن يبدأ بـ http:// أو https://";
  }

  return errors;
}

/**
 * فورم مشترك لإضافة وتعديل معلم سياحي.
 * كانت هذه الشيفرة مكررة بالكامل بين صفحتي add-place و edit-place (حوالي
 * 330 سطر متطابقة تقريباً) — أصبحت الآن مكوّناً واحداً يقبل الفروقات
 * القليلة الفعلية (الصور الحالية القابلة للحذف في وضع التعديل) كخصائص.
 */
export default function PlaceForm({
  mode, // "create" | "edit"
  canSubmit,
  permissionDeniedMessage,
  form,
  setField,
  coords,
  setCoords,
  mapLink,
  setMapLink,
  images,
  setImages,
  existingImages,
  onRemoveExistingImage,
  errors,
  submitting,
  uploading,
  feedback,
  onSubmit,
  submitLabel,
  uploadingLabel = "جارٍ رفع الصور...",
}) {
  const isEdit = mode === "edit";

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm sm:p-6"
    >
      {!canSubmit && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3.5 text-xs font-bold text-amber-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {permissionDeniedMessage}
        </div>
      )}

      {/* البيانات الأساسية */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-600">اسم المعلم *</label>
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
          <label className="mb-1 block text-xs font-bold text-gray-600">التصنيف *</label>
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
          {errors.category && <p className="mt-1 text-[11px] text-red-500">{errors.category}</p>}
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
          {errors.website && <p className="mt-1 text-[11px] text-red-500">{errors.website}</p>}
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

      {/* الصور الحالية (وضع التعديل فقط) */}
      {isEdit && (
        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-3 text-sm font-bold text-gray-700">الصور الحالية</h3>
          {existingImages.length === 0 ? (
            <p className="text-xs text-gray-400">لا توجد صور محفوظة لهذا المعلم.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {existingImages.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`صورة ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemoveExistingImage(index)}
                    className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                    aria-label="حذف الصورة"
                  >
                    <XIcon size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* الصور */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">
          {isEdit ? "إضافة صور جديدة" : "ألبوم الصور"}
        </h3>
        <ImageUploader value={images} onChange={setImages} uploading={uploading} />
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${
            feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {feedback.text}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {uploading ? uploadingLabel : submitLabel}
      </button>
    </motion.form>
  );
}
