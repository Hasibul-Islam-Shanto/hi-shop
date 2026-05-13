import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getCategoryImagePath } from "@/lib/category-images"
import type { ICategory } from "@/types/category.type"
const CATEGORY_IMAGE_FALLBACK = "/hero_1.webp"

export interface CategoryCardProps {
  category: ICategory
  featured?: boolean
}

const CategoryCard = ({ category, featured = false }: CategoryCardProps) => {
  const imageSrc = getCategoryImagePath(category.slug) ?? CATEGORY_IMAGE_FALLBACK
  const productCount = category._count?.products ?? 0

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`group relative rounded-2xl overflow-hidden text-left card-premium ghost-border block ${
        featured ? "aspect-video md:col-span-2" : "aspect-4/3"
      }`}
    >
      <Image
        src={imageSrc}
        alt={category.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes={featured ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
      />
      <div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/20 to-transparent" />

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3
            className={`font-bold text-on-surface truncate ${featured ? "text-xl" : "text-base"}`}
          >
            {category.name}
          </h3>
          <p className="text-on-surface-variant text-xs mt-0.5">
            {productCount === 1 ? "1 item" : `${productCount} items`}
          </p>
        </div>
        <div className="h-8 w-8 shrink-0 rounded-full bg-surface-container/50 backdrop-blur-sm ghost-border flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight className="h-3.5 w-3.5 text-on-surface" />
        </div>
      </div>
    </Link>
  )
}

export default CategoryCard
