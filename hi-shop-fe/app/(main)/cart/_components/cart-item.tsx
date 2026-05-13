import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

import type { CartItem } from "@/lib/store/cart"

interface CartItemProps {
  item: CartItem
  onUpdateQty: (productVariantId: string, delta: number) => void
  onRemove: (productVariantId: string) => void
}

const CartItemCard = ({ item, onUpdateQty, onRemove }: CartItemProps) => {
  const hasStockLimit = Number.isFinite(item.stock)
  const isAtStockLimit = hasStockLimit && item.quantity >= item.stock

  return (
    <div className="flex gap-4 bg-card rounded-2xl p-4 ghost-border shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-shadow duration-300">
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container shrink-0 relative">
        <Image
          src={item.image || "/placeholder.webp"}
          alt={item.productName}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-on-surface truncate">{item.productName}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">{item.variantLabel}</p>
            {hasStockLimit && (
              <p className="text-[11px] text-on-surface-variant mt-1">
                {isAtStockLimit ? "Max stock selected" : `${item.stock} available`}
              </p>
            )}
          </div>
          <span className="text-sm font-bold text-on-surface shrink-0">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center bg-surface-container-low rounded-xl ghost-border">
            <button
              type="button"
              onClick={() => onUpdateQty(item.productVariantId, -1)}
              aria-label="Decrease quantity"
              className="h-8 w-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-semibold text-on-surface">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(item.productVariantId, 1)}
              disabled={isAtStockLimit}
              aria-label="Increase quantity"
              className="h-8 w-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.productVariantId)}
            className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartItemCard
