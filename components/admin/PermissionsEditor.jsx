"use client";

import { PlusCircle, Wrench } from "lucide-react";

const PERMISSION_OPTIONS = [
  {
    key: "add_place",
    label: "إضافة معالم جديدة",
    icon: PlusCircle,
  },
  {
    key: "maintenance",
    label: "التحكم بوضع الصيانة",
    icon: Wrench,
  },
];

/**
 * permissions: { add_place: boolean, maintenance: boolean }
 * onChange: (next) => void
 */
export default function PermissionsEditor({ permissions, onChange }) {
  const toggle = (key) => {
    onChange({ ...permissions, [key]: !permissions[key] });
  };

  return (
    <div className="space-y-2">
      {PERMISSION_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const checked = Boolean(permissions[opt.key]);
        return (
          <label
            key={opt.key}
            className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors ${
              checked
                ? "border-emerald-300 bg-emerald-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <span className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <Icon size={15} className={checked ? "text-emerald-600" : "text-gray-400"} />
              {opt.label}
            </span>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt.key)}
              className="h-4 w-4 accent-emerald-600"
            />
          </label>
        );
      })}
    </div>
  );
}
