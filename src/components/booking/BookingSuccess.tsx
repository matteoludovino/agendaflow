import Link from "next/link"
import Image from "next/image"
import { CalendarCheck, Mail } from "lucide-react"
import { formatCurrency, formatDuration, generateInitials } from "@/lib/utils"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

interface BookingSuccessProps {
  clientName: string
  clientEmail: string
  professionalName: string | null
  professionalImage: string | null
  professionalSlug: string
  serviceName: string
  serviceDuration: number
  servicePrice: number
  serviceColor: string
  date: string
  time: string
}

function formatBookingDate(dateStr: string): string {
  try {
    const d = parse(dateStr, "yyyy-MM-dd", new Date())
    return format(d, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function BookingSuccess({
  clientName,
  clientEmail,
  professionalName,
  professionalImage,
  professionalSlug,
  serviceName,
  serviceDuration,
  servicePrice,
  serviceColor,
  date,
  time,
}: BookingSuccessProps) {
  const firstName = clientName.split(" ")[0]
  const initials = generateInitials(professionalName ?? "P")

  return (
    <div className="flex flex-col items-center py-8 text-center animate-fade-in">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CalendarCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>

      <h2 className="mb-1 text-xl font-bold">Agendamento confirmado!</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Ótimo, {firstName}! Enviamos um e-mail de confirmação para{" "}
        <span className="font-medium text-foreground">{clientEmail}</span>.
      </p>

      <div className="mb-6 w-full rounded-xl border border-border bg-card p-5 text-left space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {professionalImage ? (
              <Image src={professionalImage} alt={professionalName ?? ""} width={64} height={64} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="font-semibold">{professionalName}</p>
            <p className="text-xs text-muted-foreground">{serviceName}</p>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium capitalize">{formatBookingDate(date)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Horário</span>
            <span className="font-medium">
              {time} · {formatDuration(serviceDuration)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valor</span>
            <span className="font-semibold">
              {servicePrice === 0 ? "Gratuito" : formatCurrency(servicePrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-left dark:bg-amber-900/20 w-full">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Guarde o e-mail de confirmação. Caso precise cancelar, entre em contato com o profissional.
        </p>
      </div>

      <Link
        href={`/${professionalSlug}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Voltar ao perfil
      </Link>
    </div>
  )
}
