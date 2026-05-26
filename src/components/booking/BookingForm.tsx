"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createAppointmentAction } from "@/actions/booking.actions"
import { BookingSuccess } from "./BookingSuccess"

interface BookingFormProps {
  professionalId: string
  professionalName: string
  professionalImage: string | null
  professionalSlug: string
  serviceId: string
  serviceName: string
  serviceDuration: number
  servicePrice: number
  serviceColor: string
  date: string
  time: string
}

interface SuccessData {
  clientName: string
  clientEmail: string
}

export function BookingForm({
  professionalId,
  professionalName,
  professionalImage,
  professionalSlug,
  serviceId,
  serviceName,
  serviceDuration,
  servicePrice,
  serviceColor,
  date,
  time,
}: BookingFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState<SuccessData | null>(null)

  if (success) {
    return (
      <BookingSuccess
        clientName={success.clientName}
        clientEmail={success.clientEmail}
        professionalName={professionalName}
        professionalImage={professionalImage}
        professionalSlug={professionalSlug}
        serviceName={serviceName}
        serviceDuration={serviceDuration}
        servicePrice={servicePrice}
        serviceColor={serviceColor}
        date={date}
        time={time}
      />
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const clientName = fd.get("clientName") as string
    const clientEmail = fd.get("clientEmail") as string

    startTransition(async () => {
      const result = await createAppointmentAction({
        professionalId,
        serviceId,
        clientName,
        clientEmail,
        clientPhone: (fd.get("clientPhone") as string) || undefined,
        clientNotes: (fd.get("clientNotes") as string) || undefined,
        date,
        time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      setSuccess({ clientName, clientEmail })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="clientName" className="text-sm font-medium">
          Nome completo <span className="text-destructive">*</span>
        </label>
        <input
          id="clientName"
          name="clientName"
          type="text"
          required
          minLength={2}
          maxLength={80}
          placeholder="Seu nome"
          autoComplete="name"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="clientEmail" className="text-sm font-medium">
          E-mail <span className="text-destructive">*</span>
        </label>
        <input
          id="clientEmail"
          name="clientEmail"
          type="email"
          required
          placeholder="voce@email.com"
          autoComplete="email"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Confirmação será enviada para este e-mail.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="clientPhone" className="text-sm font-medium">
          Telefone / WhatsApp
        </label>
        <input
          id="clientPhone"
          name="clientPhone"
          type="tel"
          placeholder="(11) 99999-9999"
          autoComplete="tel"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="clientNotes" className="text-sm font-medium">
          Observações
        </label>
        <textarea
          id="clientNotes"
          name="clientNotes"
          rows={3}
          maxLength={500}
          placeholder="Alguma informação relevante para o profissional?"
          className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Confirmar agendamento"
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Ao confirmar, você concorda com os{" "}
        <a href="/terms" className="underline hover:text-foreground">
          termos de uso
        </a>{" "}
        do AgendaFlow.
      </p>
    </form>
  )
}
