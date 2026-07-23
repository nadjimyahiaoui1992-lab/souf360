import { NextResponse } from "next/server";
import { getCurrentAdmin, hasPermission } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin.profile, "add_place")) {
    return NextResponse.json(
      { error: "ليست لديك صلاحية إضافة معالم." },
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

  const { data, error } = await supabaseAdmin
    .from("places")
    .insert({
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
      created_by: admin.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ place: data }, { status: 201 });
}
