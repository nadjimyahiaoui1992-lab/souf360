import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** PATCH: تعديل صلاحيات أو اسم مشرف موجود (متاح للمدير فقط). */
export async function PATCH(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.profile.role !== "admin") {
    return NextResponse.json(
      { error: "هذا الإجراء متاح للمدير فقط." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { permissions, full_name } = body || {};

  const updates = {};
  if (permissions) {
    updates.permissions = {
      add_place: Boolean(permissions.add_place),
      manage_users: false,
      maintenance: Boolean(permissions.maintenance),
    };
  }
  if (typeof full_name === "string") {
    updates.full_name = full_name;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "لا يوجد ما يتم تحديثه." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("admin_profiles")
    .update(updates)
    .eq("id", id)
    .eq("role", "supervisor")
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ supervisor: data });
}

/** DELETE: حذف حساب مشرف بالكامل (متاح للمدير فقط). */
export async function DELETE(request, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.profile.role !== "admin") {
    return NextResponse.json(
      { error: "هذا الإجراء متاح للمدير فقط." },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (id === admin.user.id) {
    return NextResponse.json(
      { error: "لا يمكنك حذف حسابك الخاص." },
      { status: 400 }
    );
  }

  const { error: profileError } = await supabaseAdmin
    .from("admin_profiles")
    .delete()
    .eq("id", id)
    .eq("role", "supervisor");

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
