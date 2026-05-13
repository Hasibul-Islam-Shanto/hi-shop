import { Heart, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const WISHLIST_ITEMS = [
  {
    id: 1,
    name: "Helios Quartz Watch",
    collection: "Limited Edition",
    price: "$245",
    image: "/watch.webp",
  },
  {
    id: 2,
    name: "Kinetic Mesh Runner",
    collection: "Sport Series",
    price: "$180",
    image: "/shoe.webp",
  },
  {
    id: 3,
    name: "Leather Crossbody",
    collection: "Heritage Line",
    price: "$165",
    image: "/bags.webp",
  },
  {
    id: 4,
    name: "Mist Chain Bracelet",
    collection: "Accessories",
    price: "$95",
    image: "/accessories.webp",
  },
]

const ProfileWishlist = () => {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-on-surface">Your Wishlist</h2>
        <Link
          href="/product"
          className="text-xs font-semibold text-primary hover:underline underline-offset-4"
        >
          Browse More
        </Link>
      </div>
      <p className="text-on-surface-variant text-sm mb-6">Saved for next curation.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {WISHLIST_ITEMS.map((item) => (
          <div key={item.id} className="group">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low mb-3 card-premium ghost-border">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              <button
                aria-label="Remove from wishlist"
                className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary flex items-center justify-center hover:bg-destructive transition-colors duration-200"
              >
                <Heart className="h-3.5 w-3.5 text-primary-foreground fill-primary-foreground" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <button className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold py-2 rounded-xl hover:bg-primary/90 transition-colors">
                  <ShoppingCart className="h-3 w-3" />
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-on-surface truncate">{item.name}</h3>
                <p className="text-xs text-on-surface-variant">{item.collection}</p>
              </div>
              <span className="text-sm font-bold text-on-surface shrink-0">{item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileWishlist
