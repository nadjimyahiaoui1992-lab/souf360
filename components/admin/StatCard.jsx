"use client";

import { motion } from "framer-motion";

const COLOR_MAP = {
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
  blue: "bg-blue-50 text-blue-600",
  slate: "bg-slate-100 text-slate-600",
  red: "bg-red-50 text-red-600",
};

export default function StatCard({ icon: Icon, label, value, color = "emerald", delay = 0, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm"
    >
      <div className={`shrink-0 rounded-xl p-3 ${COLOR_MAP[color]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <span className="block text-xs font-bold text-gray-400">{label}</span>
        <span className="text-xl font-black text-gray-800">{value}</span>
        {sub && <span className="block text-[10px] text-gray-400">{sub}</span>}
      </div>
    </motion.div>
  );
}
