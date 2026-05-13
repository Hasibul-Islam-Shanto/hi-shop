import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react"

const PERKS = [
  {
    icon: Truck,
    label: "Free Shipping",
    desc: "On orders over $50",
  },
  {
    icon: RotateCcw,
    label: "Easy Returns",
    desc: "30-day return policy",
  },
  {
    icon: ShieldCheck,
    label: "Secure Payment",
    desc: "100% protected checkout",
  },
  {
    icon: Headphones,
    label: "24/7 Support",
    desc: "We're always here",
  },
]

const PerksSection = () => {
  return (
    <section className="border-y border-border/50 bg-surface-container-low py-5">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/50">
          {PERKS.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-6 py-3 ${
                i % 2 === 0 ? "" : ""
              } ${i >= 2 ? "border-t border-border/50 lg:border-t-0" : ""}`}
            >
              <span className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{label}</p>
                <p className="text-xs text-on-surface-variant truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PerksSection
