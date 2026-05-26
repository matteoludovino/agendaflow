import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/index"
import { getPlanLabel } from "@/lib/constants/plans"
import { User, CreditCard, Bell, Puzzle, ChevronRight, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Configurações" }

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, name: true, email: true },
  })

  const isPaid = user?.plan !== "FREE"

  const sections = [
    {
      href:        "/dashboard/settings/profile",
      icon:        User,
      label:       "Perfil",
      description: "Nome, bio, foto e link de agendamento",
      badge:       null,
    },
    {
      href:        "/dashboard/settings/billing",
      icon:        CreditCard,
      label:       "Faturamento",
      description: isPaid ? `Plano ${getPlanLabel(user?.plan ?? "FREE")} · Gerenciar assinatura` : "Plano Free · Fazer upgrade",
      badge:       !isPaid ? "Upgrade" : null,
    },
    {
      href:        "/dashboard/notifications",
      icon:        Bell,
      label:       "Notificações",
      description: "Central de alertas e avisos",
      badge:       null,
    },
    {
      href:        "/dashboard/settings/integrations",
      icon:        Puzzle,
      label:       "Integrações",
      description: "Google Calendar, WhatsApp e mais",
      badge:       "Em breve",
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader title="Configurações" />

      <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
        {sections.map(({ href, icon: Icon, label, description, badge }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{label}</span>
                {badge && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      badge === "Upgrade"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {badge === "Upgrade" && <Crown className="mr-1 h-2.5 w-2.5" />}
                    {badge}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          Conta: <span className="font-medium text-foreground">{user?.email}</span>
        </p>
      </div>
    </div>
  )
}
