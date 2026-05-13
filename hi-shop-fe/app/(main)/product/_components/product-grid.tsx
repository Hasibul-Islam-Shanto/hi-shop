import { Package } from "lucide-react"

import type { ICategoryProductItem } from "@/types/product-list.type"
import ProductCard from "./product-card"

interface ProductGridProps {
  products: ICategoryProductItem[]
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-surface-container ghost-border flex items-center justify-center mb-4">
          <Package className="h-7 w-7 text-on-surface-variant" />
        </div>
        <h3 className="text-base font-semibold text-on-surface mb-1">No products found</h3>
        <p className="text-sm text-on-surface-variant">
          Try adjusting your filters to see more results.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
