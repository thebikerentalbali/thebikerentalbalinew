export default function GlobalLoading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-black/10 overflow-hidden pointer-events-none">
      <div className="h-full bg-black animate-[shimmer_1.5s_infinite_linear] w-1/3 rounded-full" />
    </div>
  );
}
