import { Wrench } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getMaintenanceMessage() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("maintenance_message")
      .eq("id", 1)
      .single();
    return data?.maintenance_message || "";
  } catch {
    return "";
  }
}

export default async function MaintenancePage() {
  const message = await getMaintenanceMessage();

  return (
    <main
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#0b121f] px-6 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
        <Wrench size={30} />
      </div>
      <h1 className="text-2xl font-black text-white sm:text-3xl">
        الموقع قيد الصيانة حالياً
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-gray-300">
        {message ||
          "نقوم حالياً بإجراء بعض التحديثات على المنصة. سنعود للعمل قريباً، شكراً لصبركم."}
      </p>
    </main>
  );
}
