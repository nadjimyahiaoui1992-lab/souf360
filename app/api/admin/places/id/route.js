import { NextResponse } from "next/server";
import { getCurrentAdmin, hasPermission } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
  const {
    name,
    category,
    description,
    municipality,
    district,
    lat,
    lng,
    map_link,
    image_url,
    phone,
    website,
    opening_hours,
    facebook,
    instagram,
  } = body || {};

  if (!name || !category) {
    return NextResponse.json(
      { error: "اسم المعلم والتصنيف حقلان إلزاميان." },
      { status: 400 }
    );
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return NextResponse.json(
      { error: "إحداثيات الموقع (خط الطول والعرض) غير صالحة." },
      { status: 400 }
    );
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
    .update({
      name,
      category,
      description: description || null,
      municipality: municipality || null,
      district: district || null,
      lat: latNum,
      lng: lngNum,
      map_link: map_link || null,
      image_url: image_url || null,
      phone: phone || null,
      website: website || null,
      opening_hours: opening_hours || null,
      facebook: facebook || null,
      instagram: instagram || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ place: data });
}
