"use client"

import { Menu, Search, ShoppingBag, User, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { NavLink } from "./nav-link"
import Image from "next/image"
import { useCartStore } from "@/lib/store/cart"
import { useAuth } from "@/context/auth-context"
import { handleLogout } from "@/app/_actions/authActions"

const NAV_LINKS = [
  { label: "Shop", href: "/product" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
]

const Navbar = () => {
  const itemCount = useCartStore((s) => s.itemCount)
  const { user, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const closeMobile = () => setMobileOpen(false)

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/50"
          : "bg-background/50 backdrop-blur-xl"
      }`}
    >
      <div className="container h-14 flex items-center justify-between relative">
        <Link
          href="/"
          className="text-lg flex items-center gap-1 font-bold tracking-tight text-on-surface hover:text-primary transition-colors shrink-0"
        >
          <Image
            src="/hi_shop_logo.webp"
            alt="hi-shop logo"
            width={100}
            height={100}
            className="w-10 h-10"
          />
          <span>shop</span>
        </Link>
        <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-on-surface-variant hover:text-on-surface"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? "Close search" : "Open search"}
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-on-surface-variant hover:text-on-surface relative"
            asChild
          >
            <Link href="/cart" aria-label="Cart">
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center leading-none">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          </Button>

          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8 text-on-surface-variant hover:text-on-surface"
              asChild
            >
              <Link href={`/profile/${user!.id}`} aria-label="Profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex text-on-surface-variant hover:text-on-surface text-xs font-medium"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-on-surface-variant"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          searchOpen ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container pb-3">
          <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-2.5 ghost-border">
            <Search className="h-4 w-4 text-on-surface-variant shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products, collections…"
              className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none"
            />
            <kbd className="hidden sm:inline text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded font-mono">
              ESC
            </kbd>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-2xl">
          <div className="container py-3 flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                mobile
                onClick={closeMobile}
              />
            ))}

            <div className="h-px bg-border/50 my-2" />

            {isAuthenticated ? (
              <>
                <Link
                  href={`/profile/${user!.id}`}
                  onClick={closeMobile}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  My Account
                </Link>
                <form action={handleLogout}>
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:text-destructive hover:bg-surface-container rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMobile}
                className="px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface-container rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
