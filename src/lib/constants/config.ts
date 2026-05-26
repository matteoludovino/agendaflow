export const APP_CONFIG = {
  name: "AgendaFlow",
  description: "Agendamento online para profissionais autônomos",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  defaultTimezone: "America/Sao_Paulo",
  defaultCurrency: "BRL",
  supportEmail: "suporte@agendaflow.com.br",
} as const

export const BOOKING_CONFIG = {
  minSlotDuration: 15,
  maxAdvanceDays: 90,
  defaultBuffer: 0,
  cancellationWindowHours: 24,
} as const

export const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Segunda-feira", short: "Seg" },
  { value: "TUESDAY", label: "Terça-feira", short: "Ter" },
  { value: "WEDNESDAY", label: "Quarta-feira", short: "Qua" },
  { value: "THURSDAY", label: "Quinta-feira", short: "Qui" },
  { value: "FRIDAY", label: "Sexta-feira", short: "Sex" },
  { value: "SATURDAY", label: "Sábado", short: "Sáb" },
  { value: "SUNDAY", label: "Domingo", short: "Dom" },
] as const

export const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "America/Belem", label: "Belém (GMT-3)" },
  { value: "America/Fortaleza", label: "Fortaleza (GMT-3)" },
  { value: "America/Recife", label: "Recife (GMT-3)" },
  { value: "America/Porto_Velho", label: "Porto Velho (GMT-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
] as const

export const SERVICE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
] as const
