import { z } from "zod"

const TIME_REGEX = /^\d{2}:\d{2}$/

export const availabilityDaySchema = z
  .object({
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    isActive: z.boolean(),
    startTime: z.string().regex(TIME_REGEX, "Horário inválido"),
    endTime: z.string().regex(TIME_REGEX, "Horário inválido"),
  })
  .refine(
    (data) => !data.isActive || data.startTime < data.endTime,
    {
      message: "Horário de início deve ser antes do término",
      path: ["endTime"],
    }
  )

export const availabilitySchema = z.object({
  days: z
    .array(availabilityDaySchema)
    .min(1, "Configure ao menos um dia")
    .refine((days) => days.some((d) => d.isActive), {
      message: "Ative ao menos um dia de atendimento",
    }),
})

export type AvailabilityDayInput = z.infer<typeof availabilityDaySchema>
export type AvailabilityInput = z.infer<typeof availabilitySchema>
