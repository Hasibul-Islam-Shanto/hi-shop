import { Check } from "lucide-react"
import Image from "next/image"

const PILLARS = [
  "Ruthlessly curated — only the best makes it in",
  "Every product verified for quality and authenticity",
  "Editorial approach to fashion discovery",
  "Designed around the way you actually shop",
]

const AboutMission = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
      <div>
        <span className="label-text text-primary mb-3 block">Our Mission</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-5 leading-tight">
          Quality Over Quantity.
          <br />
          Always.
        </h2>
        <p className="text-on-surface-variant leading-relaxed mb-4 text-sm">
          In a world of infinite options, we chose to do less — and do it better. Hi-Shop is a
          carefully edited space where every product earns its place through quality, design, and
          story.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">
          Our curation team reviews thousands of products to bring you only what&apos;s worth your
          attention. No noise. No compromise. Just the items that truly belong in your life.
        </p>
        <ul className="space-y-3">
          {PILLARS.map((pillar) => (
            <li key={pillar} className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-tertiary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-tertiary" />
              </div>
              <span className="text-sm text-on-surface-variant">{pillar}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden ghost-border card-premium">
          <Image
            src="/clothing.webp"
            alt="Curated fashion"
            fill
            className="object-cover"
            sizes="25vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="text-xs font-bold text-on-surface block">Editorial</span>
            <span className="text-[11px] text-on-surface-variant">Curation</span>
          </div>
        </div>

        <div className="space-y-3 pt-6">
          <div className="relative aspect-square rounded-2xl overflow-hidden ghost-border card-premium">
            <Image
              src="/watch.webp"
              alt="Premium watches"
              fill
              className="object-cover"
              sizes="20vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="text-xs font-bold text-on-surface block">Precision</span>
              <span className="text-[11px] text-on-surface-variant">Craft</span>
            </div>
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden ghost-border card-premium">
            <Image src="/bags.webp" alt="Premium bags" fill className="object-cover" sizes="20vw" />
            <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="text-xs font-bold text-on-surface block">Heritage</span>
              <span className="text-[11px] text-on-surface-variant">Leather</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutMission
