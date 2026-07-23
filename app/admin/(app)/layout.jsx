import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { AdminProvider } from "@/components/admin/AdminProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminAppLayout({ children }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin");
  }

  const { user, profile } = admin;

  return (
    <div dir="rtl" className="flex min-h-screen bg-slate-50 lg:flex-row flex-col">
      <AdminProvider profile={profile}>
        <AdminSidebar role={profile.role} userEmail={user.email} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </AdminProvider>
    </div>
  );
}
