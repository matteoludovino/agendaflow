"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CalendarCheck, CircleCheck, X, UserX } from "lucide-react"
import { toast } from "sonner"
import type { AppointmentStatus } from "@prisma/client"
import {
  confirmAppointmentAction,
  cancelAppointmentAction,
  completeAppointmentAction,
  markNoShowAction,
} from "@/actions/appointment.actions"

interface AppointmentActionsProps {
  appointmentId: string
  status: AppointmentStatus
}

export function AppointmentActions({ appointmentId, status }: AppointmentActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancelNote, setCancelNote] = useState("")

  if (!["PENDING", "CONFIRMED"].includes(status)) return null

  function run(actionName: string, fn: () => Promise<{ success: boolean; error?: string } | undefined>) {
    setActiveAction(actionName)
    startTransition(async () => {
      const result = await fn()
      if (result && !result.success) {
        toast.error(result.error)
      } else {
        const messages: Record<string, string> = {
          confirm:  "Agendamento confirmado",
          complete: "Agendamento concluído",
          cancel:   "Agendamento cancelado",
          noshow:   "Marcado como não compareceu",
        }
        toast.success(messages[actionName])
        router.push("/dashboard/appointments")
      }
      setActiveAction(null)
    })
  }

  function BtnIcon({ action }: { action: string }) {
    if (isPending && activeAction === action) return <Loader2 className="h-4 w-4 animate-spin" />
    const icons: Record<string, React.ElementType> = {
      confirm:  CalendarCheck,
      complete: CircleCheck,
      cancel:   X,
      noshow:   UserX,
    }
    const Icon = icons[action]
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ações</p>

      <div className="flex flex-wrap gap-3">
        {status === "PENDING" && (
          <button
            type="button"
            onClick={() => run("confirm", () => confirmAppointmentAction(appointmentId))}
            disabled={isPending}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <BtnIcon action="confirm" />
            Confirmar agendamento
          </button>
        )}

        {status === "CONFIRMED" && (
          <button
            type="button"
            onClick={() => run("complete", () => completeAppointmentAction(appointmentId))}
            disabled={isPending}
            className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <BtnIcon action="complete" />
            Marcar como concluído
          </button>
        )}

        {status === "CONFIRMED" && (
          <button
            type="button"
            onClick={() => run("noshow", () => markNoShowAction(appointmentId))}
            disabled={isPending}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <BtnIcon action="noshow" />
            Não compareceu
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowCancelForm((v) => !v)}
          disabled={isPending}
          className="flex items-center gap-2 rounded-md border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancelar agendamento
        </button>
      </div>

      {showCancelForm && (
        <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">Confirmar cancelamento</p>
          <textarea
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            placeholder="Motivo do cancelamento (opcional)"
            rows={2}
            maxLength={300}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => run("cancel", () => cancelAppointmentAction(appointmentId, cancelNote))}
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <BtnIcon action="cancel" />
              Confirmar cancelamento
            </button>
            <button
              type="button"
              onClick={() => setShowCancelForm(false)}
              className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
