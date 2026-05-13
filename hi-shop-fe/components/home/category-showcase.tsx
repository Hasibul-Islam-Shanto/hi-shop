import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const CategoryShowCase = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="label-text text-primary mb-2 block">Shop by Category</span>
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Browse Collections</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Link
            href="/categories/clothing"
            className="md:col-span-3 relative rounded-2xl overflow-hidden group min-h-[380px] card-premium ghost-border block"
          >
            <Image
              src="/clothing.webp"
              alt="Clothing collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/20 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="inline-block bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-2">
                Clothing
              </span>
              <p className="text-on-surface/80 text-sm mt-1">Engineered for movement.</p>
            </div>
          </Link>

          <div className="md:col-span-2 flex flex-col gap-4">
            <Link
              href="/categories/accessories"
              className="relative rounded-2xl overflow-hidden group flex-1 min-h-[175px] card-premium ghost-border block"
            >
              <Image
                src="/accessories.webp"
                alt="Accessories"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/20 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="label-text text-on-surface bg-surface-container/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  Accessories
                </span>
              </div>
            </Link>

            <div className="relative rounded-2xl overflow-hidden bg-surface-container-low ghost-border flex-1 min-h-[175px] flex flex-col items-center justify-center text-center p-6 card-premium">
              <div className="absolute inset-0 aurora-gradient-subtle opacity-60 pointer-events-none rounded-2xl" />
              <div className="relative">
                <span className="label-text text-primary mb-2 block">Exclusive</span>
                <h3 className="text-xl font-extrabold text-on-surface mb-1">NEW DROPS</h3>
                <p className="text-xs text-on-surface-variant mb-4">Fresh arrivals every week.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/shop">Discover</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CategoryShowCase
