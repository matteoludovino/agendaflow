"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serviceSchema } from "@/lib/validations/service.schema"
import { isWithinLimit } from "@/lib/constants/plans"
import type { ActionResult } from "@/types"
import type { Service } from "@prisma/client"

async function verifyOwnership(serviceId: string, userId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { userId: true },
  })
  return service?.userId === userId
}

export async function createServiceAction(
  formData: FormData
): Promise<ActionResult<Service>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })

  const serviceCount = await prisma.service.count({
    where: { userId: session.user.id },
  })

  if (!isWithinLimit(user?.plan ?? "FREE", "services", serviceCount)) {
    return {
      success: false,
      error: `Limite do plano atingido. Faça upgrade para criar mais serviços.`,
    }
  }

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    price: formData.get("price"),
    color: formData.get("color"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const maxOrder = await prisma.service.aggregate({
    where: { userId: session.user.id },
    _max: { order: true },
  })

  const service = await prisma.service.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  })

  revalidatePath("/dashboard/services")
  return { success: true, data: service }
}

export async function updateServiceAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Service>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const owns = await verifyOwnership(id, session.user.id)
  if (!owns) return { success: false, error: "Serviço não encontrado" }

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    duration: formData.get("duration"),
    price: formData.get("price"),
    color: formData.get("color"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const service = await prisma.service.update({
    where: { id },
    data: parsed.data,
  })

  revalidatePath("/dashboard/services")
  return { success: true, data: service }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const owns = await verifyOwnership(id, session.user.id)
  if (!owns) return { success: false, error: "Serviço não encontrado" }

  const futureAppointments = await prisma.appointment.count({
    where: {
      serviceId: id,
      startAt: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  })

  if (futureAppointments > 0) {
    return {
      success: false,
      error: `Há ${futureAppointments} agendamento(s) futuro(s) para este serviço. Cancele-os antes de excluir.`,
    }
  }

  await prisma.service.delete({ where: { id } })

  revalidatePath("/dashboard/services")
  return { success: true, data: undefined }
}

export async function toggleServiceAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const owns = await verifyOwnership(id, session.user.id)
  if (!owns) return { success: false, error: "Serviço não encontrado" }

  const service = await prisma.service.findUnique({
    where: { id },
    select: { isActive: true },
  })

  await prisma.service.update({
    where: { id },
    data: { isActive: !service?.isActive },
  })

  revalidatePath("/dashboard/services")
  return { success: true, data: undefined }
}

export async function reorderServicesAction(
  orderedIds: string[]
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.service.updateMany({
        where: { id, userId: session.user.id },
        data: { order: index },
      })
    )
  )

  revalidatePath("/dashboard/services")
  return { success: true, data: undefined }
}
