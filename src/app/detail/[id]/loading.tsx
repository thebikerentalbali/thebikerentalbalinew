export default function DetailLoading() {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)] px-4 sm:px-6 pt-4 pb-24 sm:py-8">
      <div className="w-full max-w-2xl mx-auto space-y-5">
        <div className="rounded-[26px] p-5 bg-[var(--card-2)]/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-7 w-44 rounded-full bg-[var(--card-3)] animate-pulse" />
            <div className="flex gap-2">
              <div className="w-9 h-9 rounded-full bg-[var(--card-3)] animate-pulse" />
              <div className="w-9 h-9 rounded-full bg-[var(--card-3)] animate-pulse" />
            </div>
          </div>
          <div className="h-56 sm:h-72 w-full rounded-[22px] bg-[var(--card-3)] animate-pulse" />
        </div>
        <div className="h-44 rounded-[26px] bg-[var(--card-2)]/70 animate-pulse" />
      </div>
    </div>
  );
}
