import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "سوف 360 | دليل السياحة في الوادي",
    short_name: "سوف 360",
    description: "منصة سياحية حديثة لاستكشاف أماكن الوادي عبر خريطة تفاعلية.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f5ef",
    theme_color: "#264653",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
