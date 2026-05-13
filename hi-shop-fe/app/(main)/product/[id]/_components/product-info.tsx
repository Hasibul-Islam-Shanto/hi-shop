import { Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { IProductVariant } from "@/types/product-list.type"

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "2 Year Warranty", sub: "Full coverage" },
  { icon: Truck, label: "Free Shipping", sub: "Express delivery" },
  { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle-free" },
  { icon: ShieldCheck, label: "Authentic", sub: "Verified product" },
]

interface ProductData {
  name: string
  label: string
  rating: number
  reviews: number
  price: number
  originalPrice?: number
  description: string
}

interface ProductInfoProps {
  product: ProductData
  variants: IProductVariant[]
  selectedFinish: number
  onSelectFinish: (i: number) => void
  quantity: number
  onQuantityChange: (q: number) => void
  onAddToCart: () => void
}

const ProductInfo = ({
  product,
  variants,
  selectedFinish,
  onSelectFinish,
  quantity,
  onQuantityChange,
  onAddToCart,
}: ProductInfoProps) => {
  const savings = product.originalPrice ? product.originalPrice - product.price : 0
  const selectedVariant = variants[selectedFinish]
  const selectedVariantLabel = selectedVariant
    ? `${selectedVariant.color} / ${selectedVariant.size}`
    : "Unavailable"
  const maxQuantity = selectedVariant?.stock ?? 0
  const isOutOfStock = maxQuantity <= 0

  return (
    <div>
      <span className="label-text text-primary mb-2 block">{product.label}</span>
      <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-3 leading-tight">
        {product.name}
      </h1>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < Math.floor(product.rating)
                  ? "fill-tertiary text-tertiary"
                  : "text-surface-container-highest"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-on-surface">{product.rating}</span>
        <span className="text-sm text-on-surface-variant">({product.reviews} reviews)</span>
      </div>

      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-3xl font-extrabold text-on-surface">
          ${product.price.toLocaleString()}.00
        </span>
        {product.originalPrice && (
          <span className="text-base text-on-surface-variant line-through">
            ${product.originalPrice.toLocaleString()}.00
          </span>
        )}
        {savings > 0 && (
          <span className="text-sm font-bold text-tertiary bg-tertiary/10 px-2.5 py-0.5 rounded-lg">
            Save ${savings}
          </span>
        )}
      </div>

      <p className="text-on-surface-variant leading-relaxed mb-6 text-sm">{product.description}</p>

      <div className="mb-6">
        <h3 className="label-text text-[10px] mb-3">
          Select Variant — <span className="text-primary">{selectedVariantLabel}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {variants.map((variant, i) => {
            const selected = selectedFinish === i
            const outOfStock = variant.stock <= 0
            const price =
              product.price - (selectedVariant?.priceModifier ?? 0) + variant.priceModifier

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelectFinish(i)}
                disabled={outOfStock}
                aria-pressed={selected}
                className={`rounded-xl border px-3 py-2 text-left transition-all duration-200 ${
                  selected
                    ? "border-primary bg-primary/10 text-on-surface"
                    : "border-border/60 bg-surface-container-low text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
                } ${outOfStock ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <span className="block text-sm font-semibold">
                  {variant.color} / {variant.size}
                </span>
                <span className="mt-0.5 block text-[11px]">
                  SKU {variant.sku} · {outOfStock ? "Out of stock" : `${variant.stock} available`}
                </span>
                <span className="mt-1 block text-xs font-bold text-primary">
                  ${price.toLocaleString()}.00
                </span>
              </button>
            )
          })}
          {variants.length === 0 && (
            <div className="rounded-xl border border-border/60 bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant">
              No variants available
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="label-text text-[10px] mb-3">
          Quantity{" "}
          <span className={isOutOfStock ? "text-destructive" : "text-primary"}>
            {isOutOfStock ? "Out of stock" : `${maxQuantity} available`}
          </span>
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-container-low rounded-xl ghost-border shrink-0">
            <button
              type="button"
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={isOutOfStock || quantity <= 1}
              aria-label="Decrease quantity"
              className="h-11 w-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-semibold text-on-surface tabular-nums">
              {isOutOfStock ? 0 : quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={isOutOfStock || quantity >= maxQuantity}
              aria-label="Increase quantity"
              className="h-11 w-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className="flex-1 h-11 gap-2 ambient-glow"
          size="lg"
        >
          <ShoppingBag className="h-5 w-5" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        <button
          aria-label="Save to wishlist"
          className="h-11 w-11 rounded-xl bg-card ghost-border flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 bg-card rounded-xl p-3 ghost-border">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">{label}</p>
              <p className="text-xs text-on-surface-variant">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductInfo
