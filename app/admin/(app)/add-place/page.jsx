"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { uploadPlaceImages, encodeImageUrls } from "@/services/places";
import { useHasPermission } from "@/components/admin/AdminProvider";
import PlaceForm, { EMPTY_PLACE_FORM, validatePlaceForm } from "@/components/admin/PlaceForm";

export default function AddPlacePage() {
  const router = useRouter();
  const canAddPlace = useHasPermission("add_place");

  const [form, setForm] = useState(EMPTY_PLACE_FORM);
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const [mapLink, setMapLink] = useState("");
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!canAddPlace) {
      setFeedback({ type: "error", text: "ليست لديك صلاحية إضافة معالم." });
      return;
    }

    const validationErrors = validatePlaceForm(form, coords);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

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
      setForm(EMPTY_PLACE_FORM);
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

      <PlaceForm
        mode="create"
        canSubmit={canAddPlace}
        permissionDeniedMessage="حسابك لا يملك صلاحية إضافة المعالم. تواصل مع المدير لمنحك هذه الصلاحية."
        form={form}
        setField={setField}
        coords={coords}
        setCoords={setCoords}
        mapLink={mapLink}
        setMapLink={setMapLink}
        images={images}
        setImages={setImages}
        errors={errors}
        submitting={submitting}
        uploading={uploading}
        feedback={feedback}
        onSubmit={handleSubmit}
        submitLabel="نشر المعلم"
      />
    </div>
  );
}
