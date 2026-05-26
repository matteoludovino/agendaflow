"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Clock,
  Briefcase,
  Users,
  Bell,
  Settings,
  CalendarCheck,
  Crown,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { canDo } from "@/lib/constants/plans"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Agendamentos", icon: Calendar },
  { href: "/dashboard/availability", label: "Disponibilidade", icon: Clock },
  { href: "/dashboard/services", label: "Serviços", icon: Briefcase },
  { href: "/dashboard/clients", label: "Clientes", icon: Users, requiresPlan: "PRO" as const },
  { href: "/dashboard/notifications", label: "Notificações", icon: Bell },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
]

interface MobileNavProps {
  userPlan: string
  userSlug: string
}

export function MobileNav({ userPlan, userSlug }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar shadow-xl md:hidden">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <CalendarCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-semibold text-sidebar-foreground">AgendaFlow</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
              {NAV_ITEMS.map((item) => {
                const locked = item.requiresPlan && !canDo(userPlan, "clientsPage")
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={locked ? "/dashboard/upgrade" : item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      locked && "opacity-50"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {locked && <Crown className="ml-auto h-3 w-3 text-amber-500" />}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-sidebar-border p-2">
              {userPlan === "FREE" && (
                <Link
                  href="/dashboard/upgrade"
                  onClick={() => setOpen(false)}
                  className="mb-2 flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary"
                >
                  <Crown className="h-4 w-4 shrink-0" />
                  Fazer upgrade para Pro
                </Link>
              )}
              <Link
                href={`/${userSlug}`}
                target="_blank"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                Página pública
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
