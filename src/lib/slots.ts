import type { Appointment } from "@prisma/client"

const JS_DOW_TO_PRISMA = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const

export function dateToPrismaDayOfWeek(date: Date) {
  return JS_DOW_TO_PRISMA[date.getDay()]
}

export function dateToLocalString(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function buildDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  const [hours, minutes] = timeStr.split(":").map(Number)
  const d = new Date()
  d.setFullYear(year, month - 1, day)
  d.setHours(hours, minutes, 0, 0)
  return d
}

interface SlotParams {
  availabilityStart: string
  availabilityEnd: string
  serviceDuration: number
  bufferMinutes: number
  existingAppointments: Pick<Appointment, "startAt" | "endAt">[]
  date: Date
}

export function calculateAvailableSlots(params: SlotParams): string[] {
  const {
    availabilityStart,
    availabilityEnd,
    serviceDuration,
    bufferMinutes,
    existingAppointments,
    date,
  } = params

  const slots: string[] = []

  const [startH, startM] = availabilityStart.split(":").map(Number)
  const [endH, endM] = availabilityEnd.split(":").map(Number)

  let cursor = startH * 60 + startM
  const windowEnd = endH * 60 + endM
  const now = new Date()

  while (cursor + serviceDuration <= windowEnd) {
    const h = Math.floor(cursor / 60)
    const m = cursor % 60

    const slotStart = new Date(date)
    slotStart.setHours(h, m, 0, 0)

    const slotEnd = new Date(slotStart)
    slotEnd.setTime(slotEnd.getTime() + serviceDuration * 60_000)

    const isPast = slotStart <= now

    const isBlocked =
      !isPast &&
      existingAppointments.some((apt) => {
        const aptEndWithBuffer = new Date(apt.endAt)
        aptEndWithBuffer.setTime(aptEndWithBuffer.getTime() + bufferMinutes * 60_000)
        return slotStart < aptEndWithBuffer && slotEnd > new Date(apt.startAt)
      })

    if (!isPast && !isBlocked) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    }

    cursor += serviceDuration
  }

  return slots
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
