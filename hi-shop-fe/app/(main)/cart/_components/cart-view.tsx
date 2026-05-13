"use client"

import { Sparkles, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { useCartStore } from "@/lib/store/cart"
import CartItemCard from "./cart-item"
import OrderSummary from "./order-summary"
import RecentlyViewed from "./recently-viewed"

const CartView = () => {
  const { items, updateQty, removeItem } = useCartStore()
  const [promoCode, setPromoCode] = useState("")
  const [showPromo, setShowPromo] = useState(true)

  const handleUpdateQty = (productVariantId: string, delta: number) => {
    const item = items.find((i) => i.productVariantId === productVariantId)
    if (item) updateQty(productVariantId, item.quantity + delta)
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + tax

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-20 w-20 rounded-full bg-surface-container ghost-border flex items-center justify-center mb-6">
          <Sparkles className="h-8 w-8 text-on-surface-variant" />
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">Your cart is empty</h2>
        <p className="text-sm text-on-surface-variant mb-6 max-w-xs">
          Looks like you haven&apos;t added anything yet. Start exploring the gallery.
        </p>
        <Link
          href="/product"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <CartItemCard
              key={item.productVariantId}
              item={item}
              onUpdateQty={handleUpdateQty}
              onRemove={removeItem}
            />
          ))}

          {showPromo && (
            <div className="flex items-center justify-between bg-primary/5 rounded-xl p-3 ghost-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-on-surface">
                  Use code <strong>KINETIC</strong> for 15% off your order!
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPromo(false)}
                aria-label="Dismiss promo"
                className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            subtotal={subtotal}
            tax={tax}
            total={total}
            promoCode={promoCode}
            onPromoChange={setPromoCode}
            onPromoApply={() => {}}
          />
        </div>
      </div>

      <RecentlyViewed />
    </>
  )
}

export default CartView
