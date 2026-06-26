import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { PLANS } from "@/lib/constants/plans"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function findPlanByPriceId(priceId: string) {
  return Object.values(PLANS).find(
    (p) => p.stripePriceId && p.stripePriceId === priceId
  )
}

function nextMonthDate(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Configuração de webhook ausente" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("[webhook] Assinatura inválida:", err)
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (!userId || !planId) break

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: planId as any,
            stripeSubId: session.subscription as string,
            planExpiresAt: nextMonthDate(),
          },
        })

        await prisma.notification.create({
          data: {
            userId,
            type: "PLAN_UPGRADED",
            title: "Plano ativado!",
            message: `Seu plano ${PLANS[planId]?.name ?? planId} está ativo. Aproveite todos os recursos!`,
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        const priceId = sub.items.data[0]?.price.id
        const plan = priceId ? findPlanByPriceId(priceId) : null

        if (sub.status === "active" && plan) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: plan.id as any,
              planExpiresAt: new Date(sub.current_period_end * 1000),
            },
          })
        }

        if (sub.status === "past_due" || sub.status === "unpaid") {
          await prisma.notification.create({
            data: {
              userId,
              type: "PAYMENT_RECEIVED",
              title: "Problema no pagamento",
              message: "Atualize seu método de pagamento para manter o acesso ao plano.",
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await prisma.user.update({
          where: { id: userId },
          data: { plan: "FREE", stripeSubId: null, planExpiresAt: null },
        })

        await prisma.notification.create({
          data: {
            userId,
            type: "PLAN_UPGRADED",
            title: "Assinatura encerrada",
            message: "Sua assinatura foi cancelada. Você voltou ao plano Free.",
          },
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : null
        if (!subId) break

        await prisma.user.updateMany({
          where: { stripeSubId: subId },
          data: { planExpiresAt: nextMonthDate() },
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : null
        if (!customerId) break

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        })

        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "PAYMENT_RECEIVED",
              title: "Falha na cobrança",
              message:
                "Não conseguimos cobrar sua assinatura. Acesse o portal de faturamento para atualizar o cartão.",
            },
          })
        }
        break
      }

      default:
        console.log(`[webhook] Evento não tratado: ${event.type}`)
    }
  } catch (err) {
    console.error(`[webhook] Erro ao processar ${event.type}:`, err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
