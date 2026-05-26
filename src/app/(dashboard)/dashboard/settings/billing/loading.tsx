export default function BillingLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-1">
        <div className="h-6 w-28 rounded-md bg-muted" />
        <div className="h-4 w-56 rounded-md bg-muted" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-7 w-16 rounded-md bg-muted" />
              </div>
              <div className="h-6 w-12 rounded-full bg-muted" />
            </div>
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-9 w-40 rounded-md bg-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <div className="h-5 w-48 rounded bg-muted" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border px-6 py-3 last:border-0">
            <div className="h-4 w-4 rounded-full bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
