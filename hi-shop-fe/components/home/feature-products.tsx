"use client"

import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const PRODUCTS = [
  {
    id: 1,
    name: "Classic White Tee",
    price: "$49",
    tag: "New",
    image: "/t-shirt.webp",
    href: "/product/1",
  },
  {
    id: 2,
    name: "Leather Crossbody",
    price: "$129",
    tag: "Trending",
    image: "/bags.webp",
    href: "/product/2",
  },
  {
    id: 3,
    name: "Precision Watch",
    price: "$249",
    tag: null,
    image: "/watch.webp",
    href: "/product/3",
  },
  {
    id: 4,
    name: "Street Runner",
    price: "$89",
    tag: "Sale",
    image: "/shoe.webp",
    href: "/product/4",
  },
]

const FeatureProducts = () => {
  return (
    <section className="py-16 bg-surface-container-low">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="label-text text-primary mb-2 block">Featured Curation</span>
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Selected Items</h2>
            <p className="text-on-surface-variant mt-1 text-sm">
              From our current editorial focus.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            View All <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCTS.map((product) => (
            <Link
              href={product.href}
              key={product.id}
              className="group relative rounded-2xl overflow-hidden bg-card card-premium ghost-border block"
            >
              <div className="relative aspect-4/5 overflow-hidden rounded-t-2xl bg-surface-container">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.tag && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">
                    {product.tag}
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Add to wishlist"
                  onClick={(e) => e.preventDefault()}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-surface-container/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-on-surface-variant hover:text-primary"
                >
                  <Heart className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-on-surface truncate">{product.name}</h3>
                <p className="text-primary font-bold text-sm mt-0.5">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/shop"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            View All <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeatureProducts
