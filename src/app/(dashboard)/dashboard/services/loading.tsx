export default function ServicesLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-6 w-24 rounded-md bg-muted" />
          <div className="h-4 w-40 rounded-md bg-muted" />
        </div>
        <div className="h-9 w-32 rounded-md bg-muted" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border bg-muted/40 px-4 py-2.5">
          <div className="h-4 w-full rounded bg-muted/60" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-0"
          >
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="flex flex-1 items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-muted" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </div>
            <div className="h-4 w-12 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-5 w-9 rounded-full bg-muted" />
            <div className="flex gap-1">
              <div className="h-7 w-7 rounded-md bg-muted" />
              <div className="h-7 w-7 rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
