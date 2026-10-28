export default function Loading() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] select-none">
      <div className="flex flex-col items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-base shadow-sm animate-pulse">
          RC
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#86868B]">
          <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-ping" />
          <span>Loading Elite AI Resume Builder...</span>
        </div>
      </div>
    </div>
  );
}
