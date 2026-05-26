"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, CalendarX, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { addBlockedDateAction, removeBlockedDateAction } from "@/actions/availability.actions"
import type { BlockedDate } from "@prisma/client"

interface BlockedDatesManagerProps {
  blockedDates: BlockedDate[]
}

export function BlockedDatesManager({ blockedDates }: BlockedDatesManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedDate, setSelectedDate] = useState("")
  const [reason, setReason] = useState("")
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]

  function handleAdd() {
    if (!selectedDate) {
      toast.error("Selecione uma data")
      return
    }

    startTransition(async () => {
      const result = await addBlockedDateAction(selectedDate, reason || undefined)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Data bloqueada com sucesso")
      setSelectedDate("")
      setReason("")
      router.refresh()
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await removeBlockedDateAction(id)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success("Data desbloqueada")
        router.refresh()
      }
      setConfirmId(null)
    })
  }

  const sorted = [...blockedDates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <p className="mb-3 text-sm font-medium">Bloquear nova data</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="block-date" className="text-xs text-muted-foreground">
              Data <span className="text-destructive">*</span>
            </label>
            <input
              id="block-date"
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex-[2] space-y-1.5">
            <label htmlFor="block-reason" className="text-xs text-muted-foreground">
              Motivo (opcional)
            </label>
            <input
              id="block-reason"
              type="text"
              placeholder="Ex: Férias, feriado, evento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={80}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || !selectedDate}
            className="flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Bloquear
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
          <CalendarX className="mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">Nenhuma data bloqueada</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bloqueie datas em que você não estará disponível para atendimento.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border bg-muted/40 px-4 py-2.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {sorted.length} data{sorted.length !== 1 ? "s" : ""} bloqueada{sorted.length !== 1 ? "s" : ""}
            </span>
          </div>

          <ul className="divide-y divide-border">
            {sorted.map((blocked) => {
              const isConfirming = confirmId === blocked.id
              const isPast = new Date(blocked.date) < new Date(today)

              return (
                <li
                  key={blocked.id}
                  className={cn(
                    "flex items-center justify-between gap-4 px-4 py-3",
                    isPast && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      isPast ? "bg-muted" : "bg-destructive/10"
                    )}>
                      <CalendarX className={cn(
                        "h-4 w-4",
                        isPast ? "text-muted-foreground" : "text-destructive"
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{formatDate(blocked.date)}</p>
                      {blocked.reason ? (
                        <p className="text-xs text-muted-foreground">{blocked.reason}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground/50">Sem motivo informado</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isConfirming ? (
                      <>
                        <span className="text-xs text-muted-foreground">Remover?</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(blocked.id)}
                          disabled={isPending}
                          className="rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                        >
                          Não
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(blocked.id)}
                        disabled={isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        aria-label="Remover bloqueio"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
