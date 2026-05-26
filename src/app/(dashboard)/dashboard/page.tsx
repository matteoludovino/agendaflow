import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { PageHeader } from "@/components/shared/index"
import { StatusBadge } from "@/components/shared/index"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Calendar, DollarSign, Users, TrendingUp, Plus, ArrowRight } from "lucide-react"
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard" }

async function getDashboardData(userId: string) {
  const now = new Date()

  const [
    todayCount,
    monthRevenue,
    uniqueClients,
    totalAppointments,
    completedThisMonth,
    upcomingAppointments,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        professionalId: userId,
        startAt: { gte: startOfDay(now), lte: endOfDay(now) },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
    prisma.appointment.aggregate({
      where: {
        professionalId: userId,
        startAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
        status: "COMPLETED",
      },
      _sum: { price: true },
    }),
    prisma.appointment.groupBy({
      by: ["clientEmail"],
      where: { professionalId: userId },
    }),
    prisma.appointment.count({
      where: {
        professionalId: userId,
        startAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
        status: { in: ["CONFIRMED", "COMPLETED", "NO_SHOW"] },
      },
    }),
    prisma.appointment.count({
      where: {
        professionalId: userId,
        startAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
        status: "COMPLETED",
      },
    }),
    prisma.appointment.findMany({
      where: {
        professionalId: userId,
        startAt: { gte: now },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      include: { service: true },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: { professionalId: userId },
      include: { service: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const confirmationRate =
    totalAppointments > 0 ? Math.round((completedThisMonth / totalAppointments) * 100) : 0

  return {
    todayCount,
    monthRevenue: monthRevenue._sum.price ?? 0,
    uniqueClients: uniqueClients.length,
    confirmationRate,
    upcomingAppointments,
    recentAppointments,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const data = await getDashboardData(session.user.id)
  const firstName = session.user.name?.split(" ")[0] ?? "por aqui"

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`Olá, ${firstName} 👋`}
        description="Aqui está um resumo da sua agenda hoje."
        action={
          <Link
            href="/dashboard/appointments/new"
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Agendamentos hoje"
          value={String(data.todayCount)}
          icon={Calendar}
          description={data.todayCount === 0 ? "Nenhum agendamento hoje" : undefined}
        />
        <StatsCard
          title="Receita do mês"
          value={formatCurrency(data.monthRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="Total de clientes"
          value={String(data.uniqueClients)}
          icon={Users}
          description="Clientes únicos"
        />
        <StatsCard
          title="Taxa de conclusão"
          value={`${data.confirmationRate}%`}
          icon={TrendingUp}
          description="Agendamentos concluídos"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Próximos agendamentos</h2>
            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {data.upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Nenhum agendamento futuro</p>
              <Link
                href={`/${session.user.slug}`}
                target="_blank"
                className="mt-3 text-xs text-primary hover:underline"
              >
                Compartilhar link de agendamento
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.upcomingAppointments.map((apt) => (
                <li key={apt.id}>
                  <Link
                    href={`/dashboard/appointments/${apt.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: apt.service.color }}
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{apt.clientName}</p>
                      <p className="truncate text-xs text-muted-foreground">{apt.service.name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium">{formatDateTime(apt.startAt)}</p>
                      <StatusBadge status={apt.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Atividade recente</h2>
          </div>

          {data.recentAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhum agendamento ainda</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.recentAppointments.map((apt) => (
                <li key={apt.id}>
                  <Link
                    href={`/dashboard/appointments/${apt.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
                      {apt.clientName.slice(0, 2)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{apt.clientName}</p>
                      <p className="truncate text-xs text-muted-foreground">{apt.service.name}</p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={apt.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
