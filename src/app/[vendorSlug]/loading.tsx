export default function VendorSlugLoading() {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)] px-4 sm:px-6 py-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-64 sm:h-80 rounded-[30px] bg-[var(--card-2)] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-52 rounded-[26px] bg-[var(--card-2)] animate-pulse" />
          <div className="h-52 rounded-[26px] bg-[var(--card-2)] animate-pulse hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
