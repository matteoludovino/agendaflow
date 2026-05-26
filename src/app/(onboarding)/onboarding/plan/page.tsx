import type { Metadata } from "next"
import { PlanSelector } from "@/components/onboarding/PlanSelector"

export const metadata: Metadata = { title: "Escolha seu plano — Onboarding" }

export default function OnboardingPlanPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Escolha seu plano</h1>
        <p className="text-sm text-muted-foreground">
          Comece grátis e faça upgrade quando precisar de mais.
          Sem taxa de adesão, cancele quando quiser.
        </p>
      </div>

      <PlanSelector />
    </div>
  )
}
