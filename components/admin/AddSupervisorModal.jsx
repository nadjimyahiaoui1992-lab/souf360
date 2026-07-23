"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import PermissionsEditor from "./PermissionsEditor";

const INITIAL_PERMISSIONS = { add_place: true, maintenance: false };

export default function AddSupervisorModal({ open, onClose, onCreated }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setPermissions(INITIAL_PERMISSIONS);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("البريد الإلكتروني وكلمة المرور إلزاميان.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/supervisors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName || null,
          permissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّرت إضافة المشرف.");

      onCreated?.(data.supervisor);
      handleClose();
    } catch (err) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-800">إضافة مشرف جديد</h3>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">
                  كلمة المرور المؤقتة
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-600">
                  المهام المسموح بها
                </label>
                <PermissionsEditor permissions={permissions} onChange={setPermissions} />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-[11px] font-bold text-red-600">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                إنشاء الحساب
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
