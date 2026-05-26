export default function NotificationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-6 w-32 rounded-md bg-muted" />
        <div className="h-4 w-24 rounded-md bg-muted" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-4">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-64 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
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
