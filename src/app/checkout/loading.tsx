export default function CheckoutLoading() {
  return (
    <div className="min-h-screen w-full bg-[var(--bg)] p-5 sm:p-6 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-[var(--card-2)] animate-pulse" />
          <div className="h-6 w-32 rounded-full bg-[var(--card-2)] animate-pulse" />
          <div className="w-10 h-10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 rounded-[26px] bg-[var(--card-2)] animate-pulse" />
          <div className="h-72 rounded-[26px] bg-[var(--card-2)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
