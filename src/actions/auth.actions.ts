"use server"

import { AuthError } from "next-auth"
import bcrypt from "bcryptjs"
import { signIn, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { registerSchema, loginSchema } from "@/lib/validations/auth.schema"
import { slugify } from "@/lib/utils"
import type { ActionResult } from "@/types"

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: "E-mail já cadastrado" }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const baseSlug = slugify(name).slice(0, 48) || "usuario"
  let slug = baseSlug
  let i = 1
  while (await prisma.user.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`
  }

  await prisma.user.create({
    data: { name, email, passwordHash, slug },
  })

  return { success: true, data: undefined }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "E-mail ou senha incorretos" }
        default:
          return { success: false, error: "Algo deu errado. Tente novamente." }
      }
    }
    throw error
  }

  return { success: true, data: undefined }
}

export async function loginWithGoogleAction() {
  await signIn("google", { redirectTo: "/dashboard" })
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
