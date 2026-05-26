import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/index"
import { NotificationList } from "@/components/notifications/NotificationList"

export const metadata: Metadata = { title: "Notificações" }

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notificações"
        description={
          unreadCount > 0
            ? `${unreadCount} não lida${unreadCount !== 1 ? "s" : ""}`
            : "Tudo em dia"
        }
      />
      <NotificationList notifications={notifications} />
    </div>
  )
}
