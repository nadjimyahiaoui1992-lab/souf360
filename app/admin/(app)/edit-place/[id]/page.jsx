"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PencilLine, X as XIcon, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { uploadPlaceImages, encodeImageUrls, decodeImageUrls } from "@/lib/placeImages";
import { useHasPermission } from "@/components/admin/AdminProvider";
import CoordinatesField from "@/components/admin/CoordinatesField";
import ImageUploader from "@/components/admin/ImageUploader";

const SELECTABLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== "الكل");

const EMPTY_FORM = {
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

export default function EditPlacePage() {
  const router = useRouter();
  const params = useParams();
  const placeId = params?.id;
  const canEditPlace = useHasPermission("add_place");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const [mapLink, setMapLink] = useState("");
  const [existingImages, setExistingImages] = useState([]); // روابط الصور الحالية
  const [newImages, setNewImages] = useState([]); // ملفات جديدة لم تُرفع بعد
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    if (!placeId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/admin/places/${placeId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "تعذّر تحميل بيانات المعلم.");
        }

        if (cancelled) return;

        const place = data.place;
        setForm({
          name: place.name || "",
          category: place.category || "",
          description: place.description || "",
          municipality: place.municipality || "",
          district: place.district || "",
          phone: place.phone || "",
          website: place.website || "",
          opening_hours: place.opening_hours || "",
          facebook: place.facebook || "",
          instagram: place.instagram || "",
        });
        setCoords({ lat: String(place.lat ?? ""), lng: String(place.lng ?? "") });
        setMapLink(place.map_link || "");
        setExistingImages(decodeImageUrls(place.image_url));
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "حدث خطأ غير متوقع.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [placeId]);

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

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

    if (!canEditPlace) {
      setFeedback({ type: "error", text: "ليست لديك صلاحية تعديل معالم." });
      return;
    }

    if (!validate()) return;

    setSubmitting(true);

    try {
      let uploadedUrls = [];
      if (newImages.length > 0) {
        setUploading(true);
        uploadedUrls = await uploadPlaceImages(newImages);
        setUploading(false);
      }

      const allImageUrls = [...existingImages, ...uploadedUrls];

      const res = await fetch(`/api/admin/places/${placeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: coords.lat,
          lng: coords.lng,
          map_link: mapLink || null,
          image_url: encodeImageUrls(allImageUrls),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذّر تحديث المعلم.");
      }

      setFeedback({ type: "success", text: `تم تحديث "${form.name}" بنجاح.` });
      setNewImages([]);
      setExistingImages(allImageUrls);

      setTimeout(() => router.push("/admin/dashboard"), 1200);
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "حدث خطأ غير متوقع." });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Alert type="error">{loadError}</Alert>
        <Button className="mt-4" onClick={() => router.push("/admin/dashboard")}>
          العودة للوحة التحكم
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20">
          <PencilLine size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-white sm:text-xl">تعديل معلم</h1>
          <p className="text-xs text-slate-400">
            حدّث بيانات المعلم ثم احفظ التغييرات.
          </p>
        </div>
      </header>

      {!canEditPlace && (
        <Alert type="warning" className="mb-5">
          حسابك لا يملك صلاحية تعديل المعالم. تواصل مع المدير لمنحك هذه الصلاحية.
        </Alert>
      )}

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/10 backdrop-blur-xl sm:p-6"
      >
        {/* البيانات الأساسية */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="اسم المعلم" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="مثال: واحة قمار"
              error={errors.name}
            />
          </Field>

          <Field label="التصنيف" required error={errors.category}>
            <Select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              error={errors.category}
            >
              <option value="">اختر تصنيفاً</option>
              {SELECTABLE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="البلدية">
            <Input
              value={form.municipality}
              onChange={(e) => setField("municipality", e.target.value)}
              placeholder="الوادي"
            />
          </Field>

          <Field label="الدائرة">
            <Input value={form.district} onChange={(e) => setField("district", e.target.value)} />
          </Field>
        </div>

        <Field label="نبذة عن المعلم">
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="وصف مختصر يبرز أهمية المعلم وما يميزه..."
          />
        </Field>

        {/* معلومات الاتصال */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="رقم الهاتف">
            <Input
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="+213 6XX XXX XXX"
            />
          </Field>
          <Field label="الموقع الإلكتروني" error={errors.website}>
            <Input
              dir="ltr"
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="https://example.com"
              error={errors.website}
            />
          </Field>
          <Field label="فيسبوك">
            <Input
              dir="ltr"
              value={form.facebook}
              onChange={(e) => setField("facebook", e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="إنستغرام">
            <Input
              dir="ltr"
              value={form.instagram}
              onChange={(e) => setField("instagram", e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="أوقات العمل" className="sm:col-span-2">
            <Input
              value={form.opening_hours}
              onChange={(e) => setField("opening_hours", e.target.value)}
              placeholder="يومياً من 8:00 صباحاً إلى 6:00 مساءً"
            />
          </Field>
        </div>

        {/* الإحداثيات */}
        <div className="border-t border-white/[0.06] pt-6">
          <h3 className="mb-3 text-sm font-bold text-slate-200">موقع المعلم *</h3>
          <CoordinatesField value={coords} onChange={setCoords} />
          {errors.coords && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-red-400">
              {errors.coords}
            </p>
          )}
          <Field label="رابط خرائط جوجل (اختياري، يُعرض للزوار)" className="mt-3">
            <Input
              dir="ltr"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </Field>
        </div>

        {/* الصور الحالية */}
        <div className="border-t border-white/[0.06] pt-6">
          <h3 className="mb-3 text-sm font-bold text-slate-200">الصور الحالية</h3>
          {existingImages.length === 0 ? (
            <p className="text-xs text-slate-500">لا توجد صور محفوظة لهذا المعلم.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {existingImages.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`صورة ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
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

        {/* إضافة صور جديدة */}
        <div className="border-t border-white/[0.06] pt-6">
          <h3 className="mb-3 text-sm font-bold text-slate-200">إضافة صور جديدة</h3>
          <ImageUploader value={newImages} onChange={setNewImages} uploading={uploading} />
        </div>

        {feedback && <Alert type={feedback.type}>{feedback.text}</Alert>}

        <Button
          type="submit"
          disabled={!canEditPlace}
          loading={submitting}
          className="w-full"
          size="lg"
        >
          {uploading ? "جارٍ رفع الصور..." : "حفظ التعديلات"}
        </Button>
      </motion.form>
    </div>
  );
}
