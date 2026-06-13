import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ManageSubscriptionButton } from "@/components/billing/ManageSubscriptionButton"
import { PageHeader } from "@/components/shared/index"
import { Crown, Check, AlertCircle, Zap, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PLANS } from "@/lib/constants/plans"
import { startOfMonth, endOfMonth } from "date-fns"

export const metadata: Metadata = { title: "Faturamento" }

interface PageProps {
  searchParams: Promise<{ success?: string }>
}

async function getBillingData(userId: string) {
  const now = new Date()
  const [user, serviceCount, appointmentCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true, stripeSubId: true, stripeCustomerId: true },
    }),
    prisma.service.count({ where: { userId } }),
    prisma.appointment.count({
      where: {
        professionalId: userId,
        startAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
        status: { notIn: ["CANCELLED"] },
      },
    }),
  ])

  return { user, serviceCount, appointmentCount }
}

function UsageMeter({
  label,
  current,
  limit,
}: {
  label: string
  current: number
  limit: number
}) {
  const unlimited = limit === -1
  const pct = unlimited ? 0 : Math.min((current / limit) * 100, 100)
  const near = !unlimited && pct >= 80

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium tabular-nums", near && "text-amber-600 dark:text-amber-400")}>
          {current}
          {!unlimited && ` / ${limit}`}
          {unlimited && " · ilimitado"}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              pct >= 100 ? "bg-destructive" : near ? "bg-amber-500" : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default async function BillingPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [{ user, serviceCount, appointmentCount }, resolvedParams] = await Promise.all([
    getBillingData(session.user.id),
    searchParams,
  ])

  if (!user) redirect("/login")

  const plan = PLANS[user.plan]
  const isPaid = user.plan !== "FREE"
  const showSuccess = resolvedParams.success === "true"

  const serviceLimit = plan.limits.services
  const appointmentLimit = plan.limits.appointmentsPerMonth

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Faturamento"
        description="Gerencie seu plano e assinatura."
      />

      {showSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/50 dark:bg-emerald-900/20">
          <Check className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Assinatura ativada com sucesso!
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Seu plano {plan.name} já está ativo. Todos os recursos foram desbloqueados.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Plano atual
              </p>
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                {isPaid && <Crown className="h-5 w-5 text-amber-500" />}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                isPaid
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isPaid ? "Pago" : "Grátis"}
            </span>
          </div>

          {isPaid && user.planExpiresAt && (
            <p className="mb-4 text-sm text-muted-foreground">
              Renova em{" "}
              <span className="font-medium text-foreground">
                {formatDate(user.planExpiresAt)}
              </span>
            </p>
          )}

          {isPaid ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <ManageSubscriptionButton />
            </div>
          ) : (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">
                Faça upgrade para desbloquear mais recursos.
              </p>
              <Link
                href="/dashboard/upgrade"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Zap className="h-4 w-4" />
                Fazer upgrade
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Uso este mês
          </p>
          <div className="space-y-5">
            <UsageMeter
              label="Serviços cadastrados"
              current={serviceCount}
              limit={serviceLimit}
            />
            <UsageMeter
              label="Agendamentos"
              current={appointmentCount}
              limit={appointmentLimit}
            />
          </div>

          {user.plan === "FREE" && (serviceCount >= 2 || appointmentCount >= 15) && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Você está se aproximando dos limites do plano Free.{" "}
                <Link href="/dashboard/upgrade" className="font-medium underline">
                  Faça upgrade para continuar crescendo.
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold">Recursos incluídos no {plan.name}</h3>
        </div>
        <ul className="divide-y divide-border">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 px-6 py-3">
              <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        {!isPaid && (
          <div className="border-t border-border px-6 py-4">
            <Link
              href="/dashboard/upgrade"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver comparação completa de planos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {isPaid && (
        <div className="rounded-xl border border-border bg-muted/40 p-5">
          <p className="text-sm font-medium">Histórico de faturas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesse todas as suas faturas e recibos no portal de faturamento Stripe.
          </p>
          <div className="mt-3">
            <ManageSubscriptionButton />
          </div>
        </div>
      )}
    </div>
  )
}
