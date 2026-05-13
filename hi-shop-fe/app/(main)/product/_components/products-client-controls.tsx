"use client"

import { X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DEFAULT_PRODUCT_QUERY,
  type ProductQueryState,
  type ProductSortOption,
  uiSortToApiSort,
} from "@/lib/product-catalog"
import type { ICategory } from "@/types/category.type"

import FilterDrawer, { type FilterState } from "./filter-drawer"
import ProductHeader from "./product-header"

const SORT_OPTIONS: Array<{ label: string; value: ProductSortOption }> = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
]

interface ProductsClientControlsProps {
  categories: ICategory[]
  query: ProductQueryState
  totalCount: number
}

function getUiSort(query: ProductQueryState): ProductSortOption {
  const { sortBy, sortOrder } = uiSortToApiSort(query.sort)
  if (sortBy === "createdAt" && sortOrder === "desc") return "featured"
  return query.sort
}

function areFiltersDefault(query: ProductQueryState): boolean {
  return (
    query.search.trim().length === 0 &&
    query.categoryId.length === 0 &&
    query.minPrice === null &&
    query.maxPrice === null
  )
}

export default function ProductsClientControls({
  categories,
  query,
  totalCount,
}: ProductsClientControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sortBy = getUiSort(query)

  const activeFilterCount = useMemo(
    () =>
      [
        query.search.trim().length > 0,
        query.categoryId.length > 0,
        query.minPrice !== null || query.maxPrice !== null,
      ].filter(Boolean).length,
    [query],
  )

  const pushParams = (next: Partial<ProductQueryState>) => {
    const params = new URLSearchParams(searchParams.toString())

    const nextQuery: ProductQueryState = {
      ...DEFAULT_PRODUCT_QUERY,
      ...query,
      ...next,
    }

    if (
      nextQuery.minPrice !== null &&
      nextQuery.maxPrice !== null &&
      nextQuery.minPrice > nextQuery.maxPrice
    ) {
      ;[nextQuery.minPrice, nextQuery.maxPrice] = [nextQuery.maxPrice, nextQuery.minPrice]
    }

    if (nextQuery.search.trim()) params.set("search", nextQuery.search.trim())
    else params.delete("search")

    if (nextQuery.categoryId) params.set("categoryId", nextQuery.categoryId)
    else params.delete("categoryId")

    if (nextQuery.minPrice !== null) params.set("minPrice", String(nextQuery.minPrice))
    else params.delete("minPrice")

    if (nextQuery.maxPrice !== null) params.set("maxPrice", String(nextQuery.maxPrice))
    else params.delete("maxPrice")

    if (nextQuery.sort !== "featured") {
      const { sortBy, sortOrder } = uiSortToApiSort(nextQuery.sort)
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)
    } else {
      params.delete("sortBy")
      params.delete("sortOrder")
    }

    params.set("page", String(nextQuery.page))
    params.set("limit", String(nextQuery.limit))
    params.set("isActive", "true")

    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const updateSort = (nextSort: ProductSortOption) => {
    pushParams({ sort: nextSort, page: 1 })
  }

  const applyFilters = (nextFilters: FilterState) => {
    pushParams({
      categoryId: nextFilters.categoryId,
      minPrice: nextFilters.minPrice,
      maxPrice: nextFilters.maxPrice,
      page: 1,
    })
  }

  const removeCategory = () => {
    pushParams({ categoryId: "", page: 1 })
  }

  const clearAll = () => {
    pushParams({
      search: "",
      categoryId: "",
      minPrice: null,
      maxPrice: null,
      sort: "featured",
      page: 1,
    })
  }

  return (
    <>
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        applied={{
          categoryId: query.categoryId,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
        }}
        onApply={applyFilters}
      />

      <ProductHeader
        sortBy={sortBy}
        setSortBy={updateSort}
        sortOptions={SORT_OPTIONS}
        onOpenFilters={() => setDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
        count={totalCount}
      />

      {!areFiltersDefault(query) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 -mt-3">
          {query.categoryId && (
            <button
              type="button"
              onClick={removeCategory}
              className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full ghost-border hover:bg-primary/20 transition-colors"
            >
              {categories.find((category) => category.id === query.categoryId)?.name ?? "Category"}
              <X className="h-3 w-3" />
            </button>
          )}

          {(query.minPrice !== null || query.maxPrice !== null) && (
            <button
              type="button"
              onClick={() =>
                pushParams({
                  minPrice: null,
                  maxPrice: null,
                  page: 1,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full ghost-border hover:bg-primary/20 transition-colors"
            >
              Price
              <X className="h-3 w-3" />
            </button>
          )}

          {query.search.trim() && (
            <button
              type="button"
              onClick={() => pushParams({ search: "", page: 1 })}
              className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full ghost-border hover:bg-primary/20 transition-colors"
            >
              Search
              <X className="h-3 w-3" />
            </button>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={clearAll}
            className="text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors underline underline-offset-2 ml-1"
          >
            Clear all
          </Button>
        </div>
      )}
    </>
  )
}
