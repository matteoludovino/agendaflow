import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ProfessionalHeader } from "@/components/booking/ProfessionalHeader"
import { BookingForm } from "@/components/booking/BookingForm"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { Calendar, Clock, DollarSign } from "lucide-react"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ serviceId?: string; date?: string; time?: string }>
}

export const metadata: Metadata = { title: "Confirmar agendamento" }

function formatBookingDate(dateStr: string): string {
  try {
    const d = parse(dateStr, "yyyy-MM-dd", new Date())
    return format(d, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export default async function ConfirmPage({ params, searchParams }: PageProps) {
  const [{ slug }, { serviceId, date, time }] = await Promise.all([params, searchParams])

  if (!serviceId || !date || !time) redirect(`/${slug}`)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    redirect(`/${slug}`)
  }

  const [professional, service] = await Promise.all([
    prisma.user.findUnique({
      where: { slug },
      select: { id: true, name: true, bio: true, image: true, slug: true },
    }),
    prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
      select: { id: true, name: true, duration: true, price: true, color: true, userId: true },
    }),
  ])

  if (!professional || !service || service.userId !== professional.id) notFound()

  return (
    <div className="animate-fade-in space-y-6">
      <ProfessionalHeader
        name={professional.name}
        bio={professional.bio}
        image={professional.image}
        slug={professional.slug}
        showBack
        backLabel="Escolher outro horário"
      />

      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <h2 className="font-semibold">Resumo</h2>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 shrink-0 rounded-lg"
                style={{
                  backgroundColor: `${service.color}25`,
                  border: `2px solid ${service.color}50`,
                }}
              >
                <div
                  className="m-auto mt-2.5 h-5 w-5 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
              </div>
              <div>
                <p className="font-semibold">{service.name}</p>
                <p className="text-xs text-muted-foreground">com {professional.name}</p>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-border pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="capitalize">{formatBookingDate(date)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  {time} · {formatDuration(service.duration)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-semibold">
                  {service.price === 0 ? "Gratuito" : formatCurrency(service.price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">Seus dados</h2>
          <BookingForm
            professionalId={professional.id}
            professionalName={professional.name ?? "Profissional"}
            professionalImage={professional.image}
            professionalSlug={professional.slug}
            serviceId={service.id}
            serviceName={service.name}
            serviceDuration={service.duration}
            servicePrice={service.price}
            serviceColor={service.color}
            date={date}
            time={time}
          />
        </div>
      </div>
    </div>
  )
}
