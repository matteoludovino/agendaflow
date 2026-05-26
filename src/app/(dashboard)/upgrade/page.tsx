import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PLANS } from "@/lib/constants/plans"
import { CheckoutButton } from "@/components/billing/CheckoutButton"
import { ManageSubscriptionButton } from "@/components/billing/ManageSubscriptionButton"
import { PageHeader } from "@/components/shared/index"
import { cn } from "@/lib/utils"
import { Check, Crown, Zap, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = { title: "Upgrade de plano" }

const PLAN_ORDER = ["FREE", "PRO", "BUSINESS"] as const

const COMPARISON_ROWS = [
  { label: "Serviços",              free: "Até 3",      pro: "Ilimitados",  business: "Ilimitados" },
  { label: "Agendamentos/mês",      free: "20",         pro: "200",         business: "Ilimitados" },
  { label: "Slug personalizado",    free: false,        pro: true,          business: true },
  { label: "E-mails de lembrete",   free: false,        pro: true,          business: true },
  { label: "Analytics",             free: false,        pro: true,          business: true },
  { label: "Sem marca AgendaFlow",  free: false,        pro: true,          business: true },
  { label: "CRM de clientes",       free: false,        pro: false,         business: true },
  { label: "Suporte prioritário",   free: false,        pro: false,         business: true },
]

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [user, resolvedParams] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, stripeSubId: true },
    }),
    searchParams,
  ])

  if (!user) redirect("/login")

  const fromOnboarding = resolvedParams.ref === "onboarding"
  const currentPlan = user.plan

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex items-start gap-4">
        <Link
          href={fromOnboarding ? "/dashboard" : "/dashboard/settings/billing"}
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PageHeader
          title="Escolha seu plano"
          description="Sem taxa de adesão. Cancele quando quiser."
        />
      </div>

      {fromOnboarding && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Zap className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm">
            Sua conta está configurada!{" "}
            <Link href="/dashboard" className="font-medium text-primary hover:underline">
              Continue grátis
            </Link>{" "}
            e faça upgrade quando precisar.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId]
          const isCurrent = currentPlan === planId
          const isFeatured = plan.featured

          return (
            <div
              key={planId}
              className={cn(
                "relative flex flex-col rounded-xl border p-6 transition-all",
                isFeatured
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border",
                isCurrent && !isFeatured && "border-muted-foreground/30"
              )}
            >
              {isFeatured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  <Zap className="h-3 w-3" />
                  Mais popular
                </span>
              )}

              {isCurrent && (
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Atual
                </span>
              )}

              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {planId !== "FREE" && <Crown className="h-4 w-4 text-amber-500" />}
                </div>
                <div className="mt-1.5 flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold">Grátis</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">R$ {plan.price}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="flex h-10 items-center justify-center rounded-md border border-border text-sm text-muted-foreground">
                  Plano atual
                </div>
              ) : planId === "FREE" ? (
                <Link
                  href="/dashboard"
                  className="flex h-10 items-center justify-center rounded-md border border-border text-sm font-medium transition-colors hover:bg-muted"
                >
                  Continuar grátis
                </Link>
              ) : currentPlan !== "FREE" ? (
                <ManageSubscriptionButton className="h-10 w-full justify-center" />
              ) : (
                <CheckoutButton
                  planId={planId as "PRO" | "BUSINESS"}
                  className={cn(
                    "h-10 w-full rounded-md text-sm font-semibold",
                    isFeatured
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border bg-background hover:bg-muted"
                  )}
                >
                  Assinar {plan.name}
                </CheckoutButton>
              )}
            </div>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Recurso</span>
          {PLAN_ORDER.map((id) => (
            <span key={id} className={cn("text-center", currentPlan === id && "text-foreground")}>
              {PLANS[id].name}
              {currentPlan === id && " ✓"}
            </span>
          ))}
        </div>

        {COMPARISON_ROWS.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "grid grid-cols-4 items-center px-4 py-3 text-sm",
              i % 2 === 0 ? "bg-background" : "bg-muted/20"
            )}
          >
            <span className="text-muted-foreground">{row.label}</span>
            {([row.free, row.pro, row.business] as (string | boolean)[]).map(
              (val, j) => (
                <div key={j} className="flex justify-center">
                  {typeof val === "boolean" ? (
                    val ? (
                      <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )
                  ) : (
                    <span className="font-medium">{val}</span>
                  )}
                </div>
              )
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Pagamentos processados com segurança pelo Stripe · Cancele a qualquer momento · Sem multa
      </p>
    </div>
  )
}
