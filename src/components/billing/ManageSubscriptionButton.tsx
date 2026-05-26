"use client"

import { useTransition } from "react"
import { Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createPortalSessionAction } from "@/actions/stripe.actions"

interface ManageSubscriptionButtonProps {
  className?: string
}

export function ManageSubscriptionButton({ className }: ManageSubscriptionButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await createPortalSessionAction()
      if (result && !result.success) {
        toast.error(result.error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4" />
      )}
      Gerenciar assinatura
    </button>
  )
}
