"use client"

import { useTransition } from "react"
import { LogOut, Settings, User, Crown, Loader2 } from "lucide-react"
import { generateInitials } from "@/lib/utils"
import { getPlanLabel } from "@/lib/constants/plans"
import { logoutAction } from "@/actions/auth.actions"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

interface UserMenuProps {
  name: string | null | undefined
  email: string | null | undefined
  image: string | null | undefined
  plan: string
}

export function UserMenu({ name, email, image, plan }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  const initials = generateInitials(name ?? email ?? "U")
  const displayName = name ?? email ?? "Usuário"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {image ? (
            <img src={image} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <span className="hidden max-w-[120px] truncate md:block">{displayName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-md border border-border bg-popover p-1 shadow-lg animate-fade-in">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            <span className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
              plan === "FREE" ? "bg-muted text-muted-foreground" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            )}>
              {plan !== "FREE" && <Crown className="h-2.5 w-2.5" />}
              {getPlanLabel(plan)}
            </span>
          </div>

          <div className="my-1 border-t border-border" />

          <a
            href="/dashboard/settings/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <User className="h-4 w-4" />
            Meu perfil
          </a>
          <a
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </a>

          <div className="my-1 border-t border-border" />

          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
