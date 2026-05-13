import Link from "next/link"

export function AuthNavbar() {
  return (
    <header className="container flex items-center justify-between px-8 py-4 shrink-0">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight text-on-surface hover:text-primary transition-colors"
      >
        hi‑shop
      </Link>

      <nav className="flex items-center gap-6">
        <Link
          href="/about"
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          About
        </Link>
      </nav>
    </header>
  )
}
