import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "@/components/onboarding/ProfileForm"

export const metadata: Metadata = { title: "Perfil — Onboarding" }

export default async function OnboardingProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      bio: true,
      phone: true,
      timezone: true,
      image: true,
    },
  })

  return (
    <div className="space-y-8">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Conte um pouco sobre você</h1>
        <p className="text-sm text-muted-foreground">
          Essas informações aparecem na sua página pública de agendamento.
        </p>
      </div>

      <ProfileForm
        initialData={{
          name: user?.name ?? null,
          bio: user?.bio ?? null,
          phone: user?.phone ?? null,
          timezone: user?.timezone ?? "America/Sao_Paulo",
          image: user?.image ?? null,
        }}
      />
    </div>
  )
}
