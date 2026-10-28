import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7]">
      <div className="max-w-md w-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-3xl p-8 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#0071E3]/10 dark:bg-[#0071E3]/20 text-[#0071E3] dark:text-[#388BFD] flex items-center justify-center text-xl mx-auto font-bold font-mono">
          404
        </div>

        <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          Page Not Found
        </h2>

        <p className="text-xs text-[#86868B] leading-relaxed">
          The page or document route you are looking for doesn&apos;t exist or has moved.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xs transition"
          >
            ← Return to Resume Builder
          </Link>
        </div>
      </div>
    </div>
  );
}
