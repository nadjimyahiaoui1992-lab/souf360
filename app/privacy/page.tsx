import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | سوف 360",
  description: "سياسة الخصوصية الخاصة بمنصة سوف 360 وكيفية التعامل مع بيانات الموقع الجغرافي وبيانات الزوار.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "البيانات التي نجمعها",
    body:
      "نطلب إذن الوصول إلى موقعك الجغرافي (GPS) فقط عند استخدامك لميزة الملاحة داخل الخريطة التفاعلية، لغرض حساب المسار وعرض المسافة والمدة التقريبية إلى المعلم الذي تختاره. لا نجمع أي بيانات شخصية أخرى (الاسم، البريد الإلكتروني، رقم الهاتف) إلا إذا قدّمتها بنفسك عبر نموذج تواصل أو تقييم.",
  },
  {
    title: "كيف نستخدم موقعك الجغرافي",
    body:
      "يُستخدم موقعك فقط داخل جلسة التصفح الحالية لعرضه على الخريطة وحساب المسار نحو المعالم السياحية. لا يتم تخزين إحداثيات موقعك على خوادمنا ولا مشاركتها مع أي طرف ثالث لأغراض تسويقية.",
  },
  {
    title: "ملفات تعريف الارتباط (Cookies)",
    body:
      "تُستخدم بعض ملفات تعريف الارتباط الضرورية فقط للحفاظ على جلسة تسجيل الدخول الخاصة بلوحة التحكم الإدارية. لا نستخدم ملفات تعريف ارتباط لأغراض تتبع إعلاني.",
  },
  {
    title: "حقوقك",
    body:
      "يمكنك في أي وقت إلغاء إذن الموقع الجغرافي من إعدادات متصفحك أو هاتفك، وسيستمر عمل الموقع بشكل طبيعي مع تعطّل ميزة الملاحة فقط. لأي استفسار حول بياناتك يمكنك التواصل معنا عبر صفحة «من نحن».",
  },
  {
    title: "تحديثات هذه السياسة",
    body:
      "قد تُحدَّث هذه السياسة بين الحين والآخر لمواكبة تطور المنصة. ننصح بمراجعة هذه الصفحة دورياً.",
  },
];

export default function PrivacyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#0b121f] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-bold mb-10">
          ← العودة إلى الرئيسية
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-tr from-orange-500 to-amber-400 p-2 rounded-xl">
            <ShieldCheck className="text-[#0b121f]" size={22} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">سياسة الخصوصية</h1>
        </div>

        <p className="text-gray-400 text-sm mb-10">آخر تحديث: يوليو 2026</p>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-[#141c2c]/80 border border-white/10 rounded-2xl p-5">
              <h2 className="font-bold mb-2">{s.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
