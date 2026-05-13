import CategoriesFetchError from "../_components/categories-fetch-error"
import CategoryHero, { CategoryMeta } from "./_components/category-hero"
import CategoryProductsView from "./_components/category-products-view"
import { getCategoryImagePath } from "@/lib/category-images"
import { fetchCategoryBySlug, fetchCategoryProducts } from "@/lib/category-catalog"
import { parseProductQuery, type ProductSortOption } from "@/lib/product-catalog"
import { humanizeSlug } from "@/lib/product-list-utils"
import type { ICategory } from "@/types/category.type"
import type { IProductListMeta } from "@/types/product-list.type"
import type { ICategoryProductItem } from "@/types/product-list.type"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultMeta = (): IProductListMeta => ({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
})

function buildHeroMeta(
  slug: string,
  categoryInfo: ICategory | undefined,
  catalogueTotal: number,
): CategoryMeta {
  const name = categoryInfo?.name ?? humanizeSlug(slug.replace(/^\s+|\s+$/g, ""))
  const image = getCategoryImagePath(slug) ?? "/hero_1.webp"
  const description =
    categoryInfo?.description?.trim() ||
    `Shop ${name}: quality pieces with sizes and colors to choose from.`

  return {
    name,
    image,
    description,
    count: catalogueTotal,
    tag: null,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const query = parseProductQuery(sp)

  let categoryInfo: ICategory | undefined
  try {
    categoryInfo = await fetchCategoryBySlug(slug)
  } catch {}

  let listError: string | null = null
  let listMeta: IProductListMeta = defaultMeta()
  let items: ICategoryProductItem[] = []

  if (categoryInfo?.id) {
    try {
      const payload = await fetchCategoryProducts(categoryInfo.id, query)
      listMeta = payload.meta
      items = payload.data
    } catch (error) {
      listError = error instanceof Error ? error.message : "Failed to load products."
    }
  } else {
    listError = "Category not found."
  }

  const heroMeta = buildHeroMeta(slug, categoryInfo, listMeta.total)
  const sortBy: ProductSortOption = query.sort

  if (listError) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <CategoryHero meta={heroMeta} slug={slug} />
        <div className="container py-10">
          <CategoriesFetchError message={listError} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <CategoryProductsView
        slug={slug}
        heroMeta={heroMeta}
        products={items}
        listMeta={listMeta}
        sortBy={sortBy}
        query={query}
      />
    </div>
  )
}
