import { ArrowRight, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface ProfileBannerProps {
  user: User
}

const ProfileBanner = ({ user }: ProfileBannerProps) => {
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 h-56 ghost-border shadow-(--shadow-lg)">
      <Image
        src="/hero_2.webp"
        alt="Profile banner"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-r from-background/92 via-background/60 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-center px-8">
        <span className="label-text text-primary mb-2 block">Your Profile</span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-1">
          Welcome back, {user.firstName}.
        </h1>
        <p className="text-on-surface-variant text-sm max-w-sm mb-4">{user.email}</p>
        <Link
          href="/product"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors w-fit"
        >
          View Recommendations
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="absolute top-5 right-6 hidden sm:flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold text-on-surface">{fullName}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <Star className="h-3 w-3 fill-tertiary text-tertiary" />
            <span className="text-[11px] text-tertiary font-semibold">Member</span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-primary-foreground shadow-(--shadow-md) ring-2 ring-primary/30">
          {initials || "U"}
        </div>
      </div>
    </div>
  )
}

export default ProfileBanner
