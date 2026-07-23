const PLACE_FIELDS = [
  "name",
  "category",
  "description",
  "municipality",
  "district",
  "lat",
  "lng",
  "map_link",
  "image_url",
  "phone",
  "website",
  "opening_hours",
  "facebook",
  "instagram",
];

/**
 * يتحقق من صحة بيانات المعلم القادمة من الطلب ويطبّعها لتُخزّن في قاعدة
 * البيانات. كانت هذه المنطق مكررة حرفياً بين POST /api/admin/places و
 * PUT /api/admin/places/[id].
 *
 * تُرجع { error } عند فشل التحقق، أو { data } ببيانات جاهزة للإدراج/التحديث.
 */
export function parsePlacePayload(body) {
  const input = body || {};
  const { name, category, lat, lng } = input;

  if (!name || !category) {
    return { error: "اسم المعلم والتصنيف حقلان إلزاميان." };
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return { error: "إحداثيات الموقع (خط الطول والعرض) غير صالحة." };
  }

  const data = {};
  for (const field of PLACE_FIELDS) {
    if (field === "lat" || field === "lng") continue;
    if (field === "name" || field === "category") {
      data[field] = input[field];
    } else {
      data[field] = input[field] || null;
    }
  }
  data.lat = latNum;
  data.lng = lngNum;

  return { data };
}
