import type { Metadata } from "next"
import Link from "next/link"
import { CalendarCheck } from "lucide-react"
import { APP_CONFIG } from "@/lib/constants/config"

export const metadata: Metadata = {
  title: {
    template: `%s — ${APP_CONFIG.name}`,
    default: APP_CONFIG.name,
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarCheck className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">{APP_CONFIG.name}</span>
        </Link>

        {children}
      </div>

      <p className="relative mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {APP_CONFIG.name}. Todos os direitos reservados.
      </p>
    </div>
  )
}
