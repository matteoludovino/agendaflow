"use client"

import { usePathname } from "next/navigation"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { step: 1, label: "Perfil", path: "/onboarding" },
  { step: 2, label: "Disponibilidade", path: "/onboarding/schedule" },
  { step: 3, label: "Plano", path: "/onboarding/plan" },
]

export function OnboardingProgress() {
  const pathname = usePathname()
  const currentStep = STEPS.find((s) => s.path === pathname)?.step ?? 1

  return (
    <nav aria-label="Progresso do onboarding" className="flex items-start justify-center">
      {STEPS.map((s, index) => {
        const done = s.step < currentStep
        const active = s.step === currentStep

        return (
          <div key={s.step} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary",
                  !done && !active && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : s.step}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div className="mx-3 mt-4 h-px w-16 shrink-0 transition-colors duration-200">
                <div
                  className={cn(
                    "h-full w-full",
                    currentStep > s.step ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
