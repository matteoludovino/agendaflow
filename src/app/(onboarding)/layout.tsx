import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarCheck } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress"
import { APP_CONFIG } from "@/lib/constants/config"

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingDone: true },
  })

  if (user?.onboardingDone) redirect("/dashboard")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CalendarCheck className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold">{APP_CONFIG.name}</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-xl space-y-10">
          <OnboardingProgress />
          <div className="animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  )
}
