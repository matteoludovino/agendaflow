"use client"

import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createCheckoutSessionAction } from "@/actions/stripe.actions"

interface CheckoutButtonProps {
  planId: "PRO" | "BUSINESS"
  className?: string
  children: React.ReactNode
}

export function CheckoutButton({ planId, className, children }: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await createCheckoutSessionAction(planId)
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
        "flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  )
}
