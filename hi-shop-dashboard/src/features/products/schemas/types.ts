export interface DecimalValue {
  s: number;
  e: number;
  d: number[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  priceModifier: number;
  isActive: boolean;
}

export interface IProduct {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: ProductCategory;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  data: IProduct[];
  meta: PaginationMeta;
}
