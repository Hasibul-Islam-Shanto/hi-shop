"use client"

import { useEffect, useState } from "react"

import { RotateCcw, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DEFAULT_PRICE_RANGE } from "@/lib/product-catalog"
import type { ICategory } from "@/types/category.type"

export type FilterState = {
  categoryId: string
  minPrice: number | null
  maxPrice: number | null
}

export const DEFAULT_FILTERS: FilterState = {
  categoryId: "",
  minPrice: null,
  maxPrice: null,
}

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  categories: ICategory[]
  applied: FilterState
  onApply: (filters: FilterState) => void
}

const FilterDrawer = ({ open, onClose, categories, applied, onApply }: FilterDrawerProps) => {
  const [draft, setDraft] = useState<FilterState>(DEFAULT_FILTERS)

  useEffect(() => {
    // Reset the draft only when the drawer opens so the applied filters stay in sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setDraft(applied)
  }, [open, applied])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  const activeCount = [
    draft.categoryId.length > 0,
    draft.minPrice !== null || draft.maxPrice !== null,
  ].filter(Boolean).length

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm flex flex-col bg-card transition-transform duration-300 ease-in-out shadow-[var(--shadow-elevated)] border-l border-border/50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface leading-tight">Filter Products</h2>
              <p className="text-[11px] text-on-surface-variant">
                {activeCount > 0
                  ? `${activeCount} filter${activeCount > 1 ? "s" : ""} selected`
                  : "Refine your results"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <div>
            <h3 className="label-text text-[10px] mb-4">Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, categoryId: "" }))}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  draft.categoryId === ""
                    ? "bg-primary text-primary-foreground shadow-[0_0_14px_hsl(var(--primary)/0.3)]"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface ghost-border"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      categoryId: prev.categoryId === category.id ? "" : category.id,
                    }))
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    draft.categoryId === category.id
                      ? "bg-primary text-primary-foreground shadow-[0_0_14px_hsl(var(--primary)/0.3)]"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface ghost-border"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="label-text text-[10px]">Price Range</h3>
              <span className="text-xs font-bold text-primary tabular-nums">
                {draft.minPrice === null
                  ? `$${DEFAULT_PRICE_RANGE[0]}`
                  : `$${draft.minPrice.toLocaleString()}`}{" "}
                —{" "}
                {draft.maxPrice === null
                  ? `$${DEFAULT_PRICE_RANGE[1]}`
                  : `$${draft.maxPrice.toLocaleString()}`}
              </span>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-[11px] text-on-surface-variant">Minimum</span>
                <input
                  type="range"
                  min={DEFAULT_PRICE_RANGE[0]}
                  max={DEFAULT_PRICE_RANGE[1]}
                  step={50}
                  value={draft.minPrice ?? DEFAULT_PRICE_RANGE[0]}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      minPrice: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] text-on-surface-variant">Maximum</span>
                <input
                  type="range"
                  min={DEFAULT_PRICE_RANGE[0]}
                  max={DEFAULT_PRICE_RANGE[1]}
                  step={50}
                  value={draft.maxPrice ?? DEFAULT_PRICE_RANGE[1]}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      maxPrice: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-primary"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/40 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDraft(DEFAULT_FILTERS)}
            className="flex-1 gap-2 text-on-surface-variant hover:text-on-surface"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              onApply(draft)
              onClose()
            }}
            className="flex-1"
          >
            Apply{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
        </div>
      </div>
    </>
  )
}

export default FilterDrawer
