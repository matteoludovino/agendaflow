import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardScheduleEditor } from "@/components/availability/DashboardScheduleEditor"
import { BlockedDatesManager } from "@/components/availability/BlockedDatesManager"
import { PageHeader } from "@/components/shared/index"

export const metadata: Metadata = { title: "Disponibilidade" }

export default async function AvailabilityPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [availability, blockedDates, user] = await Promise.all([
    prisma.availability.findMany({
      where: { userId: session.user.id },
      orderBy: { dayOfWeek: "asc" },
    }),
    prisma.blockedDate.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { bookingBuffer: true },
    }),
  ])

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Disponibilidade"
        description="Configure quando você está disponível para receber agendamentos."
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Horários de atendimento</h2>
          <p className="text-sm text-muted-foreground">
            Defina os dias da semana e os horários em que você aceita agendamentos.
          </p>
        </div>

        <DashboardScheduleEditor initialAvailability={availability} />
      </section>

      <div className="border-t border-border" />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Datas bloqueadas</h2>
          <p className="text-sm text-muted-foreground">
            Bloqueie dias específicos em que você não estará disponível, como férias ou feriados.
          </p>
        </div>

        <BlockedDatesManager blockedDates={blockedDates} />
      </section>
    </div>
  )
}
