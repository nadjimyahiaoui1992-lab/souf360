import { supabase } from "@/lib/supabase/client";

/**
 * جدول الإعدادات العامة (سجل واحد فقط، id = 1).
 * يجب إنشاؤه مرة واحدة في Supabase قبل استخدام هذه الدوال — راجع
 * الملف supabase/site_settings.sql المرفق مع هذا التحديث لكود SQL الجاهز.
 */
const SETTINGS_TABLE = "site_settings";
const SETTINGS_ROW_ID = 1;

const DEFAULT_SETTINGS = {
  id: SETTINGS_ROW_ID,
  maintenance_mode: false,
  maintenance_message: "",
  updated_at: null,
};

/** جلب إعدادات الموقع الحالية (وضع الصيانة ورسالته). */
export async function getSiteSettings() {
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("*")
    .eq("id", SETTINGS_ROW_ID)
    .single();

  if (error || !data) {
    return { settings: DEFAULT_SETTINGS, error };
  }
  return { settings: data, error: null };
}

/** تحديث وضع الصيانة (تفعيل/تعطيل) مع رسالة اختيارية تظهر للزوار. */
export async function updateMaintenanceMode(enabled, message = "") {
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .update({
      maintenance_mode: enabled,
      maintenance_message: message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", SETTINGS_ROW_ID)
    .select()
    .single();

  return { settings: data, error };
}

/**
 * فحص سريع لحالة الاتصال بقاعدة البيانات: يقيس زمن استجابة استعلام بسيط
 * (بدون جلب بيانات فعلية، فقط head request) ويُرجع الحالة والزمن بالميلي ثانية.
 */
export async function pingDatabase() {
  const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();

  try {
    const { error } = await supabase
      .from("places")
      .select("id", { count: "exact", head: true });

    const latencyMs = Math.round(
      (typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt
    );

    if (error) {
      return { connected: false, latencyMs, message: error.message };
    }
    return { connected: true, latencyMs, message: null };
  } catch (err) {
    const latencyMs = Math.round(
      (typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt
    );
    return { connected: false, latencyMs, message: err.message || "تعذّر الوصول للخادم" };
  }
}
