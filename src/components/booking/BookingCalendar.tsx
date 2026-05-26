"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvailableSlotsAction } from "@/actions/booking.actions"
import { BOOKING_CONFIG } from "@/lib/constants/config"

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const DOW_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const JS_DOW_TO_PRISMA = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
]

interface BookingCalendarProps {
  professionalId: string
  serviceId: string
  slug: string
  availableDays: string[]
  blockedDates: string[]
}

export function BookingCalendar({
  professionalId,
  serviceId,
  slug,
  availableDays,
  blockedDates,
}: BookingCalendarProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + BOOKING_CONFIG.maxAdvanceDays)

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(today)
    d.setDate(1)
    return d
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  function prevMonth() {
    setViewDate((d) => {
      const n = new Date(d)
      n.setMonth(n.getMonth() - 1)
      return n
    })
  }

  function nextMonth() {
    setViewDate((d) => {
      const n = new Date(d)
      n.setMonth(n.getMonth() + 1)
      return n
    })
  }

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarCells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  function isDayAvailable(day: number): boolean {
    const d = new Date(year, month, day)
    d.setHours(0, 0, 0, 0)
    if (d < today || d > maxDate) return false

    const dow = JS_DOW_TO_PRISMA[d.getDay()]
    if (!availableDays.includes(dow)) return false

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    if (blockedDates.includes(dateStr)) return false

    return true
  }

  function formatDateStr(day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  async function handleDaySelect(day: number) {
    if (!isDayAvailable(day)) return
    const dateStr = formatDateStr(day)
    setSelectedDate(dateStr)
    setSelectedSlot(null)
    setSlots([])
    setLoadingSlots(true)

    const result = await getAvailableSlotsAction({
      professionalId,
      serviceId,
      date: dateStr,
    })

    setSlots(result)
    setLoadingSlots(false)
  }

  function handleContinue() {
    if (!selectedDate || !selectedSlot) return
    startTransition(() => {
      router.push(
        `/${slug}/confirm?serviceId=${serviceId}&date=${selectedDate}&time=${encodeURIComponent(selectedSlot)}`
      )
    })
  }

  const canGoBack =
    viewDate.getFullYear() > today.getFullYear() ||
    viewDate.getMonth() > today.getMonth()

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={prevMonth}
            disabled={!canGoBack}
            aria-label="Mês anterior"
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Próximo mês"
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <div className="mb-1 grid grid-cols-7">
            {DOW_LABELS.map((d) => (
              <div key={d} className="py-1.5 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />

              const dateStr = formatDateStr(day)
              const available = isDayAvailable(day)
              const isSelected = selectedDate === dateStr
              const isToday =
                new Date(year, month, day).toDateString() === today.toDateString()

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!available}
                  onClick={() => handleDaySelect(day)}
                  className={cn(
                    "relative flex h-9 w-full items-center justify-center rounded-md text-sm transition-all",
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : available
                      ? "hover:bg-primary/10 hover:text-primary font-medium"
                      : "cursor-default text-muted-foreground/40",
                    isToday && !isSelected && "font-bold text-primary underline decoration-dotted underline-offset-2"
                  )}
                >
                  {day}
                  {available && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary/50" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Escolha um horário</h3>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
              <Clock className="mb-2 h-6 w-6 text-muted-foreground/50" />
              <p className="text-sm font-medium">Sem horários disponíveis</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Escolha outro dia no calendário
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "rounded-lg border py-2.5 text-sm font-medium transition-all",
                    selectedSlot === slot
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedDate && selectedSlot && (
        <button
          type="button"
          onClick={handleContinue}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            `Continuar com ${selectedSlot}`
          )}
        </button>
      )}
    </div>
  )
}
