import type { ICategory } from "@/types/category.type"
import CategoryCard from "./category-card"

const CategoryGrid = ({ categories }: { categories: ICategory[] }) => {
  const featuredSlug =
    categories.length > 0
      ? [...categories].sort((a, b) => (b._count?.products ?? 0) - (a._count?.products ?? 0))[0]
          .slug
      : undefined

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          featured={category.slug === featuredSlug}
        />
      ))}
    </div>
  )
}

export default CategoryGrid
