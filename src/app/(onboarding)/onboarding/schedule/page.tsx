import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ScheduleForm } from "@/components/onboarding/ScheduleForm"

export const metadata: Metadata = { title: "Disponibilidade — Onboarding" }

export default async function OnboardingSchedulePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const availability = await prisma.availability.findMany({
    where: { userId: session.user.id },
    orderBy: { dayOfWeek: "asc" },
  })

  return (
    <div className="space-y-8">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Quando você está disponível?
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure os dias e horários em que aceita agendamentos.
          Você pode ajustar isso a qualquer momento.
        </p>
      </div>

      <ScheduleForm initialAvailability={availability} />
    </div>
  )
}
