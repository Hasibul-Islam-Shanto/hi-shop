import { Calendar, Heart, Package, Sparkles } from "lucide-react"

interface ProfileStatsProps {
  orderCount?: number
  memberSince?: string
}

const ProfileStats = ({ orderCount = 0, memberSince = "—" }: ProfileStatsProps) => {
  const stats = [
    {
      label: "Total Orders",
      value: String(orderCount),
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Wishlist Items",
      value: "—",
      icon: Heart,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Member Since",
      value: memberSince,
      icon: Calendar,
      color: "text-tertiary",
      bg: "bg-tertiary/10",
    },
    {
      label: "Loyalty Points",
      value: "—",
      icon: Sparkles,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-card rounded-2xl p-4 ghost-border card-premium">
          <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="text-2xl font-extrabold text-on-surface leading-none">{value}</p>
          <p className="text-[11px] text-on-surface-variant mt-1.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

export default ProfileStats
