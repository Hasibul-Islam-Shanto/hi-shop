import {
  Heart,
  LayoutGrid,
  Lock,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react"

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "Curated Collections",
    desc: "Every product is hand-picked by our editorial team for exceptional quality and design.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Sparkles,
    title: "Personalised Picks",
    desc: "Our algorithm learns your taste and surfaces pieces that match your personal style.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Lock,
    title: "Secure Checkout",
    desc: "256-bit SSL encryption on every transaction. Your payment data is never stored.",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    icon: Truck,
    title: "Express Delivery",
    desc: "Fast shipping from verified warehouses, tracked from dispatch to your door.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    desc: "Changed your mind? No questions asked. Full refund within 30 days.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Heart,
    title: "Wishlist & Save",
    desc: "Build your collection and get notified when saved items drop in price.",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    icon: Star,
    title: "Verified Reviews",
    desc: "Every review is from a verified purchase. Real opinions from real members.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MapPin,
    title: "Live Order Tracking",
    desc: "Watch your order move in real-time from warehouse to your front door.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: ShieldCheck,
    title: "Authenticity Guarantee",
    desc: "Every item passes our 12-point verification before it reaches our platform.",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
]

const AboutFeatures = () => {
  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <span className="label-text text-primary mb-3 block">Why Hi-Shop</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-3">
          Built Around How You Shop
        </h2>
        <p className="text-on-surface-variant max-w-xl mx-auto text-sm leading-relaxed">
          Every feature exists because our members asked for it. We listen, build, and iterate until
          it feels exactly right.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="bg-card rounded-2xl p-5 ghost-border card-premium">
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <h3 className="text-base font-bold text-on-surface mb-2">{title}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AboutFeatures
