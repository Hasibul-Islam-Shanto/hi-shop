import { get } from "@/lib/methods"
import type { ICategory } from "@/types/category.type"
import type { IProductCategoryListResponse } from "@/types/product-list.type"

export type ProductSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"

export type ProductQueryState = {
  search: string
  categoryId: string
  minPrice: number | null
  maxPrice: number | null
  sort: ProductSortOption
  page: number
  limit: number
}

export const DEFAULT_PRICE_RANGE: [number, number] = [0, 2500]
export const DEFAULT_PAGE_LIMIT = 20

export const DEFAULT_PRODUCT_QUERY: ProductQueryState = {
  search: "",
  categoryId: "",
  minPrice: null,
  maxPrice: null,
  sort: "featured",
  page: 1,
  limit: DEFAULT_PAGE_LIMIT,
}

function toPositiveInt(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function toNumber(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === "") return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseProductQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ProductQueryState {
  const sortRaw = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort
  const sort = (() => {
    switch (sortRaw) {
      case "price-asc":
      case "price-desc":
      case "name-asc":
      case "name-desc":
      case "newest":
        return sortRaw
      case "featured":
      default:
        return "featured"
    }
  })()

  return {
    search: Array.isArray(searchParams.search)
      ? (searchParams.search[0] ?? "")
      : (searchParams.search ?? ""),
    categoryId: Array.isArray(searchParams.categoryId)
      ? (searchParams.categoryId[0] ?? "")
      : (searchParams.categoryId ?? ""),
    minPrice: toNumber(searchParams.minPrice),
    maxPrice: toNumber(searchParams.maxPrice),
    sort,
    page: toPositiveInt(searchParams.page, 1),
    limit: Math.min(toPositiveInt(searchParams.limit, DEFAULT_PAGE_LIMIT), 100),
  }
}

export function getActiveFilterCount(query: ProductQueryState): number {
  return [
    query.search.trim().length > 0,
    query.categoryId.length > 0,
    query.minPrice !== null || query.maxPrice !== null,
  ].filter(Boolean).length
}

export function toApiQueryParams(query: ProductQueryState): URLSearchParams {
  const params = new URLSearchParams()

  if (query.search.trim()) params.set("search", query.search.trim())
  if (query.categoryId) params.set("categoryId", query.categoryId)
  if (query.minPrice !== null) params.set("minPrice", String(query.minPrice))
  if (query.maxPrice !== null) params.set("maxPrice", String(query.maxPrice))
  params.set("isActive", "true")
  params.set("page", String(query.page))
  params.set("limit", String(query.limit))

  if (query.sort !== "featured") {
    const { sortBy, sortOrder } = uiSortToApiSort(query.sort)
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)
  }

  return params
}

export function uiSortToApiSort(sort: ProductSortOption): {
  sortBy: "createdAt" | "price" | "name"
  sortOrder: "asc" | "desc"
} {
  switch (sort) {
    case "price-asc":
      return { sortBy: "price", sortOrder: "asc" }
    case "price-desc":
      return { sortBy: "price", sortOrder: "desc" }
    case "name-asc":
      return { sortBy: "name", sortOrder: "asc" }
    case "name-desc":
      return { sortBy: "name", sortOrder: "desc" }
    case "newest":
    case "featured":
    default:
      return { sortBy: "createdAt", sortOrder: "desc" }
  }
}

export function apiSortToUiSort(
  sortBy?: "createdAt" | "price" | "name",
  sortOrder?: "asc" | "desc",
): ProductSortOption {
  if (sortBy === "price") {
    return sortOrder === "asc" ? "price-asc" : "price-desc"
  }
  if (sortBy === "name") {
    return sortOrder === "asc" ? "name-asc" : "name-desc"
  }
  return "featured"
}

export async function fetchProductCatalog(query: ProductQueryState) {
  const params = toApiQueryParams(query)
  return get<IProductCategoryListResponse>(`/products?${params.toString()}`)
}

export async function fetchCategories() {
  return get<ICategory[]>("/categories")
}
