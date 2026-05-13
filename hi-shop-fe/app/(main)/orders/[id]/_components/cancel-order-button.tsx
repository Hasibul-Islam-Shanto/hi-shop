"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cancelOrder } from "@/app/_actions/orderActions"

interface CancelOrderButtonProps {
  orderId: string
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelOrder(orderId)
      if (result.success) {
        setOpen(false)
        toast.success("Order cancelled successfully.")
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to cancel order.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-destructive border-destructive/30 hover:bg-destructive/5"
        >
          Cancel Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this order?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Your order will be cancelled and stock will be restored.
            Any discount usage will not be reversed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Keep Order
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            {isPending ? "Cancelling…" : "Yes, Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
