"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b121f] px-4 text-center">
      <div className="w-full max-w-md rounded-[28px] border border-rose-500/20 bg-[#141c2c]/90 p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white">حدث خطأ غير متوقع</h2>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          نعتذر، لم نتمكن من تحميل هذه الصفحة بشكل صحيح. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-[#0b121f] transition hover:bg-orange-600"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
