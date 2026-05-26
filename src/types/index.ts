import type { User, Service, Appointment, Notification, Availability } from "@prisma/client"

export type UserPublicProfile = Pick<
  User,
  "id" | "name" | "image" | "slug" | "bio" | "timezone" | "currency"
>

export type ServiceWithStats = Service & {
  _count: { appointments: number }
}

export type AppointmentWithService = Appointment & {
  service: Service
}

export type AppointmentWithDetails = Appointment & {
  service: Service
  professional: Pick<User, "id" | "name" | "email" | "image" | "slug">
}

export type DashboardStats = {
  todayAppointments: number
  weekAppointments: number
  monthRevenue: number
  totalClients: number
  confirmationRate: number
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export type TimeSlot = {
  time: string
  available: boolean
}

export type AvailabilityByDay = Record<string, Availability>
