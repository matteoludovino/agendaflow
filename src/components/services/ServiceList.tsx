"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, GripVertical, Crown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { deleteServiceAction, toggleServiceAction, reorderServicesAction } from "@/actions/service.actions"
import { ServiceFormDialog } from "./ServiceFormDialog"
import { EmptyState } from "@/components/shared/index"
import { canDo } from "@/lib/constants/plans"
import type { Service } from "@prisma/client"
import { Briefcase } from "lucide-react"

interface ServiceListProps {
  services: Service[]
  userPlan: string
  serviceCount: number
}

export function ServiceList({ services, userPlan, serviceCount }: ServiceListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [list, setList] = useState(services)
  const [dragging, setDragging] = useState<string | null>(null)

  const atLimit = !canDo(userPlan, "services") ||
    (userPlan === "FREE" && serviceCount >= 3)

  function openCreate() {
    setEditingService(null)
    setDialogOpen(true)
  }

  function openEdit(service: Service) {
    setEditingService(service)
    setDialogOpen(true)
  }

  function handleSuccess() {
    router.refresh()
  }

  function handleToggle(id: string) {
    setTogglingId(id)
    startTransition(async () => {
      const result = await toggleServiceAction(id)
      if (!result.success) toast.error(result.error)
      else router.refresh()
      setTogglingId(null)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteServiceAction(id)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success("Serviço excluído")
        setList((prev) => prev.filter((s) => s.id !== id))
      }
      setConfirmDeleteId(null)
    })
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDragging(id)
    e.dataTransfer.effectAllowed = "move"
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!dragging || dragging === targetId) return

    setList((prev) => {
      const from = prev.findIndex((s) => s.id === dragging)
      const to = prev.findIndex((s) => s.id === targetId)
      if (from === -1 || to === -1) return prev
      const next = [...prev]
      next.splice(to, 0, next.splice(from, 1)[0])
      return next
    })
  }

  function handleDragEnd() {
    if (!dragging) return
    setDragging(null)
    const ids = list.map((s) => s.id)
    startTransition(async () => {
      await reorderServicesAction(ids)
    })
  }

  return (
    <>
      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editingService}
        onSuccess={handleSuccess}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Serviços</h1>
            <p className="text-sm text-muted-foreground">
              {list.length === 0
                ? "Nenhum serviço criado ainda"
                : `${list.length} serviço${list.length > 1 ? "s" : ""}`}
              {userPlan === "FREE" && ` · ${3 - serviceCount} restante${3 - serviceCount !== 1 ? "s" : ""} no plano Free`}
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={atLimit}
            title={atLimit ? "Limite do plano atingido. Faça upgrade." : undefined}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Novo serviço
            {atLimit && <Crown className="h-3.5 w-3.5 text-amber-300" />}
          </button>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Nenhum serviço ainda"
            description="Crie seu primeiro serviço para que clientes possam agendar com você."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Criar primeiro serviço
              </button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="hidden grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
              <span />
              <span>Serviço</span>
              <span className="text-center">Duração</span>
              <span className="text-right">Preço</span>
              <span className="text-center">Status</span>
              <span />
            </div>

            <ul className="divide-y divide-border">
              {list.map((service) => {
                const isConfirmingDelete = confirmDeleteId === service.id
                const isToggling = togglingId === service.id
                const isDragged = dragging === service.id

                return (
                  <li
                    key={service.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, service.id)}
                    onDragOver={(e) => handleDragOver(e, service.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "grid grid-cols-[auto_1fr] gap-3 px-4 py-3.5 transition-all sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:items-center sm:gap-4",
                      isDragged && "opacity-40",
                      !isDragged && "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex cursor-grab items-center text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <div className="min-w-0">
                        <p className={cn("truncate text-sm font-medium", !service.isActive && "text-muted-foreground")}>
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="truncate text-xs text-muted-foreground">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="hidden text-center text-sm text-muted-foreground sm:block">
                      {formatDuration(service.duration)}
                    </span>

                    <span className="hidden text-right text-sm font-medium sm:block">
                      {service.price === 0 ? (
                        <span className="text-muted-foreground">Grátis</span>
                      ) : (
                        formatCurrency(service.price)
                      )}
                    </span>

                    <div className="hidden sm:flex sm:justify-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={service.isActive}
                        aria-label={service.isActive ? "Desativar serviço" : "Ativar serviço"}
                        onClick={() => handleToggle(service.id)}
                        disabled={isToggling || isPending}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                          service.isActive ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform",
                            service.isActive ? "translate-x-4" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>

                    <div className="col-start-2 flex items-center gap-1 sm:col-auto">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Excluir?</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(service.id)}
                            disabled={isPending}
                            className="rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(service)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Editar serviço"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(service.id)}
                            disabled={isPending}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                            aria-label="Excluir serviço"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {list.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Arraste as linhas para reordenar como os serviços aparecem na sua página pública.
          </p>
        )}
      </div>
    </>
  )
}
