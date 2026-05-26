import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardProfileForm } from "@/components/settings/DashboardProfileForm"
import { PageHeader } from "@/components/shared/index"

export const metadata: Metadata = { title: "Configurações de perfil" }

export default async function ProfileSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, bio: true, phone: true,
      timezone: true, slug: true, plan: true,
      bookingBuffer: true, image: true,
    },
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <PageHeader
        title="Perfil"
        description="Informações que aparecem na sua página pública de agendamento."
      />
      <DashboardProfileForm user={user} />
    </div>
  )
}
