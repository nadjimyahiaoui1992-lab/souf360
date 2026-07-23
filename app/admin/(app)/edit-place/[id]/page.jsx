"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PencilLine, Loader2, AlertCircle } from "lucide-react";
import { uploadPlaceImages, encodeImageUrls, decodeImageUrls } from "@/services/places";
import { useHasPermission } from "@/components/admin/AdminProvider";
import PlaceForm, { EMPTY_PLACE_FORM, validatePlaceForm } from "@/components/admin/PlaceForm";

export default function EditPlacePage() {
  const router = useRouter();
  const params = useParams();
  const placeId = params?.id;
  const canEditPlace = useHasPermission("add_place");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [form, setForm] = useState(EMPTY_PLACE_FORM);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!canEditPlace) {
      setFeedback({ type: "error", text: "ليست لديك صلاحية تعديل معالم." });
      return;
    }

    const validationErrors = validatePlaceForm(form, coords);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

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
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-xs font-bold text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {loadError}
        </div>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          العودة للوحة التحكم
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <PencilLine size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-800 sm:text-xl">تعديل معلم</h1>
          <p className="text-xs text-gray-400">حدّث بيانات المعلم ثم احفظ التغييرات.</p>
        </div>
      </header>

      <PlaceForm
        mode="edit"
        canSubmit={canEditPlace}
        permissionDeniedMessage="حسابك لا يملك صلاحية تعديل المعالم. تواصل مع المدير لمنحك هذه الصلاحية."
        form={form}
        setField={setField}
        coords={coords}
        setCoords={setCoords}
        mapLink={mapLink}
        setMapLink={setMapLink}
        images={newImages}
        setImages={setNewImages}
        existingImages={existingImages}
        onRemoveExistingImage={removeExistingImage}
        errors={errors}
        submitting={submitting}
        uploading={uploading}
        feedback={feedback}
        onSubmit={handleSubmit}
        submitLabel="حفظ التعديلات"
      />
    </div>
  );
}
