import CategoryShowCase from "@/components/home/category-showcase"
import FeatureProducts from "@/components/home/feature-products"
import HeroSection from "@/components/home/hero-section"
import PerksSection from "@/components/home/perks-section"
import TestimonialSection from "@/components/home/testimonial-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingBag, Star } from "lucide-react"
import Link from "next/link"

const CATEGORIES = [
  { name: "Electronics", count: "240+ items", emoji: "⚡" },
  { name: "Fashion", count: "180+ items", emoji: "👗" },
  { name: "Home & Living", count: "320+ items", emoji: "🏡" },
  { name: "Beauty", count: "150+ items", emoji: "✨" },
]

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$129",
    originalPrice: "$179",
    badge: "Sale",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    price: "$249",
    originalPrice: null,
    badge: "New",
    rating: 4.9,
    reviews: 87,
  },
  {
    id: 3,
    name: "Running Shoes",
    price: "$89",
    originalPrice: "$119",
    badge: "Hot",
    rating: 4.7,
    reviews: 203,
  },
  {
    id: 4,
    name: "Leather Wallet",
    price: "$49",
    originalPrice: null,
    badge: null,
    rating: 4.6,
    reviews: 56,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <HeroSection />
        <PerksSection />
        <FeatureProducts />
        <CategoryShowCase />
        <TestimonialSection />
      </main>
    </div>
  )
}
