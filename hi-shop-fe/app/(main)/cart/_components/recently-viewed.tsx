import Image from "next/image"
import Link from "next/link"

const RECENTLY_VIEWED = [
  {
    id: 1,
    name: "Classic Accessories",
    price: "$120.00",
    image: "/accessories.webp",
    href: "/product/5",
  },
  { id: 2, name: "Leather Bag", price: "$165.00", image: "/bags.webp", href: "/product/6" },
  { id: 3, name: "Urban Runner", price: "$110.00", image: "/shoe.webp", href: "/product/7" },
  { id: 4, name: "Precision Watch", price: "$249.00", image: "/watch.webp", href: "/product/8" },
]

const RecentlyViewed = () => {
  return (
    <div className="mt-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="label-text text-primary mb-1 block">Continue Exploring</span>
          <h2 className="text-xl font-bold text-on-surface">Recently Viewed</h2>
        </div>
        <Link
          href="/shop"
          className="text-sm font-semibold text-primary hover:underline underline-offset-4"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {RECENTLY_VIEWED.map((item) => (
          <Link key={item.id} href={item.href} className="group block">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container-low mb-3 card-premium ghost-border relative">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="text-sm font-semibold text-on-surface truncate">{item.name}</h3>
            <p className="text-sm text-on-surface-variant mt-0.5">{item.price}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentlyViewed
