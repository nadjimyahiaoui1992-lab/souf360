"use client";
import Link from 'next/link';
import { Map, Compass, Sparkles, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';

// يمكن تغيير اسم الموقع من هنا بسهولة ليعكس الهوية
const SITE_CONFIG = {
  name: "سوف 360",
  subName: "SOUF DIGITAL",
  description: "بوابتك الذكية لاستكشاف جوهرة الصحراء ومدينة الألف قبة",
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden font-sans" dir="rtl">
      
      {/* الخلفية: فيديو احترافي بدلاً من الصورة ليعطي انطباعاً عالمياً */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover scale-105"
        >
          {/* تأكد من وضع ملف فيديو في مجلد public/assets/video/hero.mp4 */}
          <source src="/assets/video/hero.mp4" type="video/mp4" />
          {/* fallback في حال لم يعمل الفيديو */}
          <div className="absolute inset-0 bg-black/60"></div>
        </video>
        
        {/* طبقات التدرج اللوني (Overlays) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90"></div>
        <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay"></div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 max-w-5xl w-full text-center px-6 space-y-12">
        
        {/* الشعار المتميز (Professional Brand Identity) */}
        <div className="flex flex-col items-center animate-fade-in">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-full shadow-2xl">
               {/* شعار SVG مخصص يدمج القبة بالنخلة */}
               <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500">
                  <path d="M50 10C30 10 10 30 10 50H90C90 30 70 10 50 10Z" stroke="currentColor" strokeWidth="4" />
                  <path d="M50 50V90M50 60L35 75M50 60L65 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="5" fill="currentColor" />
               </svg>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic">
              <span className="text-white drop-shadow-2xl">{SITE_CONFIG.name.split(' ')[0]}</span>
              <span className="text-amber-500 drop-shadow-2xl tracking-normal"> {SITE_CONFIG.name.split(' ')[1]}</span>
            </h1>
            <p className="text-amber-400 font-bold tracking-[0.5em] text-sm uppercase">
              {SITE_CONFIG.subName}
            </p>
          </div>
        </div>

        {/* النبذة الاحترافية */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl md:text-3xl font-light text-gray-200 leading-relaxed">
            {SITE_CONFIG.description}
          </h2>
          <div className="flex justify-center gap-2">
             <span className="h-1 w-12 bg-amber-500 rounded-full"></span>
             <span className="h-1 w-4 bg-white/30 rounded-full"></span>
             <span className="h-1 w-4 bg-white/30 rounded-full"></span>
          </div>
        </div>

        {/* الأزرار الاحترافية المطلوبة */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8">
          
          {/* الزر الأول: استكشاف المنصة */}
          <Link href="/discover" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>
            <button className="relative flex items-center gap-4 bg-white/10 backdrop-blur-2xl border border-white/20 px-10 py-5 rounded-2xl transition-all duration-300 group-hover:bg-white/20">
              <div className="p-3 bg-amber-500 rounded-xl text-black shadow-lg">
                <Compass size={24} className="animate-spin-slow" />
              </div>
              <div className="text-right">
                <span className="block text-xs text-amber-400 font-bold mb-1">اكتشف الآن</span>
                <span className="text-xl font-black text-white italic">مزايا المنصة</span>
              </div>
            </button>
          </Link>

          {/* الزر الثاني: الخريطة التفاعلية */}
          <Link href="/map" className="group relative">
            <button className="relative flex items-center gap-4 bg-slate-900/80 backdrop-blur-2xl border border-sky-500/30 px-10 py-5 rounded-2xl transition-all duration-300 hover:border-sky-400">
              <div className="p-3 bg-sky-600/20 rounded-xl text-sky-400 shadow-inner">
                <Map size={24} />
              </div>
              <div className="text-right">
                <span className="block text-xs text-sky-400 font-bold mb-1">الملاحة الذكية</span>
                <span className="text-xl font-black text-white italic">خريطة تفاعلية</span>
              </div>
            </button>
          </Link>

        </div>

      </div>

      {/* رابط لوحة التحكم (مخفي بشكل أنيق للمشرفين) */}
      <Link href="/admin/login" className="absolute top-8 left-8 p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-all opacity-40 hover:opacity-100">
        <LayoutDashboard size={20} />
      </Link>

      {/* زر اللغة السريع في الهبوط */}
      <div className="absolute top-8 right-8 flex gap-4 text-xs font-bold bg-black/20 backdrop-blur-md p-2 rounded-full border border-white/10">
        <button className="px-3 py-1 bg-amber-500 rounded-full text-black">AR</button>
        <button className="px-3 py-1 hover:text-amber-500">FR</button>
        <button className="px-3 py-1 hover:text-amber-500">EN</button>
      </div>

    </main>
  );
}
