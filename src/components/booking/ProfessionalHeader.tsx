import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { generateInitials } from "@/lib/utils"

interface ProfessionalHeaderProps {
  name: string | null
  bio: string | null
  image: string | null
  slug: string
  showBack?: boolean
  backLabel?: string
}

export function ProfessionalHeader({
  name,
  bio,
  image,
  slug,
  showBack = false,
  backLabel = "Ver todos os serviços",
}: ProfessionalHeaderProps) {
  const initials = generateInitials(name ?? "P")
  const displayName = name ?? "Profissional"

  return (
    <div className="mb-8">
      {showBack && (
        <Link
          href={`/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {image ? (
            <img src={image} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{displayName}</h1>
          {bio && (
            <p className="mt-0.5 max-w-md text-sm text-muted-foreground">{bio}</p>
          )}
        </div>
      </div>
    </div>
  )
}
