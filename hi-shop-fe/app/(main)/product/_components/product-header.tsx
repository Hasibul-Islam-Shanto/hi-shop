"use client"

import { ChevronDown, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ProductSortOption } from "@/lib/product-catalog"

interface ProductHeaderProps {
  sortBy: ProductSortOption
  setSortBy: (val: ProductSortOption) => void
  sortOptions: Array<{ label: string; value: ProductSortOption }>
  onOpenFilters: () => void
  activeFilterCount: number
  count: number
}

const ProductHeader = ({
  sortBy,
  setSortBy,
  sortOptions,
  onOpenFilters,
  activeFilterCount,
  count,
}: ProductHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <span className="label-text text-primary mb-1 block">Browse</span>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">The Seasonal Edit</h1>
        <p className="text-on-surface-variant mt-1 text-sm max-w-lg">
          Curating items that bridge the gap between utilitarian performance and sculptural beauty.
        </p>
        <p className="text-xs text-on-surface-variant mt-2">
          <span className="font-semibold text-on-surface">{count}</span> products
        </p>
      </div>

      <div className="flex items-center gap-3 mt-1 shrink-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenFilters}
            aria-label="Open filters"
            className={activeFilterCount > 0 ? "bg-primary/10 text-primary" : ""}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center pointer-events-none">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-card rounded-xl px-3 py-2 ghost-border">
          <span className="label-text text-[10px]">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
            className="text-sm text-on-surface font-medium bg-transparent border-none outline-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-card text-on-surface">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="h-4 w-4 text-on-surface-variant pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

export default ProductHeader
