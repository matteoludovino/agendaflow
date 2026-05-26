import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [user, unreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingDone: true, plan: true, slug: true },
    }),
    prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ])

  if (!user?.onboardingDone) redirect("/onboarding")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userPlan={user.plan} userSlug={user.slug} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={{ ...session.user, plan: user.plan, slug: user.slug }}
          unreadNotifications={unreadCount}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
