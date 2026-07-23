import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * يُرجع المستخدم الحالي مع ملفه الإداري (الدور والصلاحيات)، أو null إن لم
 * يكن مسجّلاً للدخول أو لم يكن له حساب في admin_profiles.
 */
export async function getCurrentAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return { user, profile };
}

/** تحقق سريع إن كانت للمستخدم صلاحية معيّنة (المدير يملك كل الصلاحيات دوماً). */
export function hasPermission(profile, key) {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  return Boolean(profile.permissions?.[key]);
}
