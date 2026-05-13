"use client"

import { useTransition } from "react"
import { Lock, Tag, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart"
import { placeOrder } from "@/app/_actions/orderActions"

interface CheckoutOrderSummaryProps {
  shippingAddressId: string | null
  currentStep: number
  discountCode: string
  onDiscountChange: (code: string) => void
}

const CheckoutOrderSummary = ({
  shippingAddressId,
  currentStep,
  discountCode,
  onDiscountChange,
}: CheckoutOrderSummaryProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const { items, total, clearCart } = useCartStore()

  const subtotal = total
  const tax = Math.round(subtotal * 0.08)
  const grandTotal = subtotal + tax

  const handlePlaceOrder = () => {
    if (!shippingAddressId) {
      toast.error("Please select a shipping address.")
      return
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.")
      return
    }

    startTransition(async () => {
      const result = await placeOrder({
        shippingAddressId,
        items: items.map((i) => ({
          productVariantId: i.productVariantId,
          quantity: i.quantity,
        })),
        ...(discountCode.trim() && { discountCode: discountCode.trim() }),
      })
      if (result.orderId) {
        clearCart()
        router.push(`/orders/${result.orderId}`)
      } else {
        toast.error(result.error ?? "Failed to place order.")
      }
    })
  }

  return (
    <div className="bg-card rounded-2xl p-5 ghost-border shadow-(--shadow-md) sticky top-24">
      <h2 className="text-lg font-bold text-on-surface mb-5">Order Summary</h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <ShoppingBag className="h-8 w-8 text-on-surface-variant mb-3" />
          <p className="text-sm text-on-surface-variant">Your cart is empty.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {items.map((item) => (
            <div key={item.productVariantId} className="flex gap-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-container shrink-0">
                <Image
                  src={item.image || "/placeholder.webp"}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-on-surface truncate">
                  {item.productName}
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {item.variantLabel} × {item.quantity}
                </p>
                <p className="text-sm font-bold text-primary mt-0.5">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <div className="flex-1 flex items-center bg-surface-container-low rounded-xl px-3 py-2 ghost-border gap-2">
          <Tag className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
          <input
            type="text"
            value={discountCode}
            onChange={(e) => onDiscountChange(e.target.value)}
            placeholder="Promo code"
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
        </div>
        <Button variant="secondary" size="sm">
          Apply
        </Button>
      </div>

      <div className="h-px bg-border/40 mb-4" />

      <div className="space-y-2.5 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Subtotal</span>
          <span className="text-on-surface font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Shipping</span>
          <span className="text-tertiary font-semibold">FREE</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Tax (8%)</span>
          <span className="text-on-surface font-medium">${tax.toFixed(2)}</span>
        </div>
      </div>

      <div className="h-px bg-border/40 mb-4" />

      <div className="flex justify-between items-center mb-5">
        <span className="font-bold text-on-surface">Total</span>
        <span className="text-2xl font-extrabold text-primary">${grandTotal.toFixed(2)}</span>
      </div>

      {currentStep === 1 ? (
        <Button
          onClick={handlePlaceOrder}
          disabled={isPending || !shippingAddressId || items.length === 0}
          className="w-full ambient-glow"
          size="lg"
        >
          {isPending ? "Placing Order…" : "Place Order"}
        </Button>
      ) : (
        <div className="w-full rounded-xl bg-surface-container p-4 ghost-border text-center">
          <p className="text-sm text-on-surface-variant">Select a shipping address to continue.</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 mt-3">
        <Lock className="h-3 w-3 text-on-surface-variant" />
        <p className="text-[10px] text-on-surface-variant label-text">
          Secure Encrypted Transaction
        </p>
      </div>
    </div>
  )
}

export default CheckoutOrderSummary
