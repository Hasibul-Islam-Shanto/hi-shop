"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  label: string
  mobile?: boolean
  onClick?: () => void
}

export function NavLink({ href, label, mobile = false, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === href : pathname.startsWith(href)

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
          isActive
            ? "text-on-surface bg-surface-container"
            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
        )}
      >
        {label}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        "relative px-4 py-1.5 text-[13px] font-medium transition-colors duration-200 rounded-md",
        isActive ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface",
      )}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-primary" />
      )}
    </Link>
  )
}
