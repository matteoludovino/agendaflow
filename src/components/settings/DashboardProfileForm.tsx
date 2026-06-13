"use client"

import Link from "next/link"

import { useState, useTransition } from "react"
import { ExternalLink, Loader2, Save, Crown } from "lucide-react"
import { toast } from "sonner"
import { slugify, generateInitials } from "@/lib/utils"
import { TIMEZONES, APP_CONFIG } from "@/lib/constants/config"
import { updateProfileSettingsAction, updateSlugAction } from "@/actions/user.actions"

const BUFFER_OPTIONS = [
  { value: "0",  label: "Sem intervalo" },
  { value: "5",  label: "5 minutos" },
  { value: "10", label: "10 minutos" },
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
]

interface DashboardProfileFormProps {
  user: {
    name: string | null
    bio: string | null
    phone: string | null
    timezone: string
    slug: string
    plan: string
    bookingBuffer: number
    image: string | null
  }
}

export function DashboardProfileForm({ user }: DashboardProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isSlugPending, startSlugTransition] = useTransition()
  const [slugValue, setSlugValue] = useState(user.slug)
  const isPro = user.plan !== "FREE"
  const initials = generateInitials(user.name ?? "U")
  const bookingUrl = `${APP_CONFIG.url}/${user.slug}`

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfileSettingsAction(formData)
      if (!result.success) toast.error(result.error)
      else toast.success("Perfil atualizado")
    })
  }

  function handleSlugSave() {
    if (slugValue === user.slug) return
    startSlugTransition(async () => {
      const result = await updateSlugAction(slugValue)
      if (!result.success) toast.error(result.error)
      else toast.success("Link atualizado")
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {user.image ? (
            <img src={user.image} alt={user.name ?? ""} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{user.name ?? "Sem nome"}</p>
          <p className="text-xs text-muted-foreground">
            Upload de foto disponível em breve
          </p>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Nome completo <span className="text-destructive">*</span>
            </label>
            <input
              id="name" name="name" type="text" required
              defaultValue={user.name ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
            <input
              id="phone" name="phone" type="tel"
              defaultValue={user.phone ?? ""}
              placeholder="(11) 99999-9999"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-sm font-medium">Biografia</label>
          <textarea
            id="bio" name="bio" rows={3} maxLength={300}
            defaultValue={user.bio ?? ""}
            placeholder="Descreva seus serviços e especialidades..."
            className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="timezone" className="text-sm font-medium">Fuso horário</label>
            <select
              id="timezone" name="timezone" defaultValue={user.timezone}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bookingBuffer" className="text-sm font-medium">
              Intervalo entre atendimentos
            </label>
            <select
              id="bookingBuffer" name="bookingBuffer"
              defaultValue={String(user.bookingBuffer)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {BUFFER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit" disabled={isPending}
            className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar perfil
          </button>
        </div>
      </form>

      <div className="space-y-3 border-t border-border pt-6">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Link de agendamento</p>
          {!isPro && <Crown className="h-3.5 w-3.5 text-amber-500" />}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center overflow-hidden rounded-md border border-input bg-muted/40">
            <span className="border-r border-input bg-muted px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
              {APP_CONFIG.url}/
            </span>
            <input
              type="text"
              value={slugValue}
              onChange={(e) => setSlugValue(slugify(e.target.value))}
              disabled={!isPro}
              className="flex-1 bg-transparent px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed"
            />
          </div>

          {isPro && slugValue !== user.slug && (
            <button
              type="button"
              onClick={handleSlugSave}
              disabled={isSlugPending}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSlugPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </button>
          )}

          <a
            href={bookingUrl} target="_blank" rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Abrir página de agendamento"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {!isPro && (
          <p className="text-xs text-muted-foreground">
            Slug personalizado disponível no{" "}
            <Link href="/dashboard/upgrade" className="font-medium text-primary hover:underline">
              plano Pro
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
