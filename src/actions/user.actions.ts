"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { profileSchema } from "@/lib/validations/user.schema"
import { slugify } from "@/lib/utils"
import { z } from "zod"
import type { ActionResult } from "@/types"

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    phone: formData.get("phone"),
    timezone: formData.get("timezone"),
  })

  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  })

  revalidatePath("/onboarding")
  return { success: true, data: undefined }
}

const profileSettingsSchema = profileSchema.extend({
  bookingBuffer: z.coerce.number().int().min(0).max(60).default(0),
})

export async function updateProfileSettingsAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const parsed = profileSettingsSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    phone: formData.get("phone"),
    timezone: formData.get("timezone"),
    bookingBuffer: formData.get("bookingBuffer"),
  })

  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  })

  revalidatePath("/dashboard/settings/profile")
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function updateSlugAction(newSlug: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })

  if (user?.plan === "FREE") {
    return { success: false, error: "Slug personalizado disponível apenas no plano Pro ou superior" }
  }

  const slug = slugify(newSlug)
  if (slug.length < 3) return { success: false, error: "Slug deve ter ao menos 3 caracteres" }
  if (slug.length > 48) return { success: false, error: "Slug muito longo (máx. 48 caracteres)" }

  const taken = await prisma.user.findFirst({
    where: { slug, NOT: { id: session.user.id } },
  })

  if (taken) return { success: false, error: "Este slug já está em uso. Escolha outro." }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { slug },
  })

  revalidatePath("/dashboard/settings/profile")
  return { success: true, data: undefined }
}

export async function completeOnboardingAction(): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Não autorizado" }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingDone: true },
  })

  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function getCurrentUserAction() {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      phone: true,
      timezone: true,
      slug: true,
      plan: true,
      bookingBuffer: true,
      onboardingDone: true,
    },
  })
}
