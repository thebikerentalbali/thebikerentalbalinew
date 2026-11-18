export default function TourLoading() {
  return (
    <div className="min-h-screen text-[var(--ink)] pb-16">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 animate-pulse">
        <div className="h-10 w-56 rounded-full bg-[var(--card)]" />
        <div className="cirrel-glass rounded-[28px] overflow-hidden">
          <div className="w-full h-72 sm:h-80 bg-[var(--card-2)]" />
          <div className="p-6 space-y-3">
            <div className="h-7 w-2/3 rounded-xl bg-[var(--card)]" />
            <div className="h-4 w-full rounded-lg bg-[var(--card)]" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-[18px] bg-[var(--card)]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
