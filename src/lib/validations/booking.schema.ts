import { z } from "zod"

export const bookingSchema = z.object({
  professionalId: z.string().cuid("ID inválido"),
  serviceId: z.string().cuid("Serviço inválido"),
  clientName: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(80, "Nome muito longo"),
  clientEmail: z.string().email("E-mail inválido"),
  clientPhone: z
    .string()
    .max(20, "Telefone inválido")
    .optional()
    .transform((v) => v || undefined),
  clientNotes: z
    .string()
    .max(500, "Observações muito longas")
    .optional()
    .transform((v) => v || undefined),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  timezone: z.string().default("America/Sao_Paulo"),
})

export type BookingInput = z.infer<typeof bookingSchema>
