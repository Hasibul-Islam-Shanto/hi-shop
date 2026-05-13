import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { ProductQueryState, ProductSortOption } from "@/lib/product-catalog"
import type { ICategoryProductItem, IProductListMeta } from "@/types/product-list.type"

import CategoryHero, { type CategoryMeta } from "./category-hero"
import { mapCategoryProductItem } from "./category-product-card"
import CategoryProductGrid from "./category-product-grid"
import CategorySortBar from "./category-sort-bar"

interface CategoryProductsViewProps {
  slug: string
  heroMeta: CategoryMeta
  products: ICategoryProductItem[]
  listMeta: IProductListMeta
  sortBy: ProductSortOption
  query: ProductQueryState
}

function buildHref(slug: string, page: number, query: ProductQueryState) {
  const params = new URLSearchParams()

  if (query.search.trim()) params.set("search", query.search.trim())
  if (query.minPrice !== null) params.set("minPrice", String(query.minPrice))
  if (query.maxPrice !== null) params.set("maxPrice", String(query.maxPrice))
  if (page > 1) params.set("page", String(page))
  if (query.limit !== 20) params.set("limit", String(query.limit))

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
  } else if (query.sort === "newest") {
    params.set("sortBy", "createdAt")
    params.set("sortOrder", "desc")
  }

  const qs = params.toString()
  return qs ? `/categories/${slug}?${qs}` : `/categories/${slug}`
}

export default function CategoryProductsView({
  slug,
  heroMeta,
  products,
  listMeta,
  sortBy,
  query,
}: CategoryProductsViewProps) {
  const cards = products.map(mapCategoryProductItem)
  const prevPage = listMeta.page > 1 ? listMeta.page - 1 : null
  const nextPage = listMeta.page < listMeta.totalPages ? listMeta.page + 1 : null

  return (
    <>
      <CategoryHero meta={heroMeta} slug={slug} />

      <div className="container pb-16">
        <CategorySortBar count={cards.length} totalCatalog={listMeta.total} sortBy={sortBy} />

        <CategoryProductGrid products={cards} />

        {listMeta.totalPages > 1 && (
          <nav
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-12"
            aria-label="Product pagination"
          >
            {prevPage ? (
              <Link
                href={buildHref(slug, prevPage, query)}
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
              Page <span className="font-semibold text-on-surface">{listMeta.page}</span> of{" "}
              <span className="font-semibold text-on-surface">{listMeta.totalPages}</span>
              <span className="mx-2 text-border">·</span>
              <span className="hidden sm:inline">{listMeta.total} items total</span>
            </p>

            {nextPage ? (
              <Link
                href={buildHref(slug, nextPage, query)}
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
        )}
      </div>
    </>
  )
}
