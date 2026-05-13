import { Heart, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import {
  formatUsd,
  getPrimaryProductImage,
  getProductPriceRange,
  productLooksOnSale,
} from "@/lib/product-list-utils"
import type { ICategoryProductItem } from "@/types/product-list.type"

interface ProductCardProps {
  product: ICategoryProductItem
}

const ProductCard = ({ product }: ProductCardProps) => {
  const primaryImage = getPrimaryProductImage(product)
  const priceRange = getProductPriceRange(product)
  const onSale = productLooksOnSale(product)

  return (
    <Link
      href={`/product/${product.id}`}
      className="group rounded-2xl overflow-hidden bg-card card-premium ghost-border block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
        <Image
          src={primaryImage.url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />

        <span
          aria-hidden="true"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-surface-container/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-on-surface-variant hover:text-primary"
        >
          <Heart className="h-3.5 w-3.5" />
        </span>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <span className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </span>
        </div>
      </div>

      <div className="p-3 flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <h3 className="font-semibold text-sm text-on-surface truncate">{product.name}</h3>
          <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
            {product.category.name}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-bold text-sm text-primary">{formatUsd(priceRange.min)}</span>
          {onSale && (
            <span className="block text-[10px] text-on-surface-variant line-through">
              {formatUsd(product.basePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
