export default function Loading() {
  return (
    <div className="wrap py-10" aria-busy="true" aria-live="polite">
      <div className="h-10 w-72 animate-pulse rounded-xl bg-line" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-[22px] border border-line bg-surface">
            <div className="h-[250px] animate-pulse bg-sand" />
            <div className="grid gap-3 p-5">
              <div className="h-6 w-1/2 animate-pulse rounded bg-line" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
