export interface IProductListCategory {
  id: string
  name: string
  slug: string
}

export interface IProductImage {
  id: string
  productId: string
  url: string
  altText: string | null
  isPrimary: boolean
  sortOrder: number
}

export interface IProductVariant {
  id: string
  sku: string
  size: string
  color: string
  stock: number
  priceModifier: number
}

export interface ICategoryProductItem {
  id: string
  categoryId: string
  name: string
  slug: string
  description: string
  basePrice: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  category: IProductListCategory
  images: IProductImage[]
  variants: IProductVariant[]
}

export interface IProductListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IProductCategoryListResponse {
  data: ICategoryProductItem[]
  meta: IProductListMeta
}
