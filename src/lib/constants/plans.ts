export interface PlanLimits {
  services: number
  appointmentsPerMonth: number
  customSlug: boolean
  reminderEmails: boolean
  analytics: boolean
  prioritySupport: boolean
  removeAgendaflowBranding: boolean
  clientsPage: boolean
}

export interface PlanConfig {
  id: "FREE" | "PRO" | "BUSINESS"
  name: string
  price: number
  description: string
  featured?: boolean
  stripePriceId: string
  features: string[]
  limits: PlanLimits
}

export const PLANS: Record<string, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    price: 0,
    description: "Para começar sem compromisso",
    stripePriceId: "",
    features: [
      "Até 3 serviços",
      "20 agendamentos/mês",
      "Página pública de agendamento",
      "E-mail de confirmação",
      "Slug padrão (agendaflow.com/nome)",
    ],
    limits: {
      services: 3,
      appointmentsPerMonth: 20,
      customSlug: false,
      reminderEmails: false,
      analytics: false,
      prioritySupport: false,
      removeAgendaflowBranding: false,
      clientsPage: false,
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: 49,
    featured: true,
    description: "Para autônomos que levam a sério",
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    features: [
      "Serviços ilimitados",
      "200 agendamentos/mês",
      "Slug personalizado",
      "E-mails de lembrete automáticos",
      "Analytics básico",
      "Sem marca AgendaFlow",
    ],
    limits: {
      services: -1,
      appointmentsPerMonth: 200,
      customSlug: true,
      reminderEmails: true,
      analytics: true,
      prioritySupport: false,
      removeAgendaflowBranding: true,
      clientsPage: false,
    },
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business",
    price: 99,
    description: "Para quem gerencia uma equipe",
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? "",
    features: [
      "Tudo do Pro",
      "Agendamentos ilimitados",
      "CRM de clientes",
      "Relatórios avançados",
      "Suporte prioritário",
      "API de integração",
    ],
    limits: {
      services: -1,
      appointmentsPerMonth: -1,
      customSlug: true,
      reminderEmails: true,
      analytics: true,
      prioritySupport: true,
      removeAgendaflowBranding: true,
      clientsPage: true,
    },
  },
}

export function canDo(plan: string, feature: keyof PlanLimits): boolean {
  const limits = PLANS[plan]?.limits
  if (!limits) return false
  const value = limits[feature]
  if (typeof value === "boolean") return value
  return value === -1 || value > 0
}

export function isWithinLimit(
  plan: string,
  feature: "services" | "appointmentsPerMonth",
  current: number
): boolean {
  const limit = PLANS[plan]?.limits[feature]
  if (limit === undefined) return false
  if (limit === -1) return true
  return current < limit
}

export function getPlanLabel(plan: string): string {
  return PLANS[plan]?.name ?? plan
}
