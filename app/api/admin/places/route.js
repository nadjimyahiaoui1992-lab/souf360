import { NextResponse } from "next/server";
import { getCurrentAdmin, hasPermission } from "@/lib/auth/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { parsePlacePayload } from "@/lib/validation/place";

/** POST: إنشاء معلم سياحي جديد. */
export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin.profile, "add_place")) {
    return NextResponse.json(
      { error: "ليست لديك صلاحية إضافة معالم." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { data: placeData, error: validationError } = parsePlacePayload(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("places")
    .insert({ ...placeData, created_by: admin.user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ place: data }, { status: 201 });
}
