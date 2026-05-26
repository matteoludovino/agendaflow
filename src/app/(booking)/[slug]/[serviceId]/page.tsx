import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ProfessionalHeader } from "@/components/booking/ProfessionalHeader"
import { BookingCalendar } from "@/components/booking/BookingCalendar"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { Clock } from "lucide-react"

interface PageProps {
  params: Promise<{ slug: string; serviceId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, serviceId } = await params

  const service = await prisma.service.findFirst({
    where: { id: serviceId, user: { slug }, isActive: true },
    select: { name: true },
  })

  return {
    title: service ? `Agendar — ${service.name}` : "Agendar",
  }
}

export default async function ServiceBookingPage({ params }: PageProps) {
  const { slug, serviceId } = await params

  const [professional, service] = await Promise.all([
    prisma.user.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
        slug: true,
        availability: {
          where: { isActive: true },
          select: { dayOfWeek: true },
        },
        blockedDates: {
          where: { date: { gte: new Date() } },
          select: { date: true },
        },
      },
    }),
    prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
      select: { id: true, name: true, duration: true, price: true, color: true, userId: true },
    }),
  ])

  if (!professional || !service || service.userId !== professional.id) notFound()

  const availableDays = professional.availability.map((a) => a.dayOfWeek as string)
  const blockedDates = professional.blockedDates.map(
    (b) => b.date.toISOString().split("T")[0]
  )

  return (
    <div className="animate-fade-in space-y-6">
      <ProfessionalHeader
        name={professional.name}
        bio={professional.bio}
        image={professional.image}
        slug={professional.slug}
        showBack
      />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 shrink-0 rounded-lg"
            style={{ backgroundColor: `${service.color}25`, border: `2px solid ${service.color}50` }}
          >
            <div
              className="m-auto mt-2.5 h-5 w-5 rounded-full"
              style={{ backgroundColor: service.color }}
            />
          </div>
          <div>
            <p className="font-semibold">{service.name}</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(service.duration)}
              </span>
              <span className="text-xs font-semibold">
                {service.price === 0 ? "Gratuito" : formatCurrency(service.price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold">Escolha uma data</h2>
        <BookingCalendar
          professionalId={professional.id}
          serviceId={service.id}
          slug={professional.slug}
          availableDays={availableDays}
          blockedDates={blockedDates}
        />
      </div>
    </div>
  )
}
