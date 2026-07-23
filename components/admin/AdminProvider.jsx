"use client";

import { createContext, useContext } from "react";

const AdminContext = createContext(null);

export function AdminProvider({ profile, children }) {
  return (
    <AdminContext.Provider value={profile}>{children}</AdminContext.Provider>
  );
}

/** يُرجع {id, email, full_name, role, permissions} للمستخدم الحالي. */
export function useAdminProfile() {
  return useContext(AdminContext);
}

/** تحقق من امتلاك المستخدم الحالي صلاحية معيّنة (المدير يملك كل الصلاحيات). */
export function useHasPermission(key) {
  const profile = useAdminProfile();
  if (!profile) return false;
  if (profile.role === "admin") return true;
  return Boolean(profile.permissions?.[key]);
}
