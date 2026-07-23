"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, MapPinned, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !data?.user) {
      setLoading(false);
      setError("بيانات الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("هذا الحساب غير مصرّح له بالدخول إلى لوحة التحكم.");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(16,185,129,0.12), transparent 45%), radial-gradient(circle at 80% 80%, rgba(59,130,246,0.10), transparent 45%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/25">
            <MapPinned size={26} className="text-emerald-400" />
          </div>
          <h1 className="text-xl font-black text-white">لوحة تحكم سوف 360</h1>
          <p className="mt-1 text-xs text-slate-400">
            سجّل الدخول للوصول إلى لوحة الإدارة والإشراف
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@souf360.com"
                dir="ltr"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3.5 pr-10 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3.5 pr-10 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-xs font-bold text-red-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            تسجيل الدخول
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          هذه اللوحة مخصصة للمدراء والمشرفين المصرّح لهم فقط.
        </p>
      </motion.div>
    </main>
  );
}
