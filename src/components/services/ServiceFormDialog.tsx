"use client"

import { useState, useTransition, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { SERVICE_COLORS } from "@/lib/constants/config"
import { createServiceAction, updateServiceAction } from "@/actions/service.actions"
import type { Service } from "@prisma/client"

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service | null
  onSuccess?: () => void
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120]

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSuccess,
}: ServiceFormDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedColor, setSelectedColor] = useState(service?.color ?? SERVICE_COLORS[0])
  const isEdit = !!service

  useEffect(() => {
    if (open) setSelectedColor(service?.color ?? SERVICE_COLORS[0])
  }, [open, service?.color])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("color", selectedColor)

    startTransition(async () => {
      const result = isEdit
        ? await updateServiceAction(service.id, formData)
        : await createServiceAction(formData)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(isEdit ? "Serviço atualizado" : "Serviço criado com sucesso")
      onOpenChange(false)
      onSuccess?.()
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-2xl animate-fade-in focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold">
              {isEdit ? "Editar serviço" : "Novo serviço"}
            </Dialog.Title>
            <Dialog.Close
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="svc-name" className="text-sm font-medium">
                Nome <span className="text-destructive">*</span>
              </label>
              <input
                id="svc-name"
                name="name"
                required
                defaultValue={service?.name}
                placeholder="Ex: Consulta, Corte de cabelo..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="svc-description" className="text-sm font-medium">
                Descrição
              </label>
              <textarea
                id="svc-description"
                name="description"
                rows={2}
                defaultValue={service?.description ?? ""}
                placeholder="Descreva o serviço brevemente..."
                maxLength={500}
                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="svc-duration" className="text-sm font-medium">
                  Duração (min) <span className="text-destructive">*</span>
                </label>
                <input
                  id="svc-duration"
                  name="duration"
                  type="number"
                  required
                  min={15}
                  max={480}
                  step={15}
                  defaultValue={service?.duration ?? 60}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="flex flex-wrap gap-1">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget
                          .closest("div.space-y-1\\.5")
                          ?.querySelector("input") as HTMLInputElement | null
                        if (input) input.value = String(d)
                      }}
                      className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                    >
                      {d}min
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="svc-price" className="text-sm font-medium">
                  Preço (R$) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>
                  <input
                    id="svc-price"
                    name="price"
                    type="number"
                    required
                    min={0}
                    max={99999}
                    step={0.01}
                    defaultValue={service?.price ?? 0}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <p className="text-xs text-muted-foreground">0 para serviço gratuito</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selectedColor === color && "ring-2 ring-offset-2 ring-offset-background"
                    )}
                    style={{
                      backgroundColor: color,
                      ...(selectedColor === color ? { boxShadow: `0 0 0 2px ${color}` } : {}),
                    }}
                    aria-label={`Selecionar cor ${color}`}
                    aria-pressed={selectedColor === color}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close
                type="button"
                className="flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="flex h-9 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEdit ? "Salvar" : "Criar serviço"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
