import { notFound } from "next/navigation"
import { get } from "@/lib/methods"
import type { ICategoryProductItem } from "@/types/product-list.type"
import ProductDetailView from "./_components/product-detail-view"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user?: { firstName: string; lastName: string }
}

type Props = { params: Promise<{ id: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params

  let product: ICategoryProductItem
  try {
    product = await get<ICategoryProductItem>(`/products/${id}`)
  } catch {
    notFound()
  }

  let reviews: Review[] = []
  try {
    reviews = await get<Review[]>(`/products/${id}/reviews`)
  } catch {}

  let relatedProducts: ICategoryProductItem[] = []
  try {
    const res = await get<{ data: ICategoryProductItem[] }>(
      `/products?categoryId=${product.categoryId}&limit=4&isActive=true`,
    )
    relatedProducts = res.data.filter((p) => p.id !== product.id).slice(0, 4)
  } catch {}

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container">
          <ProductDetailView
            product={product}
            reviews={reviews}
            relatedProducts={relatedProducts}
          />
        </div>
      </div>
    </div>
  )
}
