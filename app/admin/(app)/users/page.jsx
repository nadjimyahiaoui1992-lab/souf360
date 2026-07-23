"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Trash2,
  ShieldCheck,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAdminProfile, useHasPermission } from "@/components/admin/AdminProvider";
import PermissionsEditor from "@/components/admin/PermissionsEditor";
import AddSupervisorModal from "@/components/admin/AddSupervisorModal";

export default function UsersPage() {
  const profile = useAdminProfile();
  const canManageUsers = useHasPermission("manage_users");

  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/supervisors");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر جلب المشرفين.");
      setSupervisors(data.supervisors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePermissionsChange = async (id, nextPermissions) => {
    setSavingId(id);
    setSupervisors((prev) =>
      prev.map((s) => (s.id === id ? { ...s, permissions: nextPermissions } : s))
    );
    try {
      const res = await fetch(`/api/admin/supervisors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: nextPermissions }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "تعذّر حفظ الصلاحيات.");
      }
    } catch (err) {
      setError(err.message);
      load();
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id, label) => {
    if (!confirm(`هل أنت متأكد من حذف حساب "${label}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/supervisors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "تعذّر حذف الحساب.");
      }
      setSupervisors((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-black text-gray-800 sm:text-xl">إدارة المشرفين</h1>
          <p className="text-xs text-gray-400">
            {canManageUsers
              ? "أضف مشرفين جدداً وحدد المهام المسموح لهم بها."
              : "عرض قائمة المشرفين الحاليين وصلاحياتهم."}
          </p>
        </div>
        {canManageUsers && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
          >
            <UserPlus size={15} />
            إضافة مشرف
          </button>
        )}
      </header>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {supervisors.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`shrink-0 rounded-xl p-2.5 ${
                      s.role === "admin"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {s.role === "admin" ? <ShieldCheck size={18} /> : <User size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {s.full_name || s.email}
                      {s.id === profile?.id && (
                        <span className="mr-1.5 text-[10px] font-bold text-gray-400">(أنت)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400" dir="ltr">
                      {s.email}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        s.role === "admin"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {s.role === "admin" ? "مدير كامل" : "مشرف"}
                    </span>
                  </div>
                </div>

                {canManageUsers && s.role !== "admin" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.full_name || s.email)}
                    className="shrink-0 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="حذف المشرف"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {s.role === "supervisor" && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  {canManageUsers ? (
                    <PermissionsEditor
                      permissions={s.permissions || {}}
                      onChange={(next) => handlePermissionsChange(s.id, next)}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {s.permissions?.add_place && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600">
                          إضافة معالم
                        </span>
                      )}
                      {s.permissions?.maintenance && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600">
                          وضع الصيانة
                        </span>
                      )}
                    </div>
                  )}
                  {savingId === s.id && (
                    <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <Loader2 size={11} className="animate-spin" />
                      جارٍ الحفظ...
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {supervisors.length === 0 && (
            <p className="py-10 text-center text-xs text-gray-400">لا يوجد مشرفون بعد.</p>
          )}
        </div>
      )}

      <AddSupervisorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(supervisor) => setSupervisors((prev) => [supervisor, ...prev])}
      />
    </div>
  );
}
