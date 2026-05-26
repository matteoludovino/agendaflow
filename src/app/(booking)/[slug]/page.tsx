import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ProfessionalHeader } from "@/components/booking/ProfessionalHeader"
import { ServiceCard } from "@/components/booking/ServiceCard"
import { CalendarX } from "lucide-react"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const user = await prisma.user.findUnique({
    where: { slug },
    select: { name: true, bio: true },
  })

  if (!user) return { title: "Profissional não encontrado" }

  return {
    title: `Agendar com ${user.name}`,
    description: user.bio ?? `Agende um horário com ${user.name} pelo AgendaFlow.`,
  }
}

export default async function ProfessionalPage({ params }: PageProps) {
  const { slug } = await params

  const professional = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      slug: true,
      services: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!professional) notFound()

  return (
    <div className="animate-fade-in space-y-8">
      <ProfessionalHeader
        name={professional.name}
        bio={professional.bio}
        image={professional.image}
        slug={professional.slug}
      />

      {professional.services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 text-center">
          <CalendarX className="mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="font-medium">Nenhum serviço disponível</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Este profissional ainda não cadastrou serviços.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {professional.services.length} serviço{professional.services.length !== 1 ? "s" : ""} disponíve{professional.services.length !== 1 ? "is" : "l"}
          </p>
          <div className="space-y-3">
            {professional.services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                duration={service.duration}
                price={service.price}
                color={service.color}
                slug={professional.slug}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
