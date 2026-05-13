import { ArrowRight, Github, Instagram, Twitter } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const NAV_COLS = [
  {
    title: "Gallery",
    links: [
      { label: "Journal", href: "/journal" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Curation Policy", href: "/curation" },
      { label: "New Drops", href: "/shop" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Clothing", href: "/categories/clothing" },
      { label: "Accessories", href: "/categories/accessories" },
      { label: "Footwear", href: "/categories/footwear" },
      { label: "All Products", href: "/shop" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
]

const SOCIALS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
]

const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-border/50">
      <div className="container pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-on-surface hover:text-primary transition-colors inline-block mb-3"
            >
              hi‑shop
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
              Defining the intersection of avant‑garde design and functional commerce. Curated for
              the modern lifestyle.
            </p>

            <div className="flex gap-1 mt-5">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
                  asChild
                >
                  <Link href={href} aria-label={label}>
                    <Icon className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {NAV_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="label-text text-on-surface mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-surface-container ghost-border p-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-on-surface mb-0.5">Join the Collective</p>
              <p className="text-xs text-on-surface-variant">
                New drops in your inbox twice weekly.
              </p>
            </div>
            <div className="flex w-full sm:w-auto sm:max-w-xs">
              <input
                type="email"
                placeholder="email@address.com"
                className="flex-1 min-w-0 bg-surface-container-low rounded-l-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none ghost-border"
              />
              <button
                type="button"
                className="flex items-center gap-1.5 bg-primary rounded-r-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                Subscribe <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border/50">
          <p className="text-xs text-on-surface-variant">
            © 2026 hi‑shop Kinetic Gallery. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
