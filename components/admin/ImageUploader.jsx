"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Camera, ImagePlus, X, Loader2 } from "lucide-react";

/**
 * ألبوم صور المعلم: يدعم السحب والإفلات، الاختيار من التخزين، والتقاط
 * صورة مباشرة من كاميرا الهاتف (عبر خاصية capture في input الملفات).
 *
 * value: File[] — الملفات المختارة (لم تُرفع بعد)
 * onChange: (files: File[]) => void
 * uploading: boolean — تعطيل التفاعل أثناء الرفع الفعلي
 */
export default function ImageUploader({ value = [], onChange, uploading = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (incoming.length === 0) return;
      onChange([...value, ...incoming]);
    },
    [value, onChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeAt = (index) => {
    const next = value.slice();
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <UploadCloud size={26} className="text-gray-400" />
        <p className="text-xs font-bold text-gray-600">
          اسحب وأفلت الصور هنا، أو استخدم الأزرار أدناه
        </p>
        <p className="text-[11px] text-gray-400">JPG, PNG — يمكن اختيار عدة صور دفعة واحدة</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-100 disabled:opacity-60"
          >
            <ImagePlus size={14} />
            اختيار من المعرض
          </button>

          <button
            type="button"
            disabled={uploading}
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            <Camera size={14} />
            التقاط بالكاميرا
          </button>
        </div>

        {/* اختيار متعدد من مساحة التخزين */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {/* فتح الكاميرا مباشرة عبر capture (يعمل على متصفحات الهواتف) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`صورة ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 size={16} className="animate-spin text-white" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  aria-label="حذف الصورة"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
