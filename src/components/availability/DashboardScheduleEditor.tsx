"use client"

import { useState, useTransition } from "react"
import { Loader2, Clock, Save } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { saveAvailabilityAction } from "@/actions/availability.actions"
import type { Availability } from "@prisma/client"

interface DayConfig {
  dayOfWeek: string
  label: string
  shortLabel: string
  isActive: boolean
  startTime: string
  endTime: string
}

const WEEK_TEMPLATE: DayConfig[] = [
  { dayOfWeek: "MONDAY",    label: "Segunda-feira", shortLabel: "Seg", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "TUESDAY",   label: "Terça-feira",   shortLabel: "Ter", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "WEDNESDAY", label: "Quarta-feira",  shortLabel: "Qua", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "THURSDAY",  label: "Quinta-feira",  shortLabel: "Qui", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "FRIDAY",    label: "Sexta-feira",   shortLabel: "Sex", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "SATURDAY",  label: "Sábado",         shortLabel: "Sáb", isActive: false, startTime: "09:00", endTime: "13:00" },
  { dayOfWeek: "SUNDAY",    label: "Domingo",        shortLabel: "Dom", isActive: false, startTime: "09:00", endTime: "13:00" },
]

function buildSchedule(saved: Availability[]): DayConfig[] {
  return WEEK_TEMPLATE.map((def) => {
    const existing = saved.find((s) => s.dayOfWeek === def.dayOfWeek)
    if (!existing) return def
    return {
      ...def,
      isActive: existing.isActive,
      startTime: existing.startTime,
      endTime: existing.endTime,
    }
  })
}

interface DashboardScheduleEditorProps {
  initialAvailability: Availability[]
}

export function DashboardScheduleEditor({ initialAvailability }: DashboardScheduleEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [schedule, setSchedule] = useState<DayConfig[]>(() =>
    buildSchedule(initialAvailability)
  )
  const [hasChanges, setHasChanges] = useState(false)

  function toggleDay(dayOfWeek: string) {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isActive: !d.isActive } : d))
    )
    setHasChanges(true)
  }

  function updateTime(dayOfWeek: string, field: "startTime" | "endTime", value: string) {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    )
    setHasChanges(true)
  }

  function handleSave() {
    const hasActive = schedule.some((d) => d.isActive)
    if (!hasActive) {
      toast.error("Ative ao menos um dia de atendimento")
      return
    }

    const invalidDay = schedule.find((d) => d.isActive && d.startTime >= d.endTime)
    if (invalidDay) {
      toast.error(`${invalidDay.label}: início deve ser antes do término`)
      return
    }

    startTransition(async () => {
      const result = await saveAvailabilityAction({
        days: schedule.map(({ dayOfWeek, isActive, startTime, endTime }) => ({
          dayOfWeek: dayOfWeek as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY",
          isActive,
          startTime,
          endTime,
        })),
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Disponibilidade salva")
      setHasChanges(false)
    })
  }

  const activeDays = schedule.filter((d) => d.isActive).length

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dia da semana
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Horário de atendimento
          </span>
        </div>

        <ul className="divide-y divide-border">
          {schedule.map((day) => (
            <li
              key={day.dayOfWeek}
              className={cn(
                "flex items-center gap-4 px-4 py-3 transition-colors",
                day.isActive ? "bg-background" : "bg-muted/20"
              )}
            >
              <button
                type="button"
                role="switch"
                aria-checked={day.isActive}
                aria-label={`${day.isActive ? "Desativar" : "Ativar"} ${day.label}`}
                onClick={() => toggleDay(day.dayOfWeek)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  day.isActive ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform",
                    day.isActive ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </button>

              <span
                className={cn(
                  "w-32 text-sm font-medium",
                  !day.isActive && "text-muted-foreground"
                )}
              >
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{day.shortLabel}</span>
              </span>

              {day.isActive ? (
                <div className="ml-auto flex items-center gap-2">
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateTime(day.dayOfWeek, "startTime", e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm tabular-nums shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <span className="text-muted-foreground">—</span>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateTime(day.dayOfWeek, "endTime", e.target.value)}
                    className={cn(
                      "h-8 rounded-md border bg-background px-2 text-sm tabular-nums shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      day.startTime >= day.endTime
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input"
                    )}
                  />
                </div>
              ) : (
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Indisponível
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {activeDays === 0
            ? "Nenhum dia ativo"
            : `${activeDays} dia${activeDays !== 1 ? "s" : ""} ativo${activeDays !== 1 ? "s" : ""} por semana`}
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar horários
        </button>
      </div>
    </div>
  )
}
