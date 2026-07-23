"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Loader2, AlertTriangle } from "lucide-react";
import { updateMaintenanceMode } from "@/services/site-settings";

export default function MaintenanceCard({ settings, role, onUpdated, settingsError }) {
  const [enabled, setEnabled] = useState(settings?.maintenance_mode ?? false);
  const [message, setMessage] = useState(settings?.maintenance_message ?? "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const canEdit = role === "admin";

  const handleToggle = async () => {
    if (!canEdit || saving) return;
    const next = !enabled;
    setSaving(true);
    setFeedback(null);

    const { settings: updated, error } = await updateMaintenanceMode(next, message);

    if (error) {
      setFeedback({ type: "error", text: "تعذّر تحديث وضع الصيانة: " + error.message });
    } else {
      setEnabled(next);
      setFeedback({
        type: "success",
        text: next ? "تم تفعيل وضع الصيانة." : "تم إعادة تفعيل الموقع.",
      });
      onUpdated?.(updated);
    }
    setSaving(false);
  };

  const handleSaveMessage = async () => {
    if (!canEdit || saving) return;
    setSaving(true);
    setFeedback(null);

    const { settings: updated, error } = await updateMaintenanceMode(enabled, message);

    if (error) {
      setFeedback({ type: "error", text: "تعذّر حفظ الرسالة: " + error.message });
    } else {
      setFeedback({ type: "success", text: "تم حفظ رسالة الصيانة." });
      onUpdated?.(updated);
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`shrink-0 rounded-xl p-3 ${
              enabled ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <Wrench size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">وضع الصيانة</h3>
            <p className="mt-0.5 max-w-xs text-xs text-gray-400">
              عند التفعيل، يظهر للزوار إشعار بأن الموقع قيد الصيانة بدل الصفحة
              الرئيسية.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={!canEdit || saving}
          aria-pressed={enabled}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            enabled ? "bg-amber-500" : "bg-gray-300"
          }`}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm"
            style={{ [enabled ? "right" : "left"]: "4px" }}
          />
        </button>
      </div>

      {!canEdit && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <AlertTriangle size={12} />
          هذا الإجراء متاح فقط لحساب المسؤول الكامل (Admin).
        </p>
      )}

      {settingsError && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-[11px] font-bold text-amber-700">
          تعذّر جلب إعدادات الصيانة — تأكد من إنشاء جدول site_settings في
          Supabase (راجع supabase/site_settings.sql).
        </p>
      )}

      {canEdit && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          <label className="block text-xs font-bold text-gray-600">
            رسالة الصيانة (تظهر للزوار)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="نقوم حالياً بتحديث المنصة، سنعود قريباً..."
            className="w-full resize-none rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleSaveMessage}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-slate-900 disabled:opacity-60"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            حفظ الرسالة
          </button>
        </div>
      )}

      {feedback && (
        <p
          className={`mt-3 rounded-lg p-2.5 text-[11px] font-bold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </motion.div>
  );
}
