"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar, CalendarCheck, CalendarX, Bell,
  DollarSign, Crown, Trash2, CheckCheck, Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatRelative } from "@/lib/utils"
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
} from "@/actions/notification.actions"
import type { Notification, NotificationType } from "@prisma/client"

const ICONS: Record<NotificationType, React.ElementType> = {
  APPOINTMENT_CREATED:   Calendar,
  APPOINTMENT_CONFIRMED: CalendarCheck,
  APPOINTMENT_CANCELLED: CalendarX,
  APPOINTMENT_REMINDER:  Bell,
  PAYMENT_RECEIVED:      DollarSign,
  PLAN_UPGRADED:         Crown,
}

const COLORS: Record<NotificationType, string> = {
  APPOINTMENT_CREATED:   "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  APPOINTMENT_CONFIRMED: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  APPOINTMENT_CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  APPOINTMENT_REMINDER:  "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  PAYMENT_RECEIVED:      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  PLAN_UPGRADED:         "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
}

interface NotificationListProps {
  notifications: Notification[]
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const unread = notifications.filter((n) => !n.isRead)
  const read   = notifications.filter((n) => n.isRead)

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationAsReadAction(id)
      router.refresh()
    })
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsAsReadAction()
      toast.success("Todas marcadas como lidas")
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      await deleteNotificationAction(id)
      router.refresh()
      setDeletingId(null)
    })
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <Bell className="mb-3 h-8 w-8 text-muted-foreground/40" />
        <p className="font-medium">Nenhuma notificação</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Quando algo importante acontecer, você verá aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {unread.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Não lidas ({unread.length})
          </p>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Marcar todas como lidas
          </button>
        </div>
      )}

      {[
        { label: null, items: unread },
        { label: read.length > 0 && unread.length > 0 ? "Lidas" : null, items: read },
      ].map(({ label, items }, groupIndex) =>
        items.length === 0 ? null : (
          <div key={groupIndex} className="space-y-2">
            {label && (
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
            )}

            <div className="overflow-hidden rounded-xl border border-border divide-y divide-border">
              {items.map((n) => {
                const Icon = ICONS[n.type]
                const color = COLORS[n.type]
                const isDeleting = deletingId === n.id

                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-4 px-4 py-4 transition-colors",
                      !n.isRead && "bg-primary/[0.03]"
                    )}
                  >
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", color)}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm", !n.isRead && "font-semibold")}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        {formatRelative(n.createdAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n.id)}
                          disabled={isPending}
                          title="Marcar como lida"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        disabled={isPending}
                        title="Excluir notificação"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}
    </div>
  )
}
