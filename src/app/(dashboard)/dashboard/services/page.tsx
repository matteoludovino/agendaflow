import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceList } from "@/components/services/ServiceList"

export const metadata: Metadata = { title: "Serviços" }

export default async function ServicesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [user, services] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    }),
    prisma.service.findMany({
      where: { userId: session.user.id },
      orderBy: { order: "asc" },
    }),
  ])

  return (
    <ServiceList
      services={services}
      userPlan={user?.plan ?? "FREE"}
      serviceCount={services.length}
    />
  )
}
