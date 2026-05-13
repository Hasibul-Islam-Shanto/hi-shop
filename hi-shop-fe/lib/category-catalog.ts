import { get } from "@/lib/methods"
import { uiSortToApiSort, type ProductQueryState } from "@/lib/product-catalog"
import type { ICategory } from "@/types/category.type"
import type { IProductCategoryListResponse } from "@/types/product-list.type"

export async function fetchCategoryBySlug(slug: string) {
  return get<ICategory>(`/categories/slug/${slug}`)
}

export async function fetchCategoryProducts(
  categoryId: string,
  query: Pick<ProductQueryState, "search" | "minPrice" | "maxPrice" | "sort" | "page" | "limit">,
) {
  const params = new URLSearchParams({
    isActive: "true",
    page: String(query.page),
    limit: String(query.limit),
  })

  if (query.search.trim()) params.set("search", query.search.trim())
  if (query.minPrice !== null) params.set("minPrice", String(query.minPrice))
  if (query.maxPrice !== null) params.set("maxPrice", String(query.maxPrice))

  if (query.sort !== "featured") {
    const { sortBy, sortOrder } = uiSortToApiSort(query.sort)
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)
  }

  return get<IProductCategoryListResponse>(`/products/category/${categoryId}?${params.toString()}`)
}
