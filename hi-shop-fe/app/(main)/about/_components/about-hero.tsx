import { ArrowRight, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const AboutHero = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl min-h-[520px] flex items-center ghost-border mb-20">
      <Image
        src="/hero_1.webp"
        alt="Hi-Shop story"
        fill
        className="object-cover object-center opacity-20"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-r from-background via-background/75 to-transparent" />

      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-linear-to-l from-primary/30 to-transparent" />

      <div className="relative z-10 container py-20">
        <span className="label-text text-primary mb-4 block">Our Story</span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface leading-tight mb-6 max-w-3xl">
          Crafted for Those Who Demand the Best.
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg max-w-xl leading-relaxed mb-10">
          Hi-Shop was born from a simple belief — that fashion should feel intentional. We curate
          only what matters, so you never have to settle for ordinary.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/product"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors ambient-glow"
          >
            Explore Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-medium transition-colors">
            <div className="h-10 w-10 rounded-full bg-surface-container ghost-border flex items-center justify-center">
              <Play className="h-4 w-4 fill-on-surface text-on-surface ml-0.5" />
            </div>
            Watch Our Story
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 right-8 hidden lg:flex items-center gap-3 bg-card/80 backdrop-blur-sm px-4 py-3 rounded-2xl ghost-border">
        <div className="flex -space-x-2">
          {["MC", "JL", "AR"].map((initials, i) => (
            <div
              key={initials}
              className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground ring-2 ring-card ${
                i === 0 ? "bg-primary" : i === 1 ? "bg-secondary" : "bg-tertiary"
              }`}
            >
              {initials}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-on-surface">50,000+ members</p>
          <p className="text-[10px] text-on-surface-variant">joined this year</p>
        </div>
      </div>
    </div>
  )
}

export default AboutHero
