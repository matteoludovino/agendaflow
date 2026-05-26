"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Briefcase,
  Users,
  Bell,
  Settings,
  CalendarCheck,
  ChevronLeft,
  Crown,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PLANS, canDo } from "@/lib/constants/plans"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  requiresPlan?: "PRO" | "BUSINESS"
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Agendamentos", icon: Calendar },
  { href: "/dashboard/availability", label: "Disponibilidade", icon: Clock },
  { href: "/dashboard/services", label: "Serviços", icon: Briefcase },
  { href: "/dashboard/clients", label: "Clientes", icon: Users, requiresPlan: "PRO" },
  { href: "/dashboard/notifications", label: "Notificações", icon: Bell },
]

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
]

interface SidebarProps {
  userPlan: string
  userSlug: string
}

export function Sidebar({ userPlan, userSlug }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false)

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  function isPlanLocked(item: NavItem) {
    if (!item.requiresPlan) return false
    return !canDo(userPlan, "clientsPage")
  }

  return (
    <aside
      className={cn(
        "relative hidden flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CalendarCheck className="h-3.5 w-3.5" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              AgendaFlow
            </span>
          )}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const locked = isPlanLocked(item)
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={locked ? "/dashboard/upgrade" : item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                collapsed && "justify-center px-0",
                locked && "opacity-50"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {locked && <Crown className="ml-auto h-3 w-3 shrink-0 text-amber-500" />}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        {userPlan === "FREE" && !collapsed && (
          <Link
            href="/dashboard/upgrade"
            className="mb-2 flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <Crown className="h-3.5 w-3.5 shrink-0" />
            <span>Fazer upgrade para Pro</span>
          </Link>
        )}

        <Link
          href={`/${userSlug}`}
          target="_blank"
          title={collapsed ? "Minha página pública" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Página pública</span>}
        </Link>

        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </div>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
      >
        <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  )
}
