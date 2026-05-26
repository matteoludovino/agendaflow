"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { availabilitySchema, type AvailabilityInput } from "@/lib/validations/availability.schema"
import type { DayOfWeek } from "@prisma/client"
import type { ActionResult } from "@/types"

export async function saveAvailabilityAction(
  data: AvailabilityInput
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const parsed = availabilitySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  await Promise.all(
    parsed.data.days.map((day) =>
      prisma.availability.upsert({
        where: {
          userId_dayOfWeek: {
            userId: session.user.id,
            dayOfWeek: day.dayOfWeek as DayOfWeek,
          },
        },
        create: {
          userId: session.user.id,
          dayOfWeek: day.dayOfWeek as DayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
          isActive: day.isActive,
        },
        update: {
          startTime: day.startTime,
          endTime: day.endTime,
          isActive: day.isActive,
        },
      })
    )
  )

  revalidatePath("/dashboard/availability")
  return { success: true, data: undefined }
}

export async function getAvailabilityAction() {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.availability.findMany({
    where: { userId: session.user.id },
    orderBy: { dayOfWeek: "asc" },
  })
}

export async function addBlockedDateAction(
  date: string,
  reason?: string
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) {
    return { success: false, error: "Data inválida" }
  }

  if (parsed < new Date(new Date().setHours(0, 0, 0, 0))) {
    return { success: false, error: "Não é possível bloquear datas passadas" }
  }

  const exists = await prisma.blockedDate.findFirst({
    where: {
      userId: session.user.id,
      date: { gte: new Date(date + "T00:00:00"), lte: new Date(date + "T23:59:59") },
    },
  })

  if (exists) {
    return { success: false, error: "Essa data já está bloqueada" }
  }

  await prisma.blockedDate.create({
    data: {
      userId: session.user.id,
      date: new Date(date + "T12:00:00"),
      reason: reason?.trim() || null,
    },
  })

  revalidatePath("/dashboard/availability")
  return { success: true, data: undefined }
}

export async function removeBlockedDateAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const blocked = await prisma.blockedDate.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (blocked?.userId !== session.user.id) {
    return { success: false, error: "Data não encontrada" }
  }

  await prisma.blockedDate.delete({ where: { id } })

  revalidatePath("/dashboard/availability")
  return { success: true, data: undefined }
}
