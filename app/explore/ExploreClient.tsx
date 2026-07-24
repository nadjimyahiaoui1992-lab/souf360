'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass, MapPin, Navigation, Sparkles, ImageIcon,
  Landmark as LandmarkIcon, ChevronLeft, ChevronRight, X,
  MessageSquareHeart, Loader2, Camera, Quote, Sun, Award, Clock3,
  Star, Menu, Phone, Mail, ExternalLink, PenSquare, Globe2,
  Mountain, Gem, HeartHandshake, Sparkle,
} from 'lucide-react';

// نكتفي برابط Supabase فقط لتنسيق مسار الصور (لا حاجة لإنشاء اتصال كامل غير مستخدم هنا)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

type Place = {
  id: string | number;
  name: string;
  category?: string;
  description?: string;
  cover_url?: any;
  image_url?: any;
  gallery?: any;
  lat?: number;
  lng?: number;
};

type OldMemory = {
  id: string | number;
  image_url: any;
  caption?: string;
  year?: string | number;
};

type Testimonial = {
  id: string | number;
  name?: string;
  message: string;
  photos?: any;
  created_at?: string;
};

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1542601098-8fc114e148e2?q=80&w=800&auto=format&fit=crop';

const HERO_IMG =
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1920&auto=format&fit=crop';

// ============================= دالة تحليل الصور الخارقة =============================
function parseImages(input: any): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map((item) => String(item).replace(/["'[\]]/g, '').trim()).filter(Boolean);
  }

  if (typeof input === 'object') {
    try {
      return Object.values(input).flatMap((v) => parseImages(v));
    } catch {
      return [];
    }
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];

    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseImages(parsed);
      } catch {
        // تجاهل الخطأ والمتابعة
      }
    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((s) => s.replace(/["'[\]]/g, '').trim())
        .filter(Boolean);
    }

    const cleaned = trimmed.replace(/["'[\]]/g, '').trim();
    if (cleaned) return [cleaned];
  }

  return [];
}

function getPlaceImages(place: Place): string[] {
  const imagesSet = new Set<string>();
  const BUCKET_NAME = 'IMAGES';

  const formatUrl = (img: string) => {
    if (img.startsWith('http')) return img;
    const cleanImgPath = img.replace(/^\/+/, '');
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${cleanImgPath}`;
  };

  if (place.image_url) {
    parseImages(place.image_url).forEach((img) => imagesSet.add(formatUrl(img)));
  }

  if (place.cover_url) {
    parseImages(place.cover_url).forEach((img) => imagesSet.add(formatUrl(img)));
  }

  if (place.gallery) {
    parseImages(place.gallery).forEach((img) => imagesSet.add(formatUrl(img)));
  }

  const list = Array.from(imagesSet);
  return list.length > 0 ? list : [FALLBACK_IMG];
}

function initialsOf(name?: string) {
  if (!name) return 'ز';
  return name.trim().charAt(0);
}

/* ============================= الهوية البصرية الموحّدة ============================= */
function LogoMark({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.4" />
      <line x1="24" y1="4" x2="24" y2="9" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      <line x1="24" y1="39" x2="24" y2="44" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      <line x1="4" y1="24" x2="9" y2="24" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      <line x1="39" y1="24" x2="44" y2="24" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
      <path d="M15 33 L15 24.5 Q15 13.5 24 11 Q33 13.5 33 24.5 L33 33 Z" fill="currentColor" />
      <rect x="12" y="33" width="24" height="3.4" rx="1.2" fill="currentColor" />
      <line x1="24" y1="11" x2="24" y2="6.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="24" cy="5.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function DomeSkyline({ fill = '#0a0908', className = '' }: { fill?: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 120" preserveAspectRatio="none" fill="none">
      <path
        d="M0 120 L0 74 Q20 74 20 60 A18 18 0 0 1 56 60 Q56 74 76 74 L110 74 Q110 60 122 60 A14 14 0 0 1 150 60 Q150 74 162 74 L205 74 Q205 52 222 52 A24 24 0 0 1 270 52 Q270 74 287 74 L330 74 Q330 62 342 62 A15 15 0 0 1 372 62 Q372 74 384 74 L430 74 Q430 46 452 46 A28 28 0 0 1 508 46 Q508 74 530 74 L575 74 Q575 60 587 60 A14 14 0 0 1 615 60 Q615 74 627 74 L672 74 Q672 50 692 50 A26 26 0 0 1 744 50 Q744 74 764 74 L805 74 Q805 62 817 62 A15 15 0 0 1 847 62 Q847 74 859 74 L905 74 Q905 44 928 44 A29 29 0 0 1 986 44 Q986 74 1009 74 L1050 74 Q1050 60 1062 60 A14 14 0 0 1 1090 60 Q1090 74 1102 74 L1200 74 L1200 120 Z"
        fill={fill}
      />
    </svg>
  );
}

function DuneDivider() {
  return (
    <div className="relative z-10 w-full overflow-hidden h-6 opacity-40" aria-hidden="true">
      <svg className="dune-drift w-[140%]" viewBox="0 0 1400 24" preserveAspectRatio="none" fill="none">
        <path
          d="M0 18 Q 35 4, 70 18 T 140 18 T 210 18 T 280 18 T 350 18 T 420 18 T 490 18 T 560 18 T 630 18 T 700 18 T 770 18 T 840 18 T 910 18 T 980 18 T 1050 18 T 1120 18 T 1190 18 T 1260 18 T 1330 18 T 1400 18"
          stroke="#f59e0b"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

function SectionEyebrow({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  action,
}: {
  icon: any;
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
          <Icon className="text-amber-500" size={19} strokeWidth={2} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-amber-400/80 tracking-wide">{eyebrow}</span>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">{title}</h2>
          <p className="text-stone-400 text-sm">{subtitle}</p>
        </div>
      </div>
      {action && <div className="shrink-0 hidden sm:block">{action}</div>}
    </div>
  );
}

/** زر عرض الكل موحّد الشكل، يُستخدم كإجراء ثانوي أعلى الأقسام */
function ViewAllButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="btn-focus inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 px-4 py-2 rounded-xl transition-all duration-200"
    >
      عرض الكل <ChevronLeft size={14} />
    </button>
  );
}

/* ============================= التبديل بين اللغات ============================= */
function LanguageSwitcher() {
  const langs = [
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'ar', flag: '🇩🇿', label: 'العربية' },
  ] as const;
  const [active, setActive] = useState<'fr' | 'en' | 'ar'>('ar');
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="btn-focus flex items-center gap-1.5 text-xs font-bold text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-all duration-200"
      >
        <Globe2 size={13} />
        <span>{langs.find((l) => l.code === active)?.flag}</span>
        <span className="hidden sm:inline">{langs.find((l) => l.code === active)?.label}</span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute top-full mt-2 right-0 z-50 w-40 bg-[#171310] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-riseIn"
        >
          {langs.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={active === l.code}
              onMouseDown={() => setActive(l.code)}
              className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-right transition-colors ${
                active === l.code ? 'bg-amber-500/15 text-amber-300' : 'text-stone-300 hover:bg-white/5'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExploreClient({
  places,
  oldMemories,
  testimonials,
}: {
  places: Place[];
  oldMemories: OldMemory[];
  testimonials: Testimonial[];
}) {
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [memoriesExpanded, setMemoriesExpanded] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0a0908] text-white selection:bg-amber-500/30"
      style={{ fontFamily: "'Tajawal', 'IBM Plex Sans Arabic', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap');
        @keyframes riseIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeScale { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes driftSlow { from { transform: translateX(0); } to { transform: translateX(-4%); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes rippleAnim { to { transform: scale(3.2); opacity: 0; } }
        .rise-1 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .rise-2 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .rise-3 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
        .rise-4 { animation: riseIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
        .animate-riseIn { animation: riseIn 0.25s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-fadeScale { animation: fadeScale 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .dune-drift { animation: driftSlow 40s linear infinite alternate; }
        .skeleton-shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%); background-size: 800px 100%; animation: shimmer 1.6s linear infinite; }
        .glass-card { background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015)); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        .grad-border { position: relative; }
        .grad-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(245,158,11,0.45), rgba(255,255,255,0.05) 40%, rgba(20,184,166,0.25)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .btn-focus { outline: none; }
        .btn-focus:focus-visible { box-shadow: 0 0 0 3px rgba(245,158,11,0.45); }
        .ripple-btn { position: relative; overflow: hidden; }
        .ripple-span { position: absolute; border-radius: 9999px; background: rgba(255,255,255,0.5); transform: scale(0); pointer-events: none; animation: rippleAnim 0.6s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .rise-1, .rise-2, .rise-3, .rise-4, .dune-drift, .animate-riseIn, .animate-fadeScale, .skeleton-shimmer, .ripple-span { animation: none !important; }
        }
      `}</style>

      <TopNav />
      <Hero places={places} oldMemories={oldMemories} testimonials={testimonials} />
      <DuneDivider />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-14 sm:space-y-20 pb-20">
        <ServiceFeatures />
        <LandmarksSection places={places} onOpen={setActivePlace} />
        <TraditionsSection />
        <MemoriesGallery
          memories={oldMemories}
          expanded={memoriesExpanded}
          onToggle={() => setMemoriesExpanded((v) => !v)}
        />
        <WilayaIntro />
        <VisitorExperiences testimonials={testimonials} onShare={() => setShareOpen(true)} />
      </div>

      <Footer />

      {activePlace && <PlaceModal place={activePlace} onClose={() => setActivePlace(null)} />}
      {shareOpen && <ShareExperienceModal onClose={() => setShareOpen(false)} />}
    </div>
  );
}

/* ============================= زر بتأثير Ripple موحّد ============================= */
function RippleButton({
  children,
  className = '',
  onClick,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`ripple-btn btn-focus disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
      {ripples.map((rp) => (
        <span key={rp.id} className="ripple-span" style={{ left: rp.x - 6, top: rp.y - 6, width: 12, height: 12 }} />
      ))}
    </button>
  );
}

function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0908]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <LogoMark size={26} className="text-amber-500" />
          <span className="text-xl font-black tracking-tight text-white">
            سوف <span className="text-amber-500">360</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scrollTo('top')}
            className="btn-focus text-sm font-bold text-white bg-white/10 px-3.5 py-1.5 rounded-full transition-colors"
          >
            الرئيسية
          </button>
          <button
            onClick={() => scrollTo('about-wilaya')}
            className="btn-focus text-sm font-bold text-stone-400 hover:text-white hover:bg-white/5 px-3.5 py-1.5 rounded-full transition-colors"
          >
            من نحن
          </button>
          <button
            onClick={() => scrollTo('site-footer')}
            className="btn-focus text-sm font-bold text-stone-400 hover:text-white hover:bg-white/5 px-3.5 py-1.5 rounded-full transition-colors"
          >
            اتصل بنا
          </button>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="فتح القائمة"
            aria-expanded={menuOpen}
            className="btn-focus md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden max-w-6xl mx-auto mt-3 flex flex-col gap-1 animate-riseIn">
          <button onClick={() => scrollTo('top')} className="btn-focus text-right text-sm font-bold text-white bg-white/10 px-4 py-2.5 rounded-xl">
            الرئيسية
          </button>
          <button onClick={() => scrollTo('about-wilaya')} className="btn-focus text-right text-sm font-bold text-stone-300 hover:bg-white/5 px-4 py-2.5 rounded-xl">
            من نحن
          </button>
          <button onClick={() => scrollTo('site-footer')} className="btn-focus text-right text-sm font-bold text-stone-300 hover:bg-white/5 px-4 py-2.5 rounded-xl">
            اتصل بنا
          </button>
        </div>
      )}
    </nav>
  );
}

/* ============================= الهيرو ============================= */
function Hero({
  places,
  oldMemories,
  testimonials,
}: {
  places: Place[];
  oldMemories: OldMemory[];
  testimonials: Testimonial[];
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const stats = [
    { icon: Compass, label: 'معالم موثّقة', value: `${places.length}+` },
    { icon: Camera, label: 'ذكريات أرشيفية', value: `${oldMemories.length}+` },
    { icon: Award, label: 'تجارب زوار', value: `${testimonials.length}+` },
    { icon: Clock3, label: 'محدّث باستمرار', value: '24/7' },
  ];

  return (
    <header id="top" className="relative w-full overflow-hidden">
      <div className="relative h-[62vh] sm:h-[70vh] min-h-[460px] max-h-[720px] w-full">
        {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />}
        <img
          src={HERO_IMG}
          alt="غروب الشمس فوق كثبان ولاية الوادي الذهبية وقصورها الصحراوية"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="eager"
          fetchPriority="high"
          onLoad={() => setImgLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-[#0a0908]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay" />

        <DomeSkyline fill="#0a0908" className="absolute inset-x-0 bottom-0 w-full h-20 sm:h-28 opacity-90 pointer-events-none" />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col justify-center pb-24 sm:pb-28 text-center items-center">
          <div className="rise-1 inline-flex items-center gap-2 w-max bg-amber-500/15 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-amber-300 text-[11px] font-bold tracking-wide backdrop-blur-md mb-5">
            <Sun size={13} className="text-amber-400" />
            <span>الجزائر — ولاية الوادي (السوف)</span>
          </div>

          <h1 className="rise-2 text-3xl sm:text-5xl md:text-6xl font-black leading-[1.15] mb-4 max-w-3xl drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)]">
            اكتشف سحر ولاية الوادي
          </h1>
          <p className="rise-3 text-amber-200/90 text-sm sm:text-lg max-w-xl leading-relaxed font-bold mb-4">
            حيث تلتقي الطبيعة الخلابة بالتراث العريق
          </p>
          <p className="rise-3 text-stone-300 text-xs sm:text-base max-w-2xl leading-relaxed font-medium">
            ولاية الوادي، جوهرة الجنوب الجزائري، تزخر بمناظر طبيعية خلابة كالكثبان الرملية
            والواحات الخضراء، وتنصهر بتلاقح التراث العريق وثقافة عيش أصيلة تجعلها وجهة سياحية
            فريدة من نوعها.
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-white/10 glass-card grad-border border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center justify-center gap-1.5 py-4 sm:py-5 px-2 text-center hover:bg-white/5 transition-colors">
              <Icon className="text-amber-400" size={19} strokeWidth={2} />
              <span className="text-white/90 font-semibold text-[11px] sm:text-sm">{label}</span>
              <span className="text-amber-500 font-extrabold text-base sm:text-lg">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ============================= بطاقات الخدمات ============================= */
function ServiceFeatures() {
  const features = [
    { icon: Mountain, title: 'طبيعة خلابة', desc: 'كثبان رملية ذهبية وواحات خضراء ساحرة' },
    { icon: LandmarkIcon, title: 'تراث عريق', desc: 'معالم تاريخية عريقة وقصور صحراوية بديعة' },
    { icon: Gem, title: 'ثقافة أصيلة', desc: 'عادات وتقاليد متوارثة وحرف يدوية فريدة' },
    { icon: HeartHandshake, title: 'ضيافة سخية', desc: 'شعب كريم يرحب بزواره في كل مكان' },
    { icon: Sparkle, title: 'تجارب مميزة', desc: 'مغامرات صحراوية وتجارب لا تُنسى' },
  ];

  return (
    <section aria-label="خدمات ومزايا ولاية الوادي" className="rise-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            tabIndex={0}
            className="btn-focus group glass-card grad-border border border-white/5 rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center gap-2.5 hover:-translate-y-1.5 hover:border-amber-500/30 transition-all duration-300 cursor-default"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300">
              <Icon className="text-amber-400" size={20} strokeWidth={1.8} />
            </div>
            <h3 className="text-white font-bold text-sm">{title}</h3>
            <p className="text-stone-400 text-[11px] leading-relaxed hidden sm:block">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================= قسم المعالم (بطاقة مميزة + شبكة) ============================= */
function StarRating({ value = 4.8 }: { value?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`تقييم ${value} من 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-stone-600'}
        />
      ))}
      <span className="text-amber-300 font-bold text-xs mr-1">{value}</span>
    </div>
  );
}

function FeaturedPlaceCard({
  place,
  onOpen,
  onNavigate,
  onLocate,
}: {
  place: Place;
  onOpen: () => void;
  onNavigate: () => void;
  onLocate: () => void;
}) {
  const images = getPlaceImages(place);
  const cover = images[0];
  const thumbs = images.slice(1, 4);
  const remaining = Math.max(images.length - 4, 0);

  return (
    <div className="glass-card grad-border border border-white/10 rounded-[1.75rem] overflow-hidden shadow-2xl animate-fadeScale">
      <div className="grid md:grid-cols-2">
        <div className="relative">
          <button
            onClick={onOpen}
            className="btn-focus block w-full h-56 sm:h-72 md:h-full relative group"
            aria-label={`عرض معرض صور ${place.name}`}
          >
            <img
              src={cover}
              alt={place.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMG;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">
              <ImageIcon size={12} /> معرض الصور
            </span>
          </button>

          {thumbs.length > 0 && (
            <div className="absolute bottom-3 inset-x-3 flex gap-2">
              {thumbs.map((t, i) => (
                <button
                  key={i}
                  onClick={onOpen}
                  className="btn-focus relative h-14 flex-1 rounded-lg overflow-hidden border border-white/20 shadow-md"
                >
                  <img src={t} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
              {remaining > 0 && (
                <button
                  onClick={onOpen}
                  className="btn-focus relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-white/20 bg-black/70 flex items-center justify-center text-white font-black text-sm"
                >
                  +{remaining}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-7 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            {place.category && (
              <span className="bg-amber-500/20 text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
                {place.category}
              </span>
            )}
            <StarRating value={4.8} />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{place.name}</h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-5 line-clamp-4">
            {place.description}
          </p>

          {typeof place.lat === 'number' && typeof place.lng === 'number' && (
            <p className="flex items-center gap-1.5 text-stone-400 text-xs mb-5">
              <MapPin size={13} className="text-amber-400" />
              {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
            </p>
          )}

          <div className="mt-auto flex flex-col sm:flex-row gap-2.5">
            <RippleButton
              onClick={onLocate}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600/20 hover:bg-teal-600/30 active:scale-95 text-teal-300 font-bold text-xs sm:text-sm py-3 rounded-xl border border-teal-500/30 transition-all duration-200"
            >
              <MapPin size={16} /> موقع المعلم على الخريطة
            </RippleButton>
            <RippleButton
              onClick={onNavigate}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-xs sm:text-sm py-3 rounded-xl transition-all duration-200 shadow-lg"
            >
              <Navigation size={16} /> الاتجاهات
            </RippleButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandmarksSection({
  places,
  onOpen,
}: {
  places: Place[];
  onOpen: (p: Place) => void;
}) {
  const router = useRouter();
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const featured = places[featuredIdx];

  const step = (dir: 1 | -1) => {
    if (places.length === 0) return;
    setFeaturedIdx((i) => (i + dir + places.length) % places.length);
  };

  const goDirections = (place: Place) => {
    router.push(`/map?destination=${encodeURIComponent(place.name)}&autoRoute=true`);
  };

  const goLocate = (place: Place) => {
    router.push(`/map?destination=${encodeURIComponent(place.name)}`);
  };

  return (
    <section id="landmarks">
      <SectionEyebrow
        icon={MapPin}
        eyebrow="الوجهات"
        title="معالم ولاية الوادي"
        subtitle="أروع الوجهات السياحية والتاريخية في ولاية الوادي"
        action={<ViewAllButton onClick={() => setShowAll((v) => !v)} />}
      />
      <div className="sm:hidden mb-4">
        <ViewAllButton onClick={() => setShowAll((v) => !v)} />
      </div>

      {places.length === 0 ? (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-stone-400">لا توجد معالم مضافة حالياً.</p>
        </div>
      ) : (
        <>
          {featured && (
            <div className="relative mb-8">
              <FeaturedPlaceCard
                key={featured.id}
                place={featured}
                onOpen={() => onOpen(featured)}
                onNavigate={() => goDirections(featured)}
                onLocate={() => goLocate(featured)}
              />

              {places.length > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    onClick={() => step(-1)}
                    aria-label="المعلم السابق"
                    className="btn-focus w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 border border-white/10 flex items-center justify-center text-white transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {places.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => setFeaturedIdx(i)}
                        aria-label={`عرض ${p.name}`}
                        className={`btn-focus h-1.5 rounded-full transition-all duration-300 ${
                          i === featuredIdx ? 'w-6 bg-amber-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => step(1)}
                    aria-label="المعلم التالي"
                    className="btn-focus w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 border border-white/10 flex items-center justify-center text-white transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {showAll && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-riseIn">
              {places.map((place) => {
                const placeImgs = getPlaceImages(place);
                const coverImg = placeImgs[0];

                return (
                  <button
                    key={place.id}
                    onClick={() => onOpen(place)}
                    className="btn-focus group relative text-right rounded-[1.5rem] overflow-hidden border border-white/5 bg-[#15120e] shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 hover:border-amber-500/20 transition-all duration-300"
                  >
                    <div className="relative h-48">
                      <img
                        src={coverImg}
                        alt={place.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMG;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#15120e] via-[#15120e]/20 to-transparent" />
                      {place.category && (
                        <span className="absolute top-3 right-3 bg-black/40 backdrop-blur text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/20">
                          {place.category}
                        </span>
                      )}
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-bold mb-1 text-white">{place.name}</h3>
                      <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed mb-4">
                        {place.description}
                      </p>
                      <div className="w-full bg-white/5 group-hover:bg-amber-500 group-hover:text-black text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5">
                        عرض التفاصيل والملاحة <ChevronLeft size={16} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function PlaceModal({ place, onClose }: { place: Place; onClose: () => void }) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [navigateError, setNavigateError] = useState('');
  const images = useMemo(() => getPlaceImages(place), [place]);

  const handleInternalNavigate = () => {
    if (!place.name) {
      setNavigateError('اسم المعلم غير متوفر حالياً.');
      return;
    }
    setNavigating(true);
    router.push(`/map?destination=${encodeURIComponent(place.name)}&autoRoute=true`);
  };

  const handleLocate = () => {
    if (!place.name) {
      setNavigateError('اسم المعلم غير متوفر حالياً.');
      return;
    }
    router.push(`/map?destination=${encodeURIComponent(place.name)}`);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-[#171310] rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 shadow-2xl animate-fadeScale"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="btn-focus absolute top-4 left-4 z-30 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 transition shadow-lg"
        >
          <X size={18} />
        </button>

        <div className="p-4 sm:p-6 pb-2 border-b border-white/5">
          <p className="text-xs text-amber-400 font-bold mb-2 flex items-center gap-1.5">
            <Camera size={14} /> اسحب يميناً ويساراً لمشاهدة صور المعلم ({images.length})
          </p>
          <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-thin scrollbar-thumb-amber-500/50">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="shrink-0 w-64 sm:w-72 h-44 sm:h-52 rounded-2xl overflow-hidden snap-center border border-white/10 relative shadow-md bg-black/40"
              >
                <img
                  src={imgUrl}
                  alt={`${place.name} - صورة ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between mb-3">
            {place.category && (
              <span className="w-max bg-amber-500/20 text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/20 inline-block">
                {place.category}
              </span>
            )}
            <StarRating value={4.8} />
          </div>
          <h3 className="text-xl sm:text-2xl font-black mb-2 text-white">{place.name}</h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">{place.description}</p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <RippleButton
              onClick={handleLocate}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600/20 hover:bg-teal-600/30 active:scale-95 text-teal-300 font-bold py-3.5 rounded-2xl border border-teal-500/30 transition-all text-sm"
            >
              <MapPin size={18} /> موقع المعلم على الخريطة
            </RippleButton>
            <RippleButton
              onClick={handleInternalNavigate}
              disabled={navigating}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-2xl transition-all shadow-lg text-sm"
            >
              {navigating ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> جارٍ فتح الخريطة...
                </>
              ) : (
                <>
                  <Navigation size={18} /> ابدأ الملاحة
                </>
              )}
            </RippleButton>
          </div>
          {navigateError && <p className="text-amber-300 text-xs mt-2 text-center">{navigateError}</p>}
        </div>
      </div>
    </div>
  );
}

/* ============================= العادات والتقاليد ============================= */
function TraditionsSection() {
  const traditions = [
    {
      title: 'الزي التقليدي الصحراوي',
      desc: 'زي أصيل يعكس هوية المنطقة وتراثها العريق',
      img: 'https://images.unsplash.com/photo-1590766940554-153d0973ce68?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'صناعة الحلي الفضية',
      desc: 'حرفة تقليدية متوارثة تُصنع بأنامل ماهرة',
      img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'مهرجان الوادي السياحي',
      desc: 'احتفال سنوي يعكس الثقافة المحلية الأصيلة',
      img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'الأطباق التقليدية',
      desc: 'أطباق شهية تعبر عن المذاق الأصيل للمنطقة',
      img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'فن الحناء',
      desc: 'زينة تقليدية ذات رموز وعادات جميلة',
      img: 'https://images.unsplash.com/photo-1610030181087-540f6a5f9518?q=80&w=600&auto=format&fit=crop',
    },
  ];

  return (
    <section id="traditions">
      <SectionEyebrow
        icon={Sparkles}
        eyebrow="الهوية"
        title="عادات وتقاليد ولاية الوادي"
        subtitle="إرث ثقافي أصيل توارثته الأجيال جيلاً بعد جيل"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {traditions.map((t) => (
          <div
            key={t.title}
            className="group relative rounded-2xl overflow-hidden border border-white/5 h-40 sm:h-48 shadow-lg hover:-translate-y-1 hover:border-amber-500/30 transition-all duration-300"
          >
            <img
              src={t.img}
              alt={t.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <h3 className="text-white font-bold text-xs sm:text-sm mb-0.5">{t.title}</h3>
              <p className="text-stone-300 text-[10px] leading-relaxed hidden sm:block">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================= ذكريات قديمة ============================= */
function MemoriesGallery({
  memories,
  expanded,
  onToggle,
}: {
  memories: OldMemory[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const visible = expanded ? memories : memories.slice(0, 8);

  return (
    <section id="memories">
      <SectionEyebrow
        icon={Camera}
        eyebrow="الأرشيف"
        title="ذكريات في ولاية الوادي"
        subtitle="لمحات من الأرشيف تحكي وجه الوادي عبر الزمن"
        action={memories.length > 8 ? <ViewAllButton onClick={onToggle} /> : undefined}
      />
      {memories.length > 8 && (
        <div className="sm:hidden mb-4">
          <ViewAllButton onClick={onToggle} />
        </div>
      )}

      {memories.length === 0 ? (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-stone-400">لم تُضَف صور أرشيفية بعد.</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {visible.map((m) => {
            const mImgs = parseImages(m.image_url);
            const imgSrc = mImgs[0] || FALLBACK_IMG;

            return (
              <div
                key={m.id}
                className="relative break-inside-avoid rounded-xl overflow-hidden border border-white/5 group"
              >
                <img
                  src={imgSrc}
                  alt={m.caption || 'ذكرى قديمة'}
                  loading="lazy"
                  className="w-full object-cover sepia-[.35] contrast-105 group-hover:sepia-0 transition-all duration-500"
                />
                {m.year && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-amber-300 border border-white/10">
                    {m.year}
                  </div>
                )}
                {m.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-stone-200">
                    {m.caption}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function WilayaIntro() {
  return (
    <section
      id="about-wilaya"
      className="bg-gradient-to-br from-amber-950/20 via-[#15120e] to-black p-6 sm:p-10 rounded-[2rem] border border-amber-500/10"
    >
      <h3 className="text-xl sm:text-2xl font-black mb-3 text-amber-400">عن ولاية الوادي (السوف)</h3>
      <p className="text-stone-300 text-sm leading-relaxed">
        تتميز مدينة الوادي بطراز معماري فريد يعتمد على القباب (الأسقف المقببة) التي صُممت خصيصاً لمقاومة الحرارة الشديدة، إلى جانب غيطان النخيل الفريدة التي تُغرس في الكثبان الرملية (الغيطان).
      </p>
    </section>
  );
}

/* ============================= آراء الزوار ============================= */
function VisitorExperiences({
  testimonials,
  onShare,
}: {
  testimonials: Testimonial[];
  onShare: () => void;
}) {
  return (
    <section id="testimonials">
      <SectionEyebrow
        icon={MessageSquareHeart}
        eyebrow="الزوار"
        title="آراء واقتراحات الزوار"
        subtitle="ما يقوله الزوار عن زيارتهم لولاية الوادي"
        action={
          <RippleButton
            onClick={onShare}
            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shrink-0 flex items-center gap-1.5"
          >
            <PenSquare size={16} /> كتابة رأي
          </RippleButton>
        }
      />
      <div className="sm:hidden mb-4">
        <RippleButton
          onClick={onShare}
          className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-1.5"
        >
          <PenSquare size={16} /> كتابة رأي
        </RippleButton>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-stone-400">لا توجد تجارب منشورة بعد. كن أول المشاركين!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="glass-card grad-border p-5 rounded-2xl border border-white/5 shadow-md flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-300 font-black text-sm shrink-0">
                  {initialsOf(t.name)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white text-sm block truncate">{t.name || 'زائر كريم'}</span>
                  <StarRating value={5} />
                </div>
                <Quote size={22} className="text-amber-500/20 mr-auto shrink-0" />
              </div>
              <p className="text-stone-300 text-sm leading-relaxed mb-4">{t.message}</p>
              <div className="text-xs text-stone-500 border-t border-white/5 pt-3">
                {t.created_at ? new Date(t.created_at).toLocaleDateString('ar-DZ') : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ShareExperienceModal({ onClose }: { onClose: () => void }) {
  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="bg-[#171310] w-full max-w-md rounded-3xl border border-white/10 p-6 relative shadow-2xl animate-fadeScale"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="إغلاق" className="btn-focus absolute top-4 left-4 text-stone-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-lg font-black mb-4 text-white">شارك تجربتك في سوف 360</h3>
        <p className="text-stone-400 text-xs mb-4">قريباً سيتم تفعيل نموذج المشاركة المباشر لإضافة قصتك وصورك.</p>
        <RippleButton onClick={onClose} className="w-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
          إغلاق
        </RippleButton>
      </div>
    </div>
  );
}

/* ============================= الفوتر ============================= */
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className="border-t border-white/5 bg-[#070605]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <LogoMark size={24} className="text-amber-500" />
            <span className="text-lg font-black text-white">
              سوف <span className="text-amber-500">360</span>
            </span>
          </div>
          <p className="text-stone-400 text-xs leading-relaxed">
            منصة سياحية ذكية لولاية الوادي، اكتشف جمال الوادي ومعالمها السياحية وتراثها العريق من خلال منصة رقمية ذكية.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">روابط سريعة</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li>
              <a href="#top" className="btn-focus hover:text-amber-400 transition-colors">الرئيسية</a>
            </li>
            <li>
              <a href="#landmarks" className="btn-focus hover:text-amber-400 transition-colors">المعالم السياحية</a>
            </li>
            <li>
              <a href="#traditions" className="btn-focus hover:text-amber-400 transition-colors">العادات والتقاليد</a>
            </li>
            <li>
              <a href="#about-wilaya" className="btn-focus hover:text-amber-400 transition-colors">من نحن</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">تواصل معنا</h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li className="flex items-center gap-2">
              <Phone size={13} className="text-amber-400 shrink-0" />
              <a href="tel:+213323123456" className="btn-focus hover:text-amber-400 transition-colors" dir="ltr">
                +213 32 31 23 456
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={13} className="text-amber-400 shrink-0" />
              <a href="mailto:info@souf360.dz" className="btn-focus hover:text-amber-400 transition-colors">
                info@souf360.dz
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={13} className="text-amber-400 shrink-0" />
              <span>مدينة الوادي، الجزائر</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">تطبيق الهاتف</h4>
          <div className="flex flex-col gap-2">
            <a
              href="#"
              className="btn-focus flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3.5 py-2.5 transition-colors"
            >
              <ExternalLink size={16} className="text-amber-400" />
              <span className="text-xs font-semibold text-stone-200">Google Play</span>
            </a>
            <a
              href="#"
              className="btn-focus flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3.5 py-2.5 transition-colors"
            >
              <ExternalLink size={16} className="text-amber-400" />
              <span className="text-xs font-semibold text-stone-200">App Store</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {year} سوف 360 - جميع الحقوق محفوظة</p>
          <p>منصة السياحة التفاعلية لولاية الوادي</p>
        </div>
      </div>
    </footer>
  );
}
