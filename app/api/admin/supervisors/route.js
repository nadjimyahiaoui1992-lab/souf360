import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** GET: قائمة كل المشرفين والمدراء (لعرضها في /admin/users). */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id, email, full_name, role, permissions, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ supervisors: data });
}

/** POST: إنشاء حساب مشرف جديد (متاح للمدير فقط). */
export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.profile.role !== "admin") {
    return NextResponse.json(
      { error: "هذا الإجراء متاح للمدير فقط." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, password, full_name, permissions } = body || {};

  if (!email || !password) {
    return NextResponse.json(
      { error: "البريد الإلكتروني وكلمة المرور مطلوبان." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل." },
      { status: 400 }
    );
  }

  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    });

  if (createError || !created?.user) {
    return NextResponse.json(
      { error: createError?.message || "تعذّر إنشاء الحساب." },
      { status: 400 }
    );
  }

  const safePermissions = {
    add_place: Boolean(permissions?.add_place),
    manage_users: false, // إدارة المشرفين محصورة بالمدير فقط دائماً
    maintenance: Boolean(permissions?.maintenance),
  };

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("admin_profiles")
    .insert({
      id: created.user.id,
      email: email.trim(),
      full_name: full_name || null,
      role: "supervisor",
      permissions: safePermissions,
      created_by: admin.user.id,
    })
    .select()
    .single();

  if (profileError) {
    // تراجع: احذف حساب المصادقة الذي أُنشئ إن فشل إنشاء الملف الإداري
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ supervisor: profile }, { status: 201 });
}
