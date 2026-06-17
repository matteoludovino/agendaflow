"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<"div"> & {
  showOutsideDays?: boolean
  captionLayout?: string
  locale?: unknown
  formatters?: unknown
  components?: unknown
  mode?: string
  selected?: Date | Date[] | undefined
  onSelect?: (date: Date | undefined) => void
  disabled?: unknown
  fromDate?: Date
  toDate?: Date
  defaultMonth?: Date
  month?: Date
  onMonthChange?: (month: Date) => void
  numberOfMonths?: number
  pagedNavigation?: boolean
  showWeekNumber?: boolean
  weekStartsOn?: number
  fixedWeeks?: boolean
  ISOWeek?: boolean
}

function Calendar({
  className,
  selected,
  onSelect,
  disabled,
  fromDate,
  toDate,
  ...props
}: CalendarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelect) return
    const val = e.target.value
    onSelect(val ? new Date(val + "T12:00:00") : undefined)
  }

  const selectedDate =
    selected instanceof Date
      ? selected.toISOString().split("T")[0]
      : undefined

  const minDate = fromDate ? fromDate.toISOString().split("T")[0] : undefined
  const maxDate = toDate ? toDate.toISOString().split("T")[0] : undefined

  return (
    <div
      data-slot="calendar"
      className={cn("p-2", className)}
      {...props}
    >
      <input
        type="date"
        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={selectedDate ?? ""}
        onChange={handleChange}
        min={minDate}
        max={maxDate}
      />
    </div>
  )
}

function CalendarDayButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-9 w-full items-center justify-center rounded-md text-sm transition-all hover:bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
