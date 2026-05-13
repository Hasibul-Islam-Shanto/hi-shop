import { Package } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import CategoryProductCard, { type CategoryProductCardModel } from "./category-product-card"

interface CategoryProductGridProps {
  products: CategoryProductCardModel[]
}

const CategoryProductGrid = ({ products }: CategoryProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-2xl ghost-border">
        <div className="h-16 w-16 rounded-full bg-surface-container ghost-border flex items-center justify-center mb-4">
          <Package className="h-7 w-7 text-on-surface-variant" />
        </div>
        <h3 className="text-base font-bold text-on-surface mb-1">Nothing matches quite yet</h3>
        <p className="text-sm text-on-surface-variant mb-6 max-w-xs leading-relaxed">
          Try adjusting sort or clearing filters—or explore another category.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/categories">Browse categories</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <CategoryProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default CategoryProductGrid
