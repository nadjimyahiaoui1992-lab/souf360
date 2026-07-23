import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * حل احترافي ومستقل لحساب المسارات:
 * 1) إن كان لديك خادم OSRM خاص بك (self-hosted) ضَع رابطه في متغيّر البيئة OSRM_SERVER_URL
 *    -> هذا هو الحل المستقل 100% (راجع الشرح المرفق حول استضافة OSRM بنفسك).
 * 2) إن لم يوجد، نحاول خوادم OSRM العامة (احتياطياً فقط، ومن السيرفر لا من المتصفح
 *    لتفادي مشاكل CORS و rate-limit التي يتعرض لها كل زائر على حدة).
 * 3) إن فشلت كل المحاولات، نحسب مساراً تقديرياً بخط مستقيم + سرعة متوسطة،
 *    بحيث لا تظهر أي رسالة خطأ للزائر ولا حاجة لأي تطبيق خارجي أبداً.
 */

const SELF_HOSTED_OSRM = process.env.OSRM_SERVER_URL; // مثال: https://osrm.souf360.dz
const PUBLIC_OSRM_SERVERS = [
  'https://routing.openstreetmap.de/routed-car',
  'https://router.project-osrm.org',
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const originLat = parseFloat(searchParams.get('originLat') || '');
  const originLng = parseFloat(searchParams.get('originLng') || '');
  const destLat = parseFloat(searchParams.get('destLat') || '');
  const destLng = parseFloat(searchParams.get('destLng') || '');

  if ([originLat, originLng, destLat, destLng].some((v) => Number.isNaN(v))) {
    return NextResponse.json({ error: 'إحداثيات غير صالحة' }, { status: 400 });
  }

  const servers = [SELF_HOSTED_OSRM, ...PUBLIC_OSRM_SERVERS].filter(Boolean) as string[];

  for (const server of servers) {
    try {
      const url = `${server}/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();
      if (data.code !== 'Ok' || !data.routes?.length) continue;

      const route = data.routes[0];
      return NextResponse.json({
        source: server === SELF_HOSTED_OSRM ? 'self-hosted' : 'osrm-public',
        estimated: false,
        coordinates: route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]),
        distanceKm: parseFloat((route.distance / 1000).toFixed(1)),
        durationMin: Math.ceil(route.duration / 60),
      });
    } catch {
      // جرّب المصدر التالي بصمت
    }
  }

  // خط الدفاع الأخير: مسار تقديري داخلي، بدون أي خروج لتطبيقات خارجية
  const distanceKm = haversineKm(originLat, originLng, destLat, destLng);
  const estimatedSpeedKmh = 35;
  return NextResponse.json({
    source: 'fallback-straight-line',
    estimated: true,
    coordinates: [
      [originLat, originLng],
      [destLat, destLng],
    ],
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    durationMin: Math.max(1, Math.ceil((distanceKm / estimatedSpeedKmh) * 60)),
  });
}