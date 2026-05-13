"use client"

import { ChevronDown } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import type { ProductSortOption } from "@/lib/product-catalog"

const SORT_OPTIONS: Array<{ label: string; value: ProductSortOption }> = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
]

interface CategorySortBarProps {
  count: number
  totalCatalog?: number
  sortBy: ProductSortOption
}

const CategorySortBar = ({ count, totalCatalog, sortBy }: CategorySortBarProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalLabel =
    totalCatalog !== undefined && totalCatalog !== count
      ? `Showing ${count} of ${totalCatalog}`
      : null

  const updateSort = (nextSort: ProductSortOption) => {
    const params = new URLSearchParams(searchParams.toString())

    if (nextSort === "featured") {
      params.delete("sortBy")
      params.delete("sortOrder")
    } else if (nextSort === "price-asc") {
      params.set("sortBy", "price")
      params.set("sortOrder", "asc")
    } else if (nextSort === "price-desc") {
      params.set("sortBy", "price")
      params.set("sortOrder", "desc")
    } else if (nextSort === "name-asc") {
      params.set("sortBy", "name")
      params.set("sortOrder", "asc")
    } else if (nextSort === "name-desc") {
      params.set("sortBy", "name")
      params.set("sortOrder", "desc")
    } else {
      params.set("sortBy", "createdAt")
      params.set("sortOrder", "desc")
    }

    params.set("page", "1")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <p className="text-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface">{count}</span>{" "}
        {count === 1 ? "item" : "items"}
        {totalLabel ? (
          <>
            {" "}
            <span className="text-border">·</span>{" "}
            <span className="text-on-surface-variant/90">{totalLabel}</span>
          </>
        ) : null}
      </p>

      <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-2 ghost-border shrink-0">
        <span className="label-text text-[10px]">Sort</span>
        <select
          value={sortBy}
          onChange={(e) => updateSort(e.target.value as ProductSortOption)}
          className="text-sm text-on-surface font-medium bg-transparent border-none outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-card text-on-surface">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="h-4 w-4 text-on-surface-variant pointer-events-none" />
      </div>
    </div>
  )
}

export default CategorySortBar
