import {
  fetchCategories,
  fetchProductCatalog,
  getActiveFilterCount,
  parseProductQuery,
} from "@/lib/product-catalog"
import type { ICategory } from "@/types/category.type"
import type { IProductCategoryListResponse } from "@/types/product-list.type"

import ProductGrid from "./_components/product-grid"
import ProductPagination from "./_components/product-pagination"
import ProductsClientControls from "./_components/products-client-controls"

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams
  const query = parseProductQuery(sp)

  let categories: ICategory[] = []
  let productResponse: IProductCategoryListResponse | null = null
  let errorMessage: string | null = null

  try {
    ;[categories, productResponse] = await Promise.all([
      fetchCategories(),
      fetchProductCatalog(query),
    ])
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Failed to load products."
    categories = []
  }

  if (errorMessage || !productResponse) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-16">
          <div className="container">
            <p className="text-center py-20 text-sm text-destructive">
              {errorMessage ?? "Failed to load products."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const activeFilterCount = getActiveFilterCount(query)

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container">
          <ProductsClientControls
            categories={categories}
            query={query}
            totalCount={productResponse.meta.total}
          />

          {productResponse.data.length === 0 ? (
            <p className="text-center py-20 text-sm text-on-surface-variant">
              No products match your current filters.
            </p>
          ) : (
            <>
              <ProductGrid products={productResponse.data} />
              <ProductPagination meta={productResponse.meta} query={query} />
            </>
          )}

          <div className="flex justify-center mt-10">
            <span className="text-xs text-on-surface-variant">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`
                : "Browse the full collection"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
