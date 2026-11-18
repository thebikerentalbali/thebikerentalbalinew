export default function ScootersLoading() {
  return (
    <div className="min-h-screen text-[var(--ink)] pb-24">
      <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 md:px-10 pt-6 space-y-5 animate-pulse">
        <div className="h-9 w-48 rounded-xl bg-[var(--card)]" />
        <div className="h-12 w-full rounded-full bg-[var(--card)]" />
        <div className="flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-[var(--card)] shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="cirrel-glass rounded-[20px] p-3 space-y-2.5">
              <div className="w-full aspect-square rounded-[15px] bg-[var(--card-2)]" />
              <div className="h-4 w-3/4 rounded bg-[var(--card)]" />
              <div className="h-4 w-1/2 rounded bg-[var(--card)]" />
              <div className="h-8 w-full rounded-full bg-[var(--card)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
