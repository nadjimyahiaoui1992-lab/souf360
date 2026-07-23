"use client";

const DOT_COLORS = {
  online: "bg-emerald-500",
  warning: "bg-amber-500",
  offline: "bg-red-500",
  idle: "bg-slate-300",
};

const TEXT_COLORS = {
  online: "text-emerald-700",
  warning: "text-amber-700",
  offline: "text-red-700",
  idle: "text-slate-500",
};

const BG_COLORS = {
  online: "bg-emerald-50 border-emerald-200/70",
  warning: "bg-amber-50 border-amber-200/70",
  offline: "bg-red-50 border-red-200/70",
  idle: "bg-slate-50 border-slate-200/70",
};

/**
 * شارة حالة صغيرة (نقطة نابضة + نص) تُستخدم لعرض حالة الاتصال بقاعدة
 * البيانات أو حالة الموقع (يعمل / وضع الصيانة).
 *
 * status: "online" | "warning" | "offline" | "idle"
 */
export default function StatusPill({ status = "idle", label, detail, icon: Icon }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 ${BG_COLORS[status]}`}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {status === "online" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${DOT_COLORS[status]}`}
          />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${DOT_COLORS[status]}`} />
      </span>

      {Icon && <Icon size={14} className={TEXT_COLORS[status]} />}

      <div className="min-w-0 leading-tight">
        <p className={`text-xs font-bold ${TEXT_COLORS[status]}`}>{label}</p>
        {detail && <p className="text-[10px] text-slate-400">{detail}</p>}
      </div>
    </div>
  );
}
