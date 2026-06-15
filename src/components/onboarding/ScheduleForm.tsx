"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Clock } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { saveAvailabilityAction } from "@/actions/availability.actions"
import type { Availability } from "@prisma/client"

type DayOfWeekEnum =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"

interface DayConfig {
  dayOfWeek: DayOfWeekEnum
  label: string
  shortLabel: string
  isActive: boolean
  startTime: string
  endTime: string
}

const DEFAULT_SCHEDULE: DayConfig[] = [
  { dayOfWeek: "MONDAY",    label: "Segunda-feira", shortLabel: "Seg", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "TUESDAY",   label: "Terça-feira",   shortLabel: "Ter", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "WEDNESDAY", label: "Quarta-feira",  shortLabel: "Qua", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "THURSDAY",  label: "Quinta-feira",  shortLabel: "Qui", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "FRIDAY",    label: "Sexta-feira",   shortLabel: "Sex", isActive: true,  startTime: "09:00", endTime: "18:00" },
  { dayOfWeek: "SATURDAY",  label: "Sábado",         shortLabel: "Sáb", isActive: false, startTime: "09:00", endTime: "13:00" },
  { dayOfWeek: "SUNDAY",    label: "Domingo",        shortLabel: "Dom", isActive: false, startTime: "09:00", endTime: "13:00" },
]

function mergeWithSaved(saved: Availability[]): DayConfig[] {
  return DEFAULT_SCHEDULE.map((def) => {
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

interface ScheduleFormProps {
  initialAvailability: Availability[]
}

export function ScheduleForm({ initialAvailability }: ScheduleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [schedule, setSchedule] = useState<DayConfig[]>(() =>
    mergeWithSaved(initialAvailability)
  )

  function toggleDay(dayOfWeek: DayOfWeekEnum) {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, isActive: !d.isActive } : d
      )
    )
  }

  function updateTime(dayOfWeek: DayOfWeekEnum, field: "startTime" | "endTime", value: string) {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    )
  }

  function handleSubmit() {
    const hasActive = schedule.some((d) => d.isActive)
    if (!hasActive) {
      toast.error("Ative ao menos um dia de atendimento")
      return
    }

    const invalidDay = schedule.find(
      (d) => d.isActive && d.startTime >= d.endTime
    )
    if (invalidDay) {
      toast.error(
        `${invalidDay.label}: horário de início deve ser antes do término`
      )
      return
    }

    startTransition(async () => {
      const result = await saveAvailabilityAction({
        days: schedule.map(({ dayOfWeek, isActive, startTime, endTime }) => ({
          dayOfWeek,
          isActive,
          startTime,
          endTime,
        })),
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      router.push("/onboarding/plan")
    })
  }

  const activeDays = schedule.filter((d) => d.isActive).length

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border bg-muted/40 px-4 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Dia da semana
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Horário de atendimento
            </span>
          </div>
        </div>

        <ul className="divide-y divide-border">
          {schedule.map((day) => (
            <li
              key={day.dayOfWeek}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 transition-colors",
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
            : `${activeDays} dia${activeDays > 1 ? "s" : ""} ativo${activeDays > 1 ? "s" : ""}`}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex h-9 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
