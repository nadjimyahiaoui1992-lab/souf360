"use client";
import Link from 'next/link';
import { Map, Compass, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';

// يمكن تغيير اسم الموقع من هنا بسهولة ليعكس الهوية
const SITE_CONFIG = {
  name: "سوف 360",
  subName: "SOUF DIGITAL",
  description: "بوابتك الذكية لاستكشاف جوهرة الصحراء ومدينة الألف قبة وقبة",
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden font-sans" dir="rtl">
      
      {/* الخلفية الاحترافية: رمال ذهبية، غروب شمس، واحات، ومدينة الألف قبة */}
      <div className="absolute inset-0 z-0 bg-[#1a0f02]">
        
        {/* صورة عالية الجودة لغروب الشمس في الصحراء وواحات سوف */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://unsplash.com/fr/photos/personnes-marchant-sur-le-desert-pendant-la-journee-7EkyXZYeYsw')`,
          }}
        />

        {/* طبقات تدرج غروب الشمس الساحر (أصفر ذهبي، برتقالي، ودفء الصحراء) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705] via-amber-950/60 to-orange-600/30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0705]/95"></div>
        
        {/* تأثير توهج الغروب الذهبي */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 max-w-5xl w-full text-center px-6 space-y-12">
        
        {/* الشعار المتميز (Professional Brand Identity) */}
        <div className="flex flex-col items-center animate-fade-in">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-amber-500/30 p-6 rounded-full shadow-2xl">
               {/* شعار SVG مخصص يدمج القبة بالنخلة */}
               <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-400">
                  <path d="M50 10C30 10 10 30 10 50H90C90 30 70 10 50 10Z" stroke="currentColor" strokeWidth="4" />
                  <path d="M50 50V90M50 60L35 75M50 60L65 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="5" fill="currentColor" />
               </svg>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic drop-shadow-lg">
              <span className="text-white">{SITE_CONFIG.name.split(' ')[0]}</span>
              <span className="text-amber-400 tracking-normal"> {SITE_CONFIG.name.split(' ')[1]}</span>
            </h1>
            <p className="text-amber-300 font-bold tracking-[0.5em] text-sm uppercase drop-shadow">
              {SITE_CONFIG.subName}
            </p>
          </div>
        </div>

        {/* النبذة الاحترافية */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl md:text-3xl font-light text-gray-100 leading-relaxed drop-shadow">
            {SITE_CONFIG.description}
          </h2>
          <div className="flex justify-center gap-2">
             <span className="h-1 w-12 bg-amber-500 rounded-full shadow"></span>
             <span className="h-1 w-4 bg-white/40 rounded-full"></span>
             <span className="h-1 w-4 bg-white/40 rounded-full"></span>
          </div>
        </div>

        {/* الأزرار الاحترافية المطلوبة */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8">
          
          {/* الزر الأول: استكشاف المنصة */}
          <Link href="/explore" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
            <button className="relative flex items-center gap-4 bg-black/40 backdrop-blur-2xl border border-amber-500/30 px-10 py-5 rounded-2xl transition-all duration-300 group-hover:bg-black/60 shadow-xl">
              <div className="p-3 bg-amber-500 rounded-xl text-black shadow-lg">
                <Compass size={24} className="animate-spin-slow" />
              </div>
              <div className="text-right">
                <span className="block text-xs text-amber-300 font-bold mb-1">اكتشف الآن</span>
                <span className="text-xl font-black text-white italic">مزايا المنصة</span>
              </div>
            </button>
          </Link>

          {/* الزر الثاني: الخريطة التفاعلية */}
          <Link href="/map" className="group relative">
            <button className="relative flex items-center gap-4 bg-black/40 backdrop-blur-2xl border border-sky-500/30 px-10 py-5 rounded-2xl transition-all duration-300 hover:border-sky-400 shadow-xl">
              <div className="p-3 bg-sky-600/30 rounded-xl text-sky-400 shadow-inner">
                <Map size={24} />
              </div>
              <div className="text-right">
                <span className="block text-xs text-sky-300 font-bold mb-1">الملاحة الذكية</span>
                <span className="text-xl font-black text-white italic">خريطة تفاعلية</span>
              </div>
            </button>
          </Link>

        </div>

      </div>

      {/* رابط لوحة التحكم (مخفي بشكل أنيق للمشرفين) */}
      <Link href="/admin" className="absolute top-8 left-8 p-3 bg-black/30 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/50 transition-all opacity-40 hover:opacity-100 shadow-lg">
        <LayoutDashboard size={20} />
      </Link>

      {/* زر اللغة السريع في الهبوط */}
      <div className="absolute top-8 right-8 flex gap-3 text-xs font-bold bg-black/30 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 shadow-lg">
        <button className="px-2.5 py-1 bg-amber-500 rounded-full text-black">AR</button>
        <button className="px-2.5 py-1 hover:text-amber-400 transition-colors">FR</button>
        <button className="px-2.5 py-1 hover:text-amber-400 transition-colors">EN</button>
      </div>

    </main>
  );
}
