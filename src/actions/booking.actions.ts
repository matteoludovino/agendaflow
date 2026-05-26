"use server"

import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/lib/validations/booking.schema"
import {
  calculateAvailableSlots,
  dateToPrismaDayOfWeek,
  buildDateTime,
} from "@/lib/slots"
import {
  sendClientConfirmationEmail,
  sendProfessionalNotificationEmail,
} from "@/lib/email"
import { BOOKING_CONFIG } from "@/lib/constants/config"
import type { ActionResult } from "@/types"

export async function getAvailableSlotsAction(params: {
  professionalId: string
  serviceId: string
  date: string
}): Promise<string[]> {
  const { professionalId, serviceId, date } = params

  const targetDate = new Date(date + "T12:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + BOOKING_CONFIG.maxAdvanceDays)

  if (targetDate < today || targetDate > maxDate) return []

  const dayOfWeek = dateToPrismaDayOfWeek(targetDate)

  const [user, service, availability, blocked, appointments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: professionalId },
      select: { bookingBuffer: true },
    }),
    prisma.service.findUnique({
      where: { id: serviceId, userId: professionalId, isActive: true },
      select: { duration: true },
    }),
    prisma.availability.findUnique({
      where: { userId_dayOfWeek: { userId: professionalId, dayOfWeek } },
    }),
    prisma.blockedDate.findFirst({
      where: {
        userId: professionalId,
        date: {
          gte: new Date(date + "T00:00:00"),
          lte: new Date(date + "T23:59:59"),
        },
      },
    }),
    prisma.appointment.findMany({
      where: {
        professionalId,
        startAt: {
          gte: new Date(date + "T00:00:00"),
          lte: new Date(date + "T23:59:59"),
        },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { startAt: true, endAt: true },
    }),
  ])

  if (!service || !availability || !availability.isActive || blocked) return []

  return calculateAvailableSlots({
    availabilityStart: availability.startTime,
    availabilityEnd: availability.endTime,
    serviceDuration: service.duration,
    bufferMinutes: user?.bookingBuffer ?? 0,
    existingAppointments: appointments,
    date: targetDate,
  })
}

export async function createAppointmentAction(
  data: unknown
): Promise<ActionResult<{ appointmentId: string }>> {
  const parsed = bookingSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const {
    professionalId,
    serviceId,
    clientName,
    clientEmail,
    clientPhone,
    clientNotes,
    date,
    time,
    timezone,
  } = parsed.data

  const [professional, service] = await Promise.all([
    prisma.user.findUnique({
      where: { id: professionalId },
      select: { id: true, name: true, email: true, bookingBuffer: true, timezone: true },
    }),
    prisma.service.findUnique({
      where: { id: serviceId, userId: professionalId, isActive: true },
      select: { id: true, name: true, duration: true, price: true },
    }),
  ])

  if (!professional || !service) {
    return { success: false, error: "Profissional ou serviço não encontrado" }
  }

  const startAt = buildDateTime(date, time)
  const endAt = new Date(startAt)
  endAt.setMinutes(endAt.getMinutes() + service.duration)

  if (startAt <= new Date()) {
    return { success: false, error: "Este horário não está mais disponível" }
  }

  const availableSlots = await getAvailableSlotsAction({
    professionalId,
    serviceId,
    date,
  })

  if (!availableSlots.includes(time)) {
    return {
      success: false,
      error: "Este horário não está mais disponível. Escolha outro.",
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      professionalId,
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      clientNotes,
      startAt,
      endAt,
      timezone,
      price: service.price,
      status: "PENDING",
    },
  })

  await prisma.notification.create({
    data: {
      userId: professionalId,
      type: "APPOINTMENT_CREATED",
      title: "Novo agendamento",
      message: `${clientName} agendou ${service.name} para ${startAt.toLocaleDateString("pt-BR")}.`,
      metadata: { appointmentId: appointment.id },
    },
  })

  const emailParams = {
    clientName,
    clientEmail,
    professionalName: professional.name ?? "Profissional",
    professionalEmail: professional.email ?? "",
    serviceName: service.name,
    serviceDuration: service.duration,
    servicePrice: service.price,
    startAt,
    timezone,
  }

  await Promise.allSettled([
    sendClientConfirmationEmail(emailParams),
    sendProfessionalNotificationEmail(emailParams),
  ])

  return { success: true, data: { appointmentId: appointment.id } }
}
