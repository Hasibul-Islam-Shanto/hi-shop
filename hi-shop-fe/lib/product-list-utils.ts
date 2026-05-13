import type { ICategoryProductItem } from "@/types/product-list.type"

export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function getProductPriceRange(product: ICategoryProductItem): {
  min: number
  max: number
} {
  if (product.variants.length === 0) {
    return { min: product.basePrice, max: product.basePrice }
  }
  const prices = product.variants.map(
    (v) => Math.round((product.basePrice + v.priceModifier + Number.EPSILON) * 100) / 100,
  )
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function getPrimaryProductImage(product: ICategoryProductItem): {
  url: string
  alt: string
} {
  const ordered = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
  const primary = ordered.find((i) => i.isPrimary) ?? ordered[0]
  return {
    url: primary?.url ?? "/hero_1.webp",
    alt: primary?.altText?.trim() || product.name,
  }
}

export function productLooksOnSale(product: ICategoryProductItem): boolean {
  return product.variants.some((v) => v.priceModifier < 0)
}

export function productTotalStock(product: ICategoryProductItem): number {
  return product.variants.reduce((acc, v) => acc + v.stock, 0)
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
