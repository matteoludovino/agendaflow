import { z } from "zod"

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "Nome obrigatório")
    .max(80, "Nome muito longo"),
  description: z
    .string()
    .max(500, "Descrição muito longa")
    .optional()
    .transform((v) => v ?? ""),
  duration: z.coerce
    .number({ invalid_type_error: "Duração inválida" })
    .int("Duração deve ser número inteiro")
    .min(15, "Mínimo de 15 minutos")
    .max(480, "Máximo de 8 horas (480 minutos)"),
  price: z.coerce
    .number({ invalid_type_error: "Preço inválido" })
    .min(0, "Preço não pode ser negativo")
    .max(99999, "Preço muito alto"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
    .default("#6366f1"),
})

export const reorderSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
})

export type ServiceInput = z.infer<typeof serviceSchema>
