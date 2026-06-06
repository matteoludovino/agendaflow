import Link from "next/link"
import { Sora } from "next/font/google"
import { Calendar, Clock, Bell, BarChart2, Shield, Zap, CheckCircle2, ArrowRight, Star, Check, Globe, Sparkles } from "lucide-react"
import { PLANS } from "@/lib/constants/plans"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AgendaFlow — Agendamento online para autônomos",
  description: "Crie sua página de agendamento em minutos. Aceite clientes 24h por dia, sem idas e vindas de mensagem.",
}

const sora = Sora({ subsets: ["latin"], weight: ["400","600","700","800"], variable: "--font-sora", display: "swap" })

const FEATURES = [
  { icon: Calendar, title: "Página pública de agendamento", description: "Seu cliente acessa, escolhe o serviço e agenda sozinho — sem você precisar responder uma mensagem." },
  { icon: Clock, title: "Controle de disponibilidade", description: "Defina seus horários, bloqueie datas e configure intervalos entre atendimentos com total flexibilidade." },
  { icon: Bell, title: "Lembretes automáticos", description: "E-mails de confirmação e lembrete enviados automaticamente. Menos faltas, mais previsibilidade." },
  { icon: BarChart2, title: "Painel de métricas", description: "Acompanhe seus agendamentos, receita estimada e taxa de ocupação em um único lugar." },
  { icon: Globe, title: "Link personalizado", description: "Compartilhe agendaflow.com/seunome no Instagram, WhatsApp ou cartão de visita. Simples assim." },
  { icon: Shield, title: "Pagamentos pelo Stripe", description: "Cobranças processadas com segurança. Sem burocracia, sem taxa de adesão, sem surpresas." },
]

const HOW_IT_WORKS = [
  { step: "01", title: "Crie seus serviços", description: "Cadastre o que você oferece, defina preços, duração e configure sua disponibilidade semanal." },
  { step: "02", title: "Compartilhe seu link", description: "Seu cliente acessa sua página pública e escolhe o melhor horário disponível para ele." },
  { step: "03", title: "Apareça e atenda", description: "Você recebe a notificação, o cliente recebe a confirmação. Sem mensagens de vai e vem." },
]

const TESTIMONIALS = [
  { name: "Camila Rocha", role: "Nail designer", text: "Antes eu passava 30 minutos por dia confirmando horários no WhatsApp. Agora meus clientes agendam sozinhos às 2 da manhã se quiserem.", rating: 5 },
  { name: "Rafael Mendes", role: "Personal trainer", text: "Minha taxa de no-show caiu pela metade depois dos lembretes automáticos. Não consigo mais imaginar trabalhar sem o AgendaFlow.", rating: 5 },
  { name: "Dra. Priya Alves", role: "Nutricionista", text: "Simples, rápido e bonito. Meus clientes adoram o link de agendamento. Parece muito mais profissional do que o Google Forms.", rating: 5 },
]

const PLAN_ORDER = ["FREE", "PRO", "BUSINESS"] as const

export default function HomePage() {
  return (
    <div className={cn(sora.variable, "min-h-screen bg-white text-zinc-900")} style={{ fontFamily: "var(--font-sora), var(--font-inter), sans-serif" }}>
      <style>{`
        @keyframes fade-up { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in { from { opacity:0; } to { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
        @keyframes gradient-shift { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
        .animate-fade-up { animation:fade-up 0.7s ease both; }
        .animate-fade-in-d { animation:fade-in 1s ease both; }
        .animate-float { animation:float 4s ease-in-out infinite; }
        .delay-100 { animation-delay:0.1s; } .delay-200 { animation-delay:0.2s; }
        .delay-300 { animation-delay:0.3s; } .delay-400 { animation-delay:0.4s; }
        .delay-500 { animation-delay:0.5s; }
        .gradient-text { background:linear-gradient(135deg,#fff 0%,#a5b4fc 50%,#818cf8 100%); background-size:200% 200%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:gradient-shift 5s ease infinite; }
        .dot-grid { background-image:radial-gradient(circle,rgba(255,255,255,0.12) 1px,transparent 1px); background-size:28px 28px; }
        .card-hover { transition:transform 0.25s ease,box-shadow 0.25s ease; }
        .card-hover:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.08); }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900"><Sparkles className="h-4 w-4 text-white" /></div>
            <span className="text-lg font-bold tracking-tight">AgendaFlow</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#funcionalidades" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">Funcionalidades</Link>
            <Link href="#como-funciona" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">Como funciona</Link>
            <Link href="#planos" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">Planos</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 md:block">Entrar</Link>
            <Link href="/register" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700">Começar grátis</Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-zinc-950 pt-32 pb-24">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300">Sem taxa de adesão · Cancele quando quiser</span>
          </div>
          <h1 className="animate-fade-up delay-100 gradient-text text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl">Agendamentos no piloto automático</h1>
          <p className="animate-fade-up delay-200 mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">Crie sua página de agendamento profissional em minutos. Seus clientes marcam sozinhos, você recebe a confirmação.</p>
          <div className="animate-fade-up delay-300 mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register" className="group flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-indigo-500">
              Começar grátis agora<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="rounded-lg border border-white/10 px-6 py-3 text-base font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:text-white">Já tenho conta</Link>
          </div>
          <p className="animate-fade-up delay-400 mt-6 text-sm text-zinc-600">Grátis para sempre nos primeiros 3 serviços · Sem cartão de crédito</p>
        </div>
        <div className="animate-fade-in-d delay-500 animate-float relative mx-auto mt-16 max-w-3xl px-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 border-b border-white/5 bg-zinc-900/80 px-4 py-3">
              <div className="flex gap-1.5"><span className="h-3 w-3 rounded-full bg-red-500/70" /><span className="h-3 w-3 rounded-full bg-yellow-500/70" /><span className="h-3 w-3 rounded-full bg-green-500/70" /></div>
              <div className="mx-auto flex h-6 w-48 items-center justify-center rounded-md bg-white/5 px-3"><span className="text-xs text-zinc-500">agendaflow.com/seunome</span></div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3">
              {[
                { label: "Corte + Barba", price: "R$ 60", time: "50 min", color: "#6366f1" },
                { label: "Corte Feminino", price: "R$ 80", time: "60 min", color: "#ec4899" },
                { label: "Progressiva", price: "R$ 180", time: "120 min", color: "#f97316" },
                { label: "Hidratação", price: "R$ 90", time: "45 min", color: "#22c55e" },
                { label: "Coloração", price: "R$ 150", time: "90 min", color: "#eab308" },
                { label: "Escova", price: "R$ 70", time: "40 min", color: "#14b8a6" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-2 bg-zinc-900 p-4">
                  <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: s.color }} />
                  <p className="text-xs font-semibold text-white">{s.label}</p>
                  <p className="text-xs text-zinc-500">{s.time}</p>
                  <p className="mt-1 text-sm font-bold text-indigo-400">{s.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-100 bg-zinc-50 py-8">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-zinc-400">Adorado por profissionais autônomos do Brasil</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-zinc-400">
            {["Cabeleireiros","Personal trainers","Nutricionistas","Psicólogos","Nail designers","Coaches"].map((p) => (
              <span key={p} className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-indigo-500" />{p}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Funcionalidades</p>
            <h2 className="text-4xl font-bold tracking-tight">Tudo que você precisa, nada que não usa</h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-500">Pensado para autônomos que precisam de uma solução completa, mas não têm tempo de aprender uma ferramenta complexa.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card-hover rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50"><Icon className="h-5 w-5 text-indigo-600" /></div>
                <h3 className="mb-2 font-semibold text-zinc-900">{title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-zinc-950 py-24 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-400">Como funciona</p>
            <h2 className="text-4xl font-bold tracking-tight">Em 3 passos você está no ar</h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent sm:block" />
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-bold text-indigo-400">{step}</div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Depoimentos</p>
            <h2 className="text-4xl font-bold tracking-tight">Quem usa, não volta atrás</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, text, rating }) => (
              <div key={name} className="card-hover rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex gap-0.5">{Array.from({ length: rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="mb-5 text-sm leading-relaxed text-zinc-600">"{text}"</p>
                <div><p className="font-semibold text-zinc-900">{name}</p><p className="text-xs text-zinc-400">{role}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="bg-zinc-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Planos</p>
            <h2 className="text-4xl font-bold tracking-tight">Preço justo para cada momento</h2>
            <p className="mt-4 text-zinc-500">Comece grátis. Faça upgrade quando fizer sentido para o seu negócio.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId]
              const isFeatured = plan.featured
              return (
                <div key={planId} className={cn("card-hover relative flex flex-col rounded-2xl border p-7", isFeatured ? "border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" : "border-zinc-200 bg-white")}>
                  {isFeatured && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-amber-900">Mais popular</span>}
                  <div className="mb-6">
                    <h3 className={cn("text-lg font-bold", isFeatured ? "text-white" : "text-zinc-900")}>{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      {plan.price === 0 ? <span className={cn("text-4xl font-extrabold", isFeatured ? "text-white" : "text-zinc-900")}>Grátis</span> : (
                        <><span className={cn("text-4xl font-extrabold", isFeatured ? "text-white" : "text-zinc-900")}>R$ {plan.price}</span><span className={cn("text-sm", isFeatured ? "text-indigo-200" : "text-zinc-400")}>/mês</span></>
                      )}
                    </div>
                    <p className={cn("mt-1 text-sm", isFeatured ? "text-indigo-200" : "text-zinc-500")}>{plan.description}</p>
                  </div>
                  <ul className="mb-8 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className={cn("mt-0.5 h-4 w-4 shrink-0", isFeatured ? "text-indigo-200" : "text-indigo-600")} strokeWidth={2.5} />
                        <span className={isFeatured ? "text-indigo-100" : "text-zinc-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={cn("flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all", isFeatured ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-zinc-900 text-white hover:bg-zinc-700")}>
                    {plan.price === 0 ? "Começar grátis" : `Assinar ${plan.name}`}
                  </Link>
                </div>
              )
            })}
          </div>
          <p className="mt-8 text-center text-sm text-zinc-400">Pagamentos processados com segurança pelo Stripe · Cancele a qualquer momento</p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 py-24 text-white">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Pare de perder tempo com WhatsApp. <span className="gradient-text">Comece hoje.</span></h2>
          <p className="mx-auto mt-6 max-w-xl text-zinc-400">Crie sua conta gratuita em menos de 2 minutos e tenha sua página de agendamento no ar ainda hoje.</p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register" className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-bold text-white transition-all hover:bg-indigo-500">
              Criar conta grátis<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-600">Sem cartão de crédito · Configuração em 2 minutos</p>
        </div>
      </section>

      <footer className="border-t border-zinc-100 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900"><Sparkles className="h-3.5 w-3.5 text-white" /></div>
              <span className="font-bold text-zinc-900">AgendaFlow</span>
            </Link>
            <div className="flex gap-6 text-sm text-zinc-400">
              <Link href="#funcionalidades" className="hover:text-zinc-700">Funcionalidades</Link>
              <Link href="#planos" className="hover:text-zinc-700">Planos</Link>
              <Link href="/login" className="hover:text-zinc-700">Entrar</Link>
              <Link href="/register" className="hover:text-zinc-700">Cadastrar</Link>
            </div>
            <p className="text-sm text-zinc-400">© {new Date().getFullYear()} AgendaFlow · Feito no Brasil 🇧🇷</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
