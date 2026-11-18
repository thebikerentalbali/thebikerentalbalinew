export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)] px-4 sm:px-6 md:px-10 pt-5 sm:pt-7 pb-16">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-36 rounded-full bg-[var(--card-2)] animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[var(--card-2)] animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-[var(--card-2)] animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-[var(--card-2)] animate-pulse" />
          </div>
        </div>
        <div className="h-12 w-72 max-w-full rounded-2xl bg-[var(--card-2)] animate-pulse" />
        <div className="h-14 w-full md:max-w-2xl md:mx-auto rounded-full bg-[var(--card-2)] animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pt-2">
          <div className="h-56 rounded-[24px] bg-[var(--card-2)] animate-pulse" />
          <div className="h-56 rounded-[24px] bg-[var(--card-2)] animate-pulse" />
          <div className="h-56 rounded-[24px] bg-[var(--card-2)] animate-pulse hidden md:block" />
          <div className="h-56 rounded-[24px] bg-[var(--card-2)] animate-pulse hidden lg:block" />
        </div>
      </div>
    </div>
  );
}
