"use client";
import Link from 'next/link';
import { Map, Compass, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';

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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between text-white overflow-hidden font-sans py-8 px-4" dir="rtl">
      
      {/* خلفية جمالية تدمج الرمال الذهبية وغروب الصحراء */}
      <div className="absolute inset-0 z-0 bg-[#0f0a06]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#180f07]/90 to-[#0a0604]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-600/15 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      {/* الشريط العلوي (اللغة + لوحة التحكم) */}
      <div className="relative z-20 w-full max-w-md flex items-center justify-between px-2">
        {/* زر لوحة التحكم */}
        <Link href="/admin" className="p-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl border border-white/10 transition-all text-gray-300 hover:text-white shadow-md">
          <LayoutDashboard size={18} />
        </Link>

        {/* محول اللغات المصغر */}
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[11px] font-bold shadow-md">
          <button className="px-2 py-0.5 bg-amber-500 text-black rounded-lg">AR</button>
          <button className="px-2 py-0.5 text-gray-400 hover:text-white transition-colors">FR</button>
          <button className="px-2.5 py-0.5 text-gray-400 hover:text-white transition-colors">EN</button>
        </div>
      </div>

      {/* المحتوى الرئيسي (متناسق ومرتب في المنتصف) */}
      <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center my-auto space-y-6">
        
        {/* الشعار بحجم صغير ومثالي */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-amber-500/20 to-black/60 backdrop-blur-xl border border-amber-500/30 p-3.5 rounded-2xl shadow-xl mb-3">
             <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-400">
                <path d="M50 10C30 10 10 30 10 50H90C90 30 70 10 50 10Z" stroke="currentColor" strokeWidth="5" />
                <path d="M50 50V90M50 60L35 75M50 60L65 75" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                <circle cx="50" cy="50" r="6" fill="currentColor" />
             </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            <span className="text-white">{SITE_CONFIG.name.split(' ')[0]}</span>
            <span className="text-amber-400"> {SITE_CONFIG.name.split(' ')[1]}</span>
          </h1>
          <p className="text-amber-400/80 font-bold tracking-[0.3em] text-[10px] uppercase mt-0.5">
            {SITE_CONFIG.subName}
          </p>
        </div>

        {/* النبذة التعريفية */}
        <p className="text-xs md:text-sm text-gray-300 font-medium leading-relaxed px-4">
          {SITE_CONFIG.description}
        </p>

        {/* الأزرار الاحترافية (مرتبة وعملية للشاشات الصغيرة) */}
        <div className="w-full space-y-3 pt-2">
          
          {/* الزر الأول: اكتشف مزايا المنصة */}
          <Link href="/explore" className="block w-full group">
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black p-3.5 rounded-xl shadow-lg transition-all font-bold">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/10 rounded-lg">
                  <Compass size={20} />
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-black/70 font-bold">استكشاف السياحة</span>
                  <span className="text-sm font-black">مزايا المنصة والو وجهات</span>
                </div>
              </div>
              <span className="text-xs font-black pl-1">←</span>
            </div>
          </Link>

          {/* الزر الثاني: الخريطة التفاعلية */}
          <Link href="/map" className="block w-full group">
            <div className="flex items-center justify-between bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 text-white p-3.5 rounded-xl shadow-lg transition-all font-bold">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                  <Map size={20} />
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-sky-400 font-bold">الملاحة الذكية</span>
                  <span className="text-sm font-black">خريطة تفاعلية داخلية</span>
                </div>
              </div>
              <span className="text-xs font-black text-sky-400 pl-1">←</span>
            </div>
          </Link>

        </div>

      </div>

      {/* حقوق النشر في الأسفل */}
      <div className="relative z-10 text-[10px] text-gray-500 font-medium text-center">
        جميع الحقوق محفوظة © {new Date().getFullYear()} - سوف 360
      </div>

    </main>
  );
}
