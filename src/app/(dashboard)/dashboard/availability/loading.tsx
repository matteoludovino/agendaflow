export default function AvailabilityLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-6 w-36 rounded-md bg-muted" />
        <div className="h-4 w-72 rounded-md bg-muted" />
      </div>

      <section className="space-y-4">
        <div className="space-y-1">
          <div className="h-5 w-44 rounded bg-muted" />
          <div className="h-4 w-80 rounded bg-muted" />
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <div className="h-4 w-full rounded bg-muted/60" />
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-0"
            >
              <div className="h-5 w-9 rounded-full bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="ml-auto flex items-center gap-2">
                <div className="h-8 w-20 rounded-md bg-muted" />
                <div className="h-4 w-4 rounded bg-muted" />
                <div className="h-8 w-20 rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <div className="h-9 w-36 rounded-md bg-muted" />
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="space-y-4">
        <div className="space-y-1">
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="flex gap-3">
            <div className="h-9 flex-1 rounded-md bg-muted" />
            <div className="h-9 flex-[2] rounded-md bg-muted" />
            <div className="h-9 w-28 rounded-md bg-muted" />
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border py-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-64 rounded bg-muted" />
          </div>
        </div>
      </section>
    </div>
  )
}
