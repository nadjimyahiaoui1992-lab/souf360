"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  LogOut,
  Menu,
  X,
  MapPinned,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/add-place", label: "إضافة معلم", icon: PlusCircle, adminOnly: false },
  { href: "/admin/users", label: "المساعدون", icon: Users, adminOnly: true },
];

export default function AdminSidebar({ role, userEmail }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/25">
          <MapPinned size={18} className="text-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">عين الوادي</p>
          <p className="truncate text-[11px] text-slate-400">{userEmail || "لوحة الإدارة"}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-white/10 font-bold text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="admin-nav-active"
                  className="absolute right-0 h-5 w-1 rounded-full bg-emerald-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        {role && (
          <div className="mb-2 px-3.5 py-1.5">
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                role === "admin"
                  ? "bg-purple-500/15 text-purple-300"
                  : "bg-emerald-500/15 text-emerald-300"
              }`}
            >
              {role === "admin" ? "مسؤول نظام كامل" : "مشرف نشر محتوى"}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* شريط علوي مضغوط للهاتف */}
      <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <MapPinned size={18} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">عين الوادي</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10"
          aria-label="فتح القائمة"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* الشريط الجانبي - سطح المكتب */}
      <aside className="hidden w-64 shrink-0 bg-slate-900 lg:flex">{content}</aside>

      {/* قائمة منسدلة للهاتف */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-64 bg-slate-900 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute left-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
                aria-label="إغلاق القائمة"
              >
                <X size={18} />
              </button>
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
