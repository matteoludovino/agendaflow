"use client"

import Image from "next/image"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import { updateProfileAction } from "@/actions/user.actions"
import { generateInitials } from "@/lib/utils"
import { TIMEZONES } from "@/lib/constants/config"

interface ProfileFormProps {
  initialData: {
    name: string | null
    bio: string | null
    phone: string | null
    timezone: string
    image: string | null
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const initials = generateInitials(initialData.name ?? "U")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.push("/onboarding/schedule")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {initialData.image ? (
              <img
                src={initialData.image}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Upload de foto disponível em Configurações
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Nome completo <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialData.name ?? ""}
            placeholder="João Silva"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            Aparece na sua página pública de agendamento.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-sm font-medium">
            Biografia
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={initialData.bio ?? ""}
            placeholder="Descreva seus serviços e especialidades em poucas palavras..."
            maxLength={300}
            className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium">
              Telefone / WhatsApp
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialData.phone ?? ""}
              placeholder="(11) 99999-9999"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="timezone" className="text-sm font-medium">
              Fuso horário <span className="text-destructive">*</span>
            </label>
            <select
              id="timezone"
              name="timezone"
              required
              defaultValue={initialData.timezone}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-9 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Continuar
        </button>
      </div>
    </form>
  )
}
