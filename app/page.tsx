import Link from 'next/link';
import { MapPin, Map, Compass, Award, Clock, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between text-white overflow-hidden font-sans" dir="rtl">
      
      {/* خلفية صورة الصحراء مع التدرج الداكن */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop')` 
        }}
      >
        {/* طبقات التعتيم والتدرج اللوني البرتقالي الصحراوي */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-amber-950/20 mix-blend-overlay"></div>
      </div>

      {/* مساحة علوية فارغة للتوازن */}
      <div className="relative z-10 pt-8"></div>

      {/* المحتوى الرئيسي في المنتصف */}
      <div className="relative z-10 max-w-4xl w-full text-center px-4 space-y-6 my-auto">
        
        {/* العنوان الشعار */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-4 py-1.5 rounded-full text-amber-300 text-xs font-bold backdrop-blur-md shadow-lg">
            <Sparkles size={14} className="text-amber-400" />
            <span>المنصة السياحية الرسمية</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-md">
            سوف <span className="text-amber-500">360</span>
          </h1>

          <p className="text-lg md:text-2xl font-bold text-gray-100 drop-shadow">
            اكتشف سحر الوادي... حيث تبدأ الحكاية وتنتهي الذكريات
          </p>

          <p className="text-xs md:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
            مع تموج الرمال الذهبية وفيطال النخيل وقبة الصحراء
          </p>
        </div>

        {/* أزرار التوجيه الرئيسية */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          
          {/* زر استكشاف المعالم */}
          <Link
            href="/explore"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-amber-600/90 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl border border-amber-500/30 backdrop-blur-md transition-all duration-300 hover:scale-105 text-sm"
          >
            <MapPin size={18} className="text-amber-200" />
            <span>استكشف المعالم</span>
          </Link>

          {/* زر عرض الخريطة */}
          <Link
            href="/map"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-900/60 hover:bg-slate-900/80 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 text-sm"
          >
            <Map size={18} className="text-sky-400" />
            <span>عرض الخريطة</span>
          </Link>

        </div>

      </div>

      {/* شريط الإحصائيات السفلي */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-8 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          
          <div className="flex flex-col items-center text-center space-y-1">
            <Compass className="text-amber-400" size={22} />
            <span className="text-white font-bold text-sm">معالم سياحية</span>
            <span className="text-amber-500 font-extrabold text-base">360+</span>
          </div>

          <div className="flex flex-col items-center text-center space-y-1">
            <MapPin className="text-amber-400" size={22} />
            <span className="text-white font-bold text-sm">تجارب متنوعة</span>
            <span className="text-amber-500 font-extrabold text-base">50+</span>
          </div>

          <div className="flex flex-col items-center text-center space-y-1">
            <Award className="text-amber-400" size={22} />
            <span className="text-white font-bold text-sm">أماكن موثقة</span>
            <span className="text-amber-500 font-extrabold text-base">100%</span>
          </div>

          <div className="flex flex-col items-center text-center space-y-1">
            <Clock className="text-amber-400" size={22} />
            <span className="text-white font-bold text-sm">محدث باستمرار</span>
            <span className="text-amber-500 font-extrabold text-base">24/7</span>
          </div>

        </div>
      </div>

    </main>
  );
}
