"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"

async function verifyAppointmentOwnership(id: string, userId: string) {
  const apt = await prisma.appointment.findUnique({
    where: { id },
    select: { professionalId: true, status: true },
  })
  if (apt?.professionalId !== userId) return null
  return apt
}

export async function confirmAppointmentAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const apt = await verifyAppointmentOwnership(id, session.user.id)
  if (!apt) return { success: false, error: "Agendamento não encontrado" }
  if (apt.status !== "PENDING") return { success: false, error: "Apenas agendamentos pendentes podem ser confirmados" }

  await prisma.appointment.update({
    where: { id },
    data: { status: "CONFIRMED" },
  })

  revalidatePath("/dashboard/appointments")
  revalidatePath(`/dashboard/appointments/${id}`)
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function cancelAppointmentAction(
  id: string,
  note?: string
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const apt = await verifyAppointmentOwnership(id, session.user.id)
  if (!apt) return { success: false, error: "Agendamento não encontrado" }
  if (apt.status === "COMPLETED" || apt.status === "CANCELLED") {
    return { success: false, error: "Este agendamento não pode ser cancelado" }
  }

  await prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationNote: note ?? null,
    },
  })

  revalidatePath("/dashboard/appointments")
  revalidatePath(`/dashboard/appointments/${id}`)
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function completeAppointmentAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const apt = await verifyAppointmentOwnership(id, session.user.id)
  if (!apt) return { success: false, error: "Agendamento não encontrado" }
  if (apt.status !== "CONFIRMED") {
    return { success: false, error: "Apenas agendamentos confirmados podem ser concluídos" }
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "COMPLETED" },
  })

  revalidatePath("/dashboard/appointments")
  revalidatePath(`/dashboard/appointments/${id}`)
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function markNoShowAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const apt = await verifyAppointmentOwnership(id, session.user.id)
  if (!apt) return { success: false, error: "Agendamento não encontrado" }
  if (apt.status !== "CONFIRMED") {
    return { success: false, error: "Apenas agendamentos confirmados podem ser marcados como não compareceu" }
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "NO_SHOW" },
  })

  revalidatePath("/dashboard/appointments")
  revalidatePath(`/dashboard/appointments/${id}`)
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}
