import { Package, ShieldCheck, Sparkles, Star } from "lucide-react"

const STATS = [
  {
    value: "2,000+",
    label: "Curated Products",
    sub: "Each hand-picked by our editors",
    icon: Package,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    value: "50K+",
    label: "Active Members",
    sub: "Growing every month",
    icon: Sparkles,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    value: "4.9",
    label: "Average Rating",
    sub: "Across all products",
    icon: Star,
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    value: "100%",
    label: "Verified Authentic",
    sub: "Zero counterfeits allowed",
    icon: ShieldCheck,
    color: "text-accent",
    bg: "bg-accent/10",
  },
]

const AboutStats = () => {
  return (
    <div className="mb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ value, label, sub, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-card rounded-2xl p-6 ghost-border card-premium text-center"
          >
            <div
              className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-4`}
            >
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <p className="text-3xl font-extrabold text-on-surface mb-1">{value}</p>
            <p className="text-sm font-semibold text-on-surface mb-0.5">{label}</p>
            <p className="text-[11px] text-on-surface-variant">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AboutStats
