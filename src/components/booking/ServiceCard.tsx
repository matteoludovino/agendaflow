import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"
import { formatCurrency, formatDuration } from "@/lib/utils"

interface ServiceCardProps {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  color: string
  slug: string
}

export function ServiceCard({
  id,
  name,
  description,
  duration,
  price,
  color,
  slug,
}: ServiceCardProps) {
  return (
    <Link
      href={`/${slug}/${id}`}
      className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div
          className="mt-0.5 h-10 w-10 shrink-0 rounded-lg"
          style={{ backgroundColor: `${color}20`, border: `2px solid ${color}40` }}
        >
          <div
            className="m-auto mt-2.5 h-5 w-5 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        <div className="min-w-0">
          <p className="font-semibold">{name}</p>
          {description && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{description}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {price === 0 ? "Gratuito" : formatCurrency(price)}
            </span>
          </div>
        </div>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  )
}
