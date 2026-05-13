"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import type { ICategoryProductItem } from "@/types/product-list.type"
import { useCartStore } from "@/lib/store/cart"
import { getPrimaryProductImage } from "@/lib/product-list-utils"
import ProductGallery from "./product-gallery"
import ProductInfo from "./product-info"
import ProductRelated from "./product-related"
import ProductTabs from "./product-tabs"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user?: { firstName: string; lastName: string }
}

interface ProductDetailViewProps {
  product: ICategoryProductItem
  reviews: Review[]
  relatedProducts: ICategoryProductItem[]
}

const FALLBACK_IMAGE = "/hero_1.webp"

const ProductDetailView = ({ product, reviews, relatedProducts }: ProductDetailViewProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedFinish, setSelectedFinish] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")

  const addItem = useCartStore((s) => s.addItem)

  const images =
    product.images.length > 0
      ? product.images
          .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
          .map((img) => img.url)
      : [FALLBACK_IMAGE]

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  const specs = product.variants.flatMap((v) =>
    [`Size: ${v.size}`, `Color: ${v.color}`, `SKU: ${v.sku}`].filter(Boolean),
  )

  const selectedVariant = product.variants[selectedFinish] ?? product.variants[0]
  const selectedStock = selectedVariant?.stock ?? 0
  const effectivePrice = selectedVariant
    ? product.basePrice + selectedVariant.priceModifier
    : product.basePrice

  const productData = {
    name: product.name,
    label: product.category.name,
    rating: parseFloat(avgRating.toFixed(1)),
    reviews: reviews.length,
    price: effectivePrice,
    description: product.description,
  }

  const handleSelectVariant = (index: number) => {
    const nextVariant = product.variants[index]
    setSelectedFinish(index)
    setQuantity((current) => Math.min(current, Math.max(1, nextVariant?.stock ?? 1)))
  }

  const handleQuantityChange = (nextQuantity: number) => {
    setQuantity(Math.min(Math.max(1, nextQuantity), Math.max(1, selectedStock)))
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("No variant available for this product.")
      return
    }
    if (selectedVariant.stock <= 0) {
      toast.error("This variant is out of stock.")
      return
    }
    const { url: imageUrl } = getPrimaryProductImage(product)
    addItem({
      productVariantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantLabel: `${selectedVariant.color} / ${selectedVariant.size}`,
      price: effectivePrice,
      image: imageUrl,
      stock: selectedVariant.stock,
      quantity: Math.min(quantity, selectedVariant.stock),
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-on-surface transition-colors">
          HOME
        </Link>
        <span className="text-outline-variant">›</span>
        <Link href="/product" className="hover:text-on-surface transition-colors">
          SHOP
        </Link>
        <span className="text-outline-variant">›</span>
        <span className="font-semibold text-on-surface">{product.name.toUpperCase()}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery
          images={images}
          name={product.name}
          tag={null}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
        />

        <div>
          <ProductInfo
            product={productData}
            variants={product.variants}
            selectedFinish={selectedFinish}
            onSelectFinish={handleSelectVariant}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
          />
          <ProductTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            description={product.description}
            specs={specs}
            reviews={reviews}
          />
        </div>
      </div>

      <ProductRelated products={relatedProducts} />
    </>
  )
}

export default ProductDetailView
