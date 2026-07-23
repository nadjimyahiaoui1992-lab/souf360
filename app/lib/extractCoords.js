/**
 * يحاول استخراج {lat, lng} من رابط خرائط جوجل بأكثر من صيغة شائعة:
 *  - https://www.google.com/maps/@33.368,6.853,15z
 *  - https://www.google.com/maps/place/.../@33.368,6.853,17z/...
 *  - https://www.google.com/maps?q=33.368,6.853
 *  - https://maps.google.com/?q=33.368,6.853
 *  - روابط تحوي !3d33.368!4d6.853 (إحداثيات نقطة الدبوس الدقيقة)
 */
export function extractCoordsFromLink(link) {
  if (!link || typeof link !== "string") return null;

  // إحداثيات دقيقة لنقطة الدبّوس (أدق من إحداثيات مركز الخريطة @lat,lng)
  const pinMatch = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (pinMatch) {
    return { lat: pinMatch[1], lng: pinMatch[2] };
  }

  // صيغة @lat,lng,zoom
  const atMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: atMatch[1], lng: atMatch[2] };
  }

  // صيغة ?q=lat,lng أو &q=lat,lng
  const qMatch = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: qMatch[1], lng: qMatch[2] };
  }

  // صيغة ll=lat,lng
  const llMatch = link.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch) {
    return { lat: llMatch[1], lng: llMatch[2] };
  }

  return null;
}

/**
 * يتحقق مبدئياً هل النص المُدخل يشبه رابط خرائط جوجل (لتفعيل وضع "لصق رابط").
 */
export function looksLikeMapsLink(value) {
  if (!value) return false;
  const v = value.trim();
  return (
    /^https?:\/\//i.test(v) ||
    v.includes("maps.app.goo.gl") ||
    v.includes("goo.gl/maps")
  );
}

/**
 * يتحقق هل النص يشبه Google Plus Code (مثال: 7X8V+2Q الوادي، أو 8FW67X8V+2Q).
 * الصيغة العامة: 4 محارف/أرقام على الأقل + رمز "+" + محرفان على الأقل.
 */
export function looksLikePlusCode(value) {
  if (!value) return false;
  return /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}/i.test(
    value.trim()
  );
}
