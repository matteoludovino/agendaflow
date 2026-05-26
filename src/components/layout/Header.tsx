"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon, Bell } from "lucide-react"
import { MobileNav } from "./MobileNav"
import { UserMenu } from "./UserMenu"

interface HeaderProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    slug: string
    plan: string
  }
  unreadNotifications?: number
}

export function Header({ user, unreadNotifications = 0 }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <MobileNav userPlan={user.plan} userSlug={user.slug} />

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Alternar tema"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        <Link
          href="/dashboard/notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label={`Notificações${unreadNotifications > 0 ? ` (${unreadNotifications} não lidas)` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </Link>

        <div className="mx-1 h-5 w-px bg-border" />

        <UserMenu
          name={user.name}
          email={user.email}
          image={user.image}
          plan={user.plan}
        />
      </div>
    </header>
  )
}
