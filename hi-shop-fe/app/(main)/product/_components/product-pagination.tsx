import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import type { ProductQueryState } from "@/lib/product-catalog"
import type { IProductListMeta } from "@/types/product-list.type"

type Props = {
  meta: IProductListMeta
  query: ProductQueryState
}

function buildHref(page: number, query: ProductQueryState) {
  const params = new URLSearchParams()

  if (query.search.trim()) params.set("search", query.search.trim())
  if (query.categoryId) params.set("categoryId", query.categoryId)
  if (query.minPrice !== null) params.set("minPrice", String(query.minPrice))
  if (query.maxPrice !== null) params.set("maxPrice", String(query.maxPrice))
  if (query.sort !== "featured") {
    if (query.sort === "price-asc") {
      params.set("sortBy", "price")
      params.set("sortOrder", "asc")
    } else if (query.sort === "price-desc") {
      params.set("sortBy", "price")
      params.set("sortOrder", "desc")
    } else if (query.sort === "name-asc") {
      params.set("sortBy", "name")
      params.set("sortOrder", "asc")
    } else if (query.sort === "name-desc") {
      params.set("sortBy", "name")
      params.set("sortOrder", "desc")
    }
  }
  params.set("page", String(page))
  params.set("limit", String(query.limit))
  params.set("isActive", "true")

  return `/product?${params.toString()}`
}

export default function ProductPagination({ meta, query }: Props) {
  if (meta.totalPages <= 1) return null

  const prevPage = meta.page > 1 ? meta.page - 1 : null
  const nextPage = meta.page < meta.totalPages ? meta.page + 1 : null

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-12"
      aria-label="Product pagination"
    >
      {prevPage ? (
        <Link
          href={buildHref(prevPage, query)}
          className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold text-primary ghost-border hover:bg-surface-container/80 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant ghost-border opacity-60 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </span>
      )}

      <p className="text-sm text-on-surface-variant tabular-nums">
        Page <span className="font-semibold text-on-surface">{meta.page}</span> of{" "}
        <span className="font-semibold text-on-surface">{meta.totalPages}</span>
        <span className="mx-2 text-border">·</span>
        <span className="hidden sm:inline">{meta.total} items total</span>
      </p>

      {nextPage ? (
        <Link
          href={buildHref(nextPage, query)}
          className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold text-primary ghost-border hover:bg-surface-container/80 transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-on-surface-variant ghost-border opacity-60 cursor-not-allowed">
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  )
}
