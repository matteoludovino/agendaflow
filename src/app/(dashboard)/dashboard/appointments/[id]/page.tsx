import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StatusBadge } from "@/components/shared/index"
import { AppointmentActions } from "@/components/appointments/AppointmentActions"
import { formatDateTime, formatCurrency, formatDuration } from "@/lib/utils"
import { ArrowLeft, User, Clock, Mail, Phone, StickyNote } from "lucide-react"

export const metadata: Metadata = { title: "Agendamento" }

interface PageProps {
  params: Promise<{ id: string }>
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export default async function AppointmentDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const appointment = await prisma.appointment.findUnique({
    where: { id, professionalId: session.user.id },
    include: { service: true },
  })

  if (!appointment) notFound()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/appointments"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Agendamento</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(appointment.startAt)}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cliente</p>
          <InfoRow icon={User}       label="Nome"      value={appointment.clientName} />
          <InfoRow icon={Mail}       label="E-mail"    value={appointment.clientEmail} />
          <InfoRow icon={Phone}      label="Telefone"  value={appointment.clientPhone} />
          <InfoRow icon={StickyNote} label="Observações" value={appointment.clientNotes} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Serviço</p>
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded-lg"
              style={{ backgroundColor: `${appointment.service.color}30` }}
            >
              <div
                className="m-auto mt-2.5 h-5 w-5 rounded-full"
                style={{ backgroundColor: appointment.service.color }}
              />
            </div>
            <div>
              <p className="font-semibold">{appointment.service.name}</p>
              <p className="text-xs text-muted-foreground">{appointment.service.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Duração</p>
              <p className="font-semibold">{formatDuration(appointment.service.duration)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="font-semibold">
                {appointment.price === 0 ? "Grátis" : formatCurrency(appointment.price)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border pt-4">
            <InfoRow icon={Clock} label="Início" value={formatDateTime(appointment.startAt)} />
            <InfoRow icon={Clock} label="Término" value={formatDateTime(appointment.endAt)} />
          </div>
        </div>
      </div>

      {appointment.cancellationNote && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-xs font-medium text-destructive">Motivo do cancelamento</p>
          <p className="mt-1 text-sm">{appointment.cancellationNote}</p>
        </div>
      )}

      <AppointmentActions
        appointmentId={appointment.id}
        status={appointment.status}
      />
    </div>
  )
}
