import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import type { AppointmentStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StatusBadge } from "@/components/shared/index"
import { formatDateTime, formatCurrency, generateInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

export const metadata: Metadata = { title: "Agendamentos" }

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Todos",      value: "all"       },
  { label: "Pendentes",  value: "PENDING"   },
  { label: "Confirmados",value: "CONFIRMED" },
  { label: "Concluídos", value: "COMPLETED" },
  { label: "Cancelados", value: "CANCELLED" },
]

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AppointmentsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { status, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? "1"))
  const take = 20
  const skip = (currentPage - 1) * take

  const where = {
    professionalId: session.user.id,
    ...(status && status !== "all"
      ? { status: status as AppointmentStatus }
      : {}),
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { service: { select: { name: true, color: true } } },
      orderBy: { startAt: "desc" },
      take,
      skip,
    }),
    prisma.appointment.count({ where }),
  ])

  const totalPages = Math.ceil(total / take)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Agendamentos</h1>
          <p className="text-sm text-muted-foreground">
            {total} agendamento{total !== 1 ? "s" : ""}
            {status && status !== "all" ? ` · filtrado por ${STATUS_TABS.find(t => t.value === status)?.label?.toLowerCase()}` : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/dashboard/appointments" : `/dashboard/appointments?status=${tab.value}`}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              (status === tab.value || (!status && tab.value === "all"))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Calendar className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="font-medium">Nenhum agendamento encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {status && status !== "all"
              ? "Tente outro filtro ou aguarde novos agendamentos."
              : "Compartilhe seu link de agendamento para receber clientes."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="hidden grid-cols-[3fr_2fr_2fr_1fr_auto] gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Cliente</span>
            <span>Serviço</span>
            <span>Data e hora</span>
            <span>Status</span>
            <span />
          </div>

          <ul className="divide-y divide-border">
            {appointments.map((apt) => {
              const initials = generateInitials(apt.clientName)
              return (
                <li key={apt.id}>
                  <Link
                    href={`/dashboard/appointments/${apt.id}`}
                    className="grid grid-cols-1 gap-2 px-4 py-3.5 transition-colors hover:bg-muted/30 sm:grid-cols-[3fr_2fr_2fr_1fr_auto] sm:items-center sm:gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: apt.service.color }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{apt.clientName}</p>
                        <p className="truncate text-xs text-muted-foreground">{apt.clientEmail}</p>
                      </div>
                    </div>

                    <p className="truncate text-sm text-muted-foreground sm:text-foreground">
                      {apt.service.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(apt.startAt)}
                    </p>

                    <StatusBadge status={apt.status} />

                    <p className="text-xs font-medium">
                      {apt.price === 0 ? "Grátis" : formatCurrency(apt.price)}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/dashboard/appointments?${new URLSearchParams({ ...(status && status !== "all" ? { status } : {}), page: String(currentPage - 1) })}`}
                className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                Anterior
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/dashboard/appointments?${new URLSearchParams({ ...(status && status !== "all" ? { status } : {}), page: String(currentPage + 1) })}`}
                className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
