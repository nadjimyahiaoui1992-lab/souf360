"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  PlusCircle,
  UserPlus,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getSiteSettings, pingDatabase } from "@/services/site-settings";
import { useAdminProfile, useHasPermission } from "@/components/admin/AdminProvider";
import SystemStatus from "@/components/admin/SystemStatus";
import MaintenanceCard from "@/components/admin/MaintenanceCard";
import StatCard from "@/components/admin/StatCard";

export default function DashboardPage() {
  const profile = useAdminProfile();
  const canManageUsers = useHasPermission("manage_users");

  const [settings, setSettings] = useState(null);
  const [settingsError, setSettingsError] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [placesCount, setPlacesCount] = useState(null);
  const [supervisorsCount, setSupervisorsCount] = useState(null);

  const refreshDb = useCallback(async () => {
    const result = await pingDatabase();
    setDbStatus(result);
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    (async () => {
      const { settings: s, error } = await getSiteSettings();
      setSettings(s);
      setSettingsError(error);
    })();

    refreshDb();

    (async () => {
      const { count } = await supabase
        .from("places")
        .select("id", { count: "exact", head: true });
      setPlacesCount(count ?? 0);
    })();

    (async () => {
      const { count } = await supabase
        .from("admin_profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "supervisor");
      setSupervisorsCount(count ?? 0);
    })();
  }, [refreshDb]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-black text-gray-800 sm:text-2xl">
          مرحباً، {profile?.full_name || profile?.email || "بك"} 👋
        </h1>
        <p className="text-sm text-gray-400">
          نظرة عامة على حالة منصة سوف 360 وأدوات الإدارة السريعة.
        </p>
      </header>

      <div className="mb-6 rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm sm:p-5">
        <SystemStatus
          dbStatus={dbStatus}
          onRefreshDb={refreshDb}
          maintenanceMode={settings?.maintenance_mode}
          lastChecked={lastChecked}
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={MapPin}
          label="المعالم المنشورة"
          value={placesCount ?? "…"}
          color="emerald"
        />
        <StatCard
          icon={Users}
          label="عدد المشرفين"
          value={supervisorsCount ?? "…"}
          color="purple"
        />
        <StatCard
          icon={LayoutGrid}
          label="دورك الحالي"
          value={profile?.role === "admin" ? "مدير" : "مشرف"}
          color="blue"
        />
        <StatCard
          icon={PlusCircle}
          label="إجراء سريع"
          value="إضافة معلم"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MaintenanceCard
            settings={settings}
            role={profile?.role}
            settingsError={settingsError}
            onUpdated={(updated) => setSettings(updated)}
          />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-gray-200/60 bg-gradient-to-l from-emerald-600 to-emerald-500 p-5 text-white shadow-sm sm:p-6"
          >
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-black">إضافة معلم سياحي جديد</h3>
                <p className="mt-1 max-w-md text-xs text-emerald-50/90">
                  أضف معلماً جديداً مع صوره وإحداثياته ومعلومات التواصل الخاصة به
                  في خطوات بسيطة.
                </p>
              </div>
              <Link
                href="/admin/add-place"
                className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <PlusCircle size={16} />
                إضافة معلم
                <ArrowLeft size={14} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-xl bg-purple-50 p-3 text-purple-600">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">إدارة المشرفين</h3>
                  <p className="mt-1 max-w-sm text-xs text-gray-400">
                    {canManageUsers
                      ? "أضف مشرفين جدداً وحدد مهامهم وصلاحياتهم داخل اللوحة."
                      : "عرض قائمة المشرفين الحاليين (الإضافة متاحة للمدير فقط)."}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-900"
              >
                <UserPlus size={14} />
                {canManageUsers ? "إضافة مشرف" : "عرض المشرفين"}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
