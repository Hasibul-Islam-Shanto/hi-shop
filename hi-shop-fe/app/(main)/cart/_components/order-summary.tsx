import { ArrowRight, Lock, Tag } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

interface OrderSummaryProps {
  subtotal: number
  tax: number
  total: number
  promoCode: string
  onPromoChange: (value: string) => void
  onPromoApply: () => void
}

const OrderSummary = ({
  subtotal,
  tax,
  total,
  promoCode,
  onPromoChange,
  onPromoApply,
}: OrderSummaryProps) => {
  return (
    <div className="bg-card rounded-2xl p-5 ghost-border shadow-(--shadow-md) sticky top-24">
      <h2 className="text-base font-bold text-on-surface mb-5">Order Summary</h2>

      <div className="space-y-3 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Subtotal</span>
          <span className="text-on-surface font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Shipping</span>
          <span className="text-primary text-xs font-medium">Calculated at next step</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Tax (8%)</span>
          <span className="text-on-surface font-medium">${tax.toFixed(2)}</span>
        </div>
      </div>

      <div className="h-px bg-border/50 mb-4" />

      <div className="flex justify-between items-center mb-5">
        <span className="text-sm text-on-surface-variant">Total</span>
        <span className="text-2xl font-bold text-on-surface">${total.toFixed(2)}</span>
      </div>

      <Button className="w-full mb-2 h-11 ambient-glow" asChild>
        <Link href="/checkout">
          Checkout <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>

      <div className="flex items-center justify-center gap-1.5 mb-4">
        <Lock className="h-3 w-3 text-on-surface-variant" />
        <p className="text-xs text-center text-on-surface-variant">Secure 256-bit SSL encryption</p>
      </div>

      <div className="h-px bg-border/50 mb-4" />

      <div className="flex gap-2">
        <div className="flex-1 flex items-center bg-surface-container-low rounded-xl px-3 py-2 ghost-border gap-2">
          <Tag className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
          <input
            type="text"
            placeholder="Promo code"
            value={promoCode}
            onChange={(e) => onPromoChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={onPromoApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

export default OrderSummary
