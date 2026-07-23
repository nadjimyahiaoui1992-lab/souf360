import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b121f] px-4 text-center">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#141c2c]/90 p-8 shadow-2xl">
        <h2 className="text-4xl font-black text-orange-500">404</h2>
        <p className="mt-2 text-lg font-semibold text-white">الصفحة غير موجودة</p>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يمكنك العودة إلى الصفحة الرئيسية لاستكشاف المزيد.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-[#0b121f] transition hover:bg-orange-600"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
