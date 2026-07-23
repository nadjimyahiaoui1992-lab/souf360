import { NextResponse } from "next/server";
import { getCurrentAdmin, hasPermission } from "@/lib/auth/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { parsePlacePayload } from "@/lib/validation/place";

/** GET: جلب بيانات معلم واحد لتعبئة فورم التعديل. */
export async function GET(request, { params }) {
  const { id } = await params;

  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("places")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "المعلم غير موجود." }, { status: 404 });
  }

  return NextResponse.json({ place: data });
}

/** PUT: تحديث بيانات معلم موجود. */
export async function PUT(request, { params }) {
  const { id } = await params;

  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin.profile, "add_place")) {
    return NextResponse.json(
      { error: "ليست لديك صلاحية تعديل معالم." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { data: placeData, error: validationError } = parsePlacePayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("places")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "المعلم غير موجود." }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("places")
    .update(placeData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ place: data });
}
