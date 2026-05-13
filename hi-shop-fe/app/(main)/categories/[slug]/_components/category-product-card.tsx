import { Heart, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import {
  formatUsd,
  getPrimaryProductImage,
  getProductPriceRange,
  productLooksOnSale,
  productTotalStock,
} from "@/lib/product-list-utils"
import type { ICategoryProductItem } from "@/types/product-list.type"

export interface CategoryProductCardModel {
  id: string
  name: string
  slug: string
  subtitle: string
  imageUrl: string
  imageAlt: string
  priceMin: number
  priceMax: number
  sale: boolean
  tag: string | null
}

interface CategoryProductCardProps {
  product: CategoryProductCardModel
}

const CategoryProductCard = ({ product }: CategoryProductCardProps) => {
  const priceLabel =
    product.priceMin === product.priceMax
      ? formatUsd(product.priceMin)
      : `${formatUsd(product.priceMin)} – ${formatUsd(product.priceMax)}`

  return (
    <Link
      href={`/product/${product.id}`}
      className="group rounded-2xl overflow-hidden bg-card card-premium ghost-border block"
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-t-2xl">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {product.tag && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
              product.sale
                ? "bg-tertiary text-tertiary-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {product.tag}
          </span>
        )}

        <span
          aria-hidden="true"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-surface-container/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-on-surface-variant hover:text-primary"
        >
          <Heart className="h-3.5 w-3.5" />
        </span>

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <span className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
            <ShoppingCart className="h-3.5 w-3.5" />
            Quick add
          </span>
        </div>
      </div>

      <div className="p-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-on-surface line-clamp-2">{product.name}</h3>
          <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-snug">
            {product.subtitle}
          </p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          {product.priceMin !== product.priceMax && (
            <span className="block text-[9px] uppercase tracking-wide text-on-surface-variant">
              From
            </span>
          )}
          <span className="font-bold text-sm text-primary">{priceLabel}</span>
          {product.sale && (
            <span className="block text-[10px] text-on-surface-variant">Includes deal pricing</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function mapCategoryProductItem(p: ICategoryProductItem): CategoryProductCardModel {
  const { url: imageUrl, alt: imageAlt } = getPrimaryProductImage(p)
  const { min: priceMin, max: priceMax } = getProductPriceRange(p)
  const sale = productLooksOnSale(p)
  const stock = productTotalStock(p)

  let tag: string | null = null
  if (sale) tag = "Sale"
  else if (stock <= 8 && stock > 0) tag = "Low stock"
  else if (p.variants.length > 1) tag = `${p.variants.length} options`

  const desc = p.description?.trim() ?? ""
  const subtitle = desc.length > 140 ? `${desc.slice(0, 140).trimEnd()}…` : desc

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    subtitle:
      subtitle ||
      `${p.variants.length} variant${p.variants.length !== 1 ? "s" : ""} · ` +
        `${p.images.length || 1} photo${(p.images.length || 1) !== 1 ? "s" : ""}`,
    imageUrl,
    imageAlt,
    priceMin,
    priceMax,
    sale,
    tag,
  }
}

export default CategoryProductCard
