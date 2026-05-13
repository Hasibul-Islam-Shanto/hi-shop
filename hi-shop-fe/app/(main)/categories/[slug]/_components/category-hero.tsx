import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export interface CategoryMeta {
  name: string
  image: string
  description: string
  count: number
  tag: string | null
}

interface CategoryHeroProps {
  meta: CategoryMeta
  slug: string
}

const CategoryHero = ({ meta, slug }: CategoryHeroProps) => {
  return (
    <div className="relative overflow-hidden bg-surface-container-lowest border-b border-border/50 mb-8">
      <Image
        src={meta.image}
        alt={meta.name}
        fill
        className="object-cover object-center opacity-15"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/70 to-transparent" />

      <div className="relative container py-12">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-5">
          <Link href="/" className="hover:text-on-surface transition-colors">
            HOME
          </Link>
          <span>›</span>
          <Link href="/categories" className="hover:text-on-surface transition-colors">
            CATEGORIES
          </Link>
          <span>›</span>
          <span className="font-semibold text-on-surface">{meta.name.toUpperCase()}</span>
        </nav>

        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Categories
        </Link>

        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
            <Image
              src={meta.image}
              alt={meta.name}
              width={44}
              height={44}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            {meta.tag && (
              <span className="label-text text-primary-foreground bg-primary text-[10px] px-2.5 py-0.5 rounded-full mb-2 inline-block">
                {meta.tag}
              </span>
            )}
            <span className="label-text text-primary mb-1 block">Category</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface leading-tight">
              {meta.name}
            </h1>
            <p className="text-on-surface-variant mt-2 text-sm max-w-md leading-relaxed">
              {meta.description}
            </p>
            <p className="text-xs text-on-surface-variant mt-3">
              <span className="font-semibold text-on-surface">{meta.count}</span>{" "}
              {meta.count === 1 ? "product" : "products"} in this catalogue
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryHero
