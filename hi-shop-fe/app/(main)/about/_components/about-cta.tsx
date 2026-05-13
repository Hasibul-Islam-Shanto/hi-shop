import { ArrowRight, LayoutGrid } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const AboutCta = () => {
  return (
    <div className="relative rounded-3xl overflow-hidden ghost-border">
      <Image
        src="/hero_4.webp"
        alt="Start shopping"
        fill
        className="object-cover object-center opacity-15"
      />
      <div className="absolute inset-0 bg-linear-to-br from-background/95 via-background/85 to-background/70" />
      <div className="absolute inset-0 aurora-gradient-subtle" />

      <div className="relative z-10 text-center py-24 px-6">
        <span className="label-text text-primary mb-4 block">Start Shopping</span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-on-surface mb-5 max-w-2xl mx-auto leading-tight">
          Ready to Discover Your Next Favourite Piece?
        </h2>
        <p className="text-on-surface-variant mb-10 max-w-md mx-auto text-sm leading-relaxed">
          Browse our carefully curated collections and find items that truly speak to your style.
          New arrivals added every week.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/product"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-7 py-3.5 rounded-xl hover:bg-primary/90 transition-colors ambient-glow"
          >
            Shop the Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-on-surface font-semibold px-7 py-3.5 rounded-xl bg-card ghost-border hover:bg-surface-container transition-colors"
          >
            <LayoutGrid className="h-4 w-4" />
            Browse Categories
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-12">
          {["Free Returns", "Secure Payment", "Verified Products"].map((badge) => (
            <div key={badge} className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              <span className="text-xs text-on-surface-variant font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AboutCta
