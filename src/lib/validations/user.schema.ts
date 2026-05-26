import { z } from "zod"

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(80, "Nome muito longo"),
  bio: z
    .string()
    .max(300, "Bio deve ter no máximo 300 caracteres")
    .optional()
    .transform((v) => v ?? ""),
  phone: z
    .string()
    .max(20, "Telefone inválido")
    .optional()
    .transform((v) => v ?? ""),
  timezone: z.string().min(1, "Fuso horário obrigatório"),
})

export type ProfileInput = z.infer<typeof profileSchema>
