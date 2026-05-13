import { LayoutGrid } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import CategoryGrid from "./_components/category-grid"
import CategoriesFetchError from "./_components/categories-fetch-error"
import { ICategory } from "@/types/category.type"
import { get } from "@/lib/methods"

export default async function CategoriesPage() {
  let categories: ICategory[] = []
  let err: string | null = null

  try {
    categories = await get<ICategory[]>("/categories")
  } catch (error) {
    err = error instanceof Error ? error.message : "An unknown error occurred"
  }

  return (
    <div className="pb-16">
      <div className="relative overflow-hidden bg-surface-container-lowest border-b border-border/50">
        <Image
          src="/hero_1.webp"
          alt="Categories hero"
          fill
          className="object-cover object-center opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/60 to-background" />

        <div className="relative container py-14">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
            <Link href="/" className="hover:text-on-surface transition-colors">
              HOME
            </Link>
            <span>›</span>
            <span className="font-semibold text-on-surface">CATEGORIES</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="label-text text-primary mb-1 block">Browse by</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
                All Categories
              </h1>
              <p className="text-on-surface-variant mt-2 text-sm max-w-md leading-relaxed">
                Explore our curated collections, from everyday essentials to limited-edition drops.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10">
        {err ? (
          <CategoriesFetchError message={err} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">{categories.length}</span>{" "}
                {categories.length === 1 ? "collection" : "collections"}
              </p>
              <Link
                href="/product"
                className="text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                View All Products
              </Link>
            </div>

            <CategoryGrid categories={categories} />
          </>
        )}
      </div>
    </div>
  )
}
