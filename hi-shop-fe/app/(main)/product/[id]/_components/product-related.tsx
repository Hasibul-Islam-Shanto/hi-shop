import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ICategoryProductItem } from "@/types/product-list.type"

const FALLBACK_IMAGE = "/hero_1.webp"

interface ProductRelatedProps {
  products: ICategoryProductItem[]
}

const ProductRelated = ({ products }: ProductRelatedProps) => {
  if (products.length === 0) return null

  return (
    <div className="mt-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="label-text text-primary mb-1 block">The Collection</span>
          <h2 className="text-2xl font-bold text-on-surface">You May Also Like</h2>
        </div>
        <div className="flex gap-2">
          <button className="h-9 w-9 rounded-full bg-card ghost-border flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 rounded-full bg-card ghost-border flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((rp) => {
          const primaryImage =
            rp.images.find((img) => img.isPrimary)?.url ?? rp.images[0]?.url ?? FALLBACK_IMAGE
          return (
            <Link
              key={rp.id}
              href={`/product/${rp.id}`}
              className="group block rounded-2xl overflow-hidden bg-card card-premium ghost-border"
            >
              <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-surface-container-low">
                <Image
                  src={primaryImage}
                  alt={rp.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold py-2 rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-on-surface truncate">{rp.name}</h3>
                <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                  {rp.category.name}
                </p>
                <p className="text-sm font-bold text-primary mt-1">${rp.basePrice.toFixed(2)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ProductRelated
