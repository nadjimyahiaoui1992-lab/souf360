"use client";

import { useState } from "react";
import { Database, Globe, RefreshCw } from "lucide-react";
import StatusPill from "./StatusPill";
import { pingDatabase } from "@/services/site-settings";

function formatTime(date) {
  if (!date) return "—";
  return date.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function SystemStatus({ dbStatus, onRefreshDb, maintenanceMode, lastChecked }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshDb?.();
    setRefreshing(false);
  };

  const dbPillStatus = dbStatus === null ? "idle" : dbStatus.connected ? "online" : "offline";
  const dbLabel =
    dbStatus === null
      ? "جارٍ فحص الاتصال..."
      : dbStatus.connected
      ? "قاعدة البيانات متصلة"
      : "تعذّر الاتصال بقاعدة البيانات";
  const dbDetail =
    dbStatus?.connected ? `زمن الاستجابة: ${dbStatus.latencyMs} ms` : dbStatus?.message || null;

  const sitePillStatus = maintenanceMode ? "warning" : "online";
  const siteLabel = maintenanceMode ? "الموقع في وضع الصيانة" : "الموقع يعمل بشكل طبيعي";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap gap-3">
        <StatusPill status={dbPillStatus} label={dbLabel} detail={dbDetail} icon={Database} />
        <StatusPill status={sitePillStatus} label={siteLabel} icon={Globe} />
      </div>

      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <span>آخر فحص: {formatTime(lastChecked)}</span>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>
    </div>
  );
}
