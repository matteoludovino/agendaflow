import Link from "next/link"
import { CalendarCheck } from "lucide-react"
import { APP_CONFIG } from "@/lib/constants/config"

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CalendarCheck className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">{APP_CONFIG.name}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">{children}</main>

      <footer className="mt-16 border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Agendamento via{" "}
          <Link href="/" className="font-medium hover:text-foreground">
            {APP_CONFIG.name}
          </Link>
        </p>
      </footer>
    </div>
  )
}
