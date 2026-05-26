"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"

export async function markNotificationAsReadAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { isRead: true },
  })

  revalidatePath("/dashboard/notifications")
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function markAllNotificationsAsReadAction(): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  })

  revalidatePath("/dashboard/notifications")
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function deleteNotificationAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  await prisma.notification.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/dashboard/notifications")
  return { success: true, data: undefined }
}
