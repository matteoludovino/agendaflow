"use server"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { PLANS } from "@/lib/constants/plans"
import { APP_CONFIG } from "@/lib/constants/config"
import type { ActionResult } from "@/types"

async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true, name: true },
  })

  if (!user) throw new Error("Usuário não encontrado")
  if (user.stripeCustomerId) return user.stripeCustomerId

  const customer = await stripe.customers.create({
    email: user.email!,
    name: user.name ?? undefined,
    metadata: { userId },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

export async function createCheckoutSessionAction(
  planId: "PRO" | "BUSINESS"
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const plan = PLANS[planId]
  if (!plan?.stripePriceId) {
    return {
      success: false,
      error: `Preço do plano ${planId} não configurado. Defina STRIPE_${planId}_PRICE_ID no .env.`,
    }
  }

  try {
    const customerId = await getOrCreateStripeCustomer(session.user.id)

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${APP_CONFIG.url}/dashboard/settings/billing?success=true`,
      cancel_url: `${APP_CONFIG.url}/dashboard/upgrade`,
      locale: "pt-BR",
      metadata: { userId: session.user.id, planId },
      subscription_data: {
        metadata: { userId: session.user.id, planId },
      },
    })

    redirect(checkout.url!)
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err
    console.error("[stripe] createCheckoutSession:", err)
    return { success: false, error: "Erro ao iniciar checkout. Tente novamente." }
  }
}

export async function createPortalSessionAction(): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    return { success: false, error: "Nenhuma assinatura ativa encontrada." }
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${APP_CONFIG.url}/dashboard/settings/billing`,
    })

    redirect(portal.url)
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err
    console.error("[stripe] createPortalSession:", err)
    return { success: false, error: "Erro ao abrir portal. Tente novamente." }
  }
}
