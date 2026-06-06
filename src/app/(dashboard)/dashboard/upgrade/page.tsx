import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PLANS } from "@/lib/constants/plans"
import { CheckoutButton } from "@/components/billing/CheckoutButton"
import { ManageSubscriptionButton } from "@/components/billing/ManageSubscriptionButton"
import { cn } from "@/lib/utils"
import { Check, Crown, Zap, ArrowLeft, Shield, Star, Sparkles } from "lucide-react"

export const metadata: Metadata = { title: "Upgrade de plano — AgendaFlow" }

const PLAN_ORDER = ["FREE", "PRO", "BUSINESS"] as const

const COMPARISON_ROWS = [
  { label: "Serviços cadastrados", free: "Até 3",    pro: "Ilimitados", business: "Ilimitados" },
  { label: "Agendamentos/mês",     free: "20",       pro: "200",        business: "Ilimitados" },
  { label: "Slug personalizado",   free: false,      pro: true,         business: true         },
  { label: "E-mails de lembrete",  free: false,      pro: true,         business: true         },
  { label: "Analytics",            free: false,      pro: true,         business: true         },
  { label: "Sem marca AgendaFlow", free: false,      pro: true,         business: true         },
  { label: "CRM de clientes",      free: false,      pro: false,        business: true         },
  { label: "Suporte prioritário",  free: false,      pro: false,        business: true         },
  { label: "API de integração",    free: false,      pro: false,        business: true         },
]

const HIGHLIGHTS: Record<string, string> = {
  PRO:      "Ideal para autônomos que levam a sério",
  BUSINESS: "Para quem gerencia equipe ou studio",
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; success?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [user, params] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, stripeSubId: true },
    }),
    searchParams,
  ])

  if (!user) redirect("/login")

  const currentPlan = user.plan
  const fromOnboarding = params.ref === "onboarding"
  const showSuccess = params.success === "true"

  return (
    <div className="space-y-10 animate-fade-in">

      <div className="flex items-start gap-4">
        <Link
          href={fromOnboarding ? "/dashboard" : "/dashboard/settings/billing"}
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Escolha seu plano</h1>
          <p className="text-sm text-muted-foreground">
            Sem taxa de adesão · Cancele quando quiser · Cobrado mensalmente via Stripe
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800/30">
            <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Assinatura ativada com sucesso!</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Todos os recursos do seu plano foram desbloqueados.</p>
          </div>
        </div>
      )}

      {fromOnboarding && !showSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm">
            Sua conta está configurada!{" "}
            <Link href="/dashboard" className="font-medium text-primary hover:underline">Continue grátis</Link>{" "}
            e faça upgrade quando precisar de mais.
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId]
          const isCurrent = currentPlan === planId
          const isFeatured = plan.featured
          const isPaid = planId !== "FREE"
          const highlight = HIGHLIGHTS[planId]

          return (
            <div
              key={planId}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition-all",
                isFeatured ? "border-primary bg-primary/[0.03] shadow-lg shadow-primary/5 dark:bg-primary/5" : "border-border bg-card",
                isCurrent && "ring-2 ring-primary/20"
              )}
            >
              {isFeatured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  <Zap className="h-3 w-3" />Mais popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Plano atual
                </span>
              )}

              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {isPaid && <Crown className="h-4 w-4 text-amber-500" />}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-extrabold">Grátis</span>
                  ) : (
                    <>
                      <span className="text-xs font-medium text-muted-foreground">R$</span>
                      <span className="text-3xl font-extrabold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{highlight ?? plan.description}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="flex h-10 items-center justify-center rounded-xl border border-border text-sm font-medium text-muted-foreground">
                  Plano atual ✓
                </div>
              ) : planId === "FREE" ? (
                <Link href="/dashboard" className="flex h-10 items-center justify-center rounded-xl border border-border text-sm font-medium transition-colors hover:bg-muted">
                  Continuar no Free
                </Link>
              ) : currentPlan !== "FREE" ? (
                <ManageSubscriptionButton className="h-10 w-full justify-center rounded-xl" />
              ) : (
                <CheckoutButton
                  planId={planId as "PRO" | "BUSINESS"}
                  className={cn(
                    "h-10 w-full rounded-xl text-sm font-semibold transition-all",
                    isFeatured ? "bg-primary text-primary-foreground hover:opacity-90" : "border border-primary text-primary hover:bg-primary/5"
                  )}
                >
                  Assinar {plan.name}
                </CheckoutButton>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        {[
          { icon: Shield, label: "Pagamento seguro via Stripe" },
          { icon: Zap,    label: "Ativação imediata" },
          { icon: Crown,  label: "Cancele quando quiser" },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />{label}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-4 border-b border-border bg-muted/50 px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Recurso</span>
          {PLAN_ORDER.map((id) => (
            <span key={id} className={cn("text-center", currentPlan === id && "text-primary")}>
              {PLANS[id].name}{currentPlan === id && " ✓"}
            </span>
          ))}
        </div>
        {COMPARISON_ROWS.map((row, i) => (
          <div key={row.label} className={cn("grid grid-cols-4 items-center px-5 py-3 text-sm", i % 2 === 0 ? "bg-background" : "bg-muted/20")}>
            <span className="text-muted-foreground">{row.label}</span>
            {([row.free, row.pro, row.business] as (string | boolean)[]).map((val, j) => (
              <div key={j} className="flex justify-center">
                {typeof val === "boolean" ? (
                  val ? <Check className="h-4 w-4 text-primary" strokeWidth={2.5} /> : <span className="text-muted-foreground/30">—</span>
                ) : (
                  <span className="font-medium">{val}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-4">
        <h3 className="font-semibold">Dúvidas sobre o pagamento</h3>
        <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
          <div><p className="font-medium text-foreground mb-1">Como funciona a cobrança?</p><p>Mensalidade recorrente processada pelo Stripe. Cancele a qualquer momento sem multa.</p></div>
          <div><p className="font-medium text-foreground mb-1">Posso trocar de plano?</p><p>Sim. Acesse "Gerenciar assinatura" para fazer upgrade, downgrade ou cancelar via portal Stripe.</p></div>
          <div><p className="font-medium text-foreground mb-1">Quais formas de pagamento?</p><p>Cartão de crédito e débito (Visa, Mastercard, Amex). Pix disponível em breve.</p></div>
          <div><p className="font-medium text-foreground mb-1">E se eu cancelar?</p><p>Você mantém acesso ao plano até o fim do período pago. Depois volta ao Free automaticamente.</p></div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Pagamentos processados com segurança pelo{" "}
        <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Stripe</a>
        {" "}· Seus dados nunca ficam armazenados em nossos servidores
      </p>
    </div>
  )
}
