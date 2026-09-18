export default function Loading() {
  return (
    <div className="container-x py-24" aria-busy="true" aria-live="polite">
      <div className="h-3 w-32 animate-pulse bg-surface-2" />
      <div className="mt-6 h-12 w-3/4 max-w-2xl animate-pulse bg-surface-2" />
      <div className="mt-4 h-5 w-1/2 max-w-lg animate-pulse bg-surface-2" />
      <div className="mt-16 grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => (<div key={i} className="aspect-[4/3] animate-pulse bg-surface-2" />))}</div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
