"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Crown, Loader2, Zap } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PLANS } from "@/lib/constants/plans"
import { completeOnboardingAction } from "@/actions/user.actions"

const PLAN_ORDER = ["FREE", "PRO", "BUSINESS"] as const

export function PlanSelector() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activePlan, setActivePlan] = useState<string | null>(null)

  function selectPlan(planId: string) {
    setActivePlan(planId)
    startTransition(async () => {
      const result = await completeOnboardingAction()
      if (!result.success) {
        toast.error(result.error)
        setActivePlan(null)
        return
      }

      if (planId === "FREE") {
        router.push("/dashboard")
      } else {
        router.push(`/dashboard/upgrade?plan=${planId}&ref=onboarding`)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId]
          const isLoading = isPending && activePlan === planId

          return (
            <div
              key={planId}
              className={cn(
                "relative flex flex-col rounded-xl border p-5 transition-all",
                plan.featured
                  ? "border-primary shadow-sm shadow-primary/10"
                  : "border-border",
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    <Zap className="h-3 w-3" />
                    Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {planId !== "FREE" && (
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold">Grátis</span>
                  ) : (
                    <>
                      <span className="text-xl font-bold">R$ {plan.price}</span>
                      <span className="text-xs text-muted-foreground">/mês</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-5 flex-1 space-y-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => selectPlan(planId)}
                disabled={isPending}
                className={cn(
                  "flex h-8 w-full items-center justify-center gap-2 rounded-md text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border hover:bg-muted"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : planId === "FREE" ? (
                  "Começar grátis"
                ) : (
                  `Assinar ${plan.name}`
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/onboarding/schedule")}
          disabled={isPending}
          className="flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          Voltar
        </button>
        <p className="text-xs text-muted-foreground">
          Você pode fazer upgrade a qualquer momento
        </p>
      </div>
    </div>
  )
}
