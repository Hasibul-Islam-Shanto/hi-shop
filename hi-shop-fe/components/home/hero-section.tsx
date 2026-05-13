"use client"

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

const slides = [
  {
    src: "/hero_2.webp",
    label: "Footwear",
    title: "STEP INTO",
    accent: "ELEGANCE",
  },
  {
    src: "/hero_3.webp",
    label: "Bags",
    title: "CARRY YOUR",
    accent: "STORY",
  },
  {
    src: "/hero_1.webp",
    label: "Watches",
    title: "TIME MEETS",
    accent: "CRAFT",
  },
  {
    src: "/hero_4.webp",
    label: "Eyewear",
    title: "SEE THE",
    accent: "DIFFERENCE",
  },
]

const HeroSection = () => {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 600)
    },
    [isTransitioning],
  )

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])
  const prev = useCallback(
    () => goTo((current - 1 + slides.length) % slides.length),
    [current, goTo],
  )

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.label}
            fill
            className="object-cover object-center"
            priority={i === 0}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/65 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/20" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="relative z-10 container pt-28 pb-20">
        <div className="max-w-2xl">
          <span
            key={`label-${current}`}
            className="label-text text-primary mb-5 inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full"
          >
            {slides[current].label} — Spring 2026
          </span>

          <h1
            key={`title-${current}`}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[0.92] mb-5 text-on-surface tracking-tight"
          >
            {slides[current].title}
            <br />
            <span className="text-primary">{slides[current].accent}</span>
          </h1>

          <p className="text-base md:text-lg text-on-surface-variant max-w-md mb-8 leading-relaxed">
            Curation is an art form. Explore our latest drop of sculptural silhouettes and
            engineered textiles.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="h-12 px-8 ambient-glow" asChild>
              <Link href="/shop">
                Shop Now <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 bg-surface-container/50 hover:bg-surface-container-high/70 backdrop-blur-sm border-outline-variant/40"
              asChild
            >
              <Link href="/categories">View Collections</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-3">
        <span className="text-xs font-bold text-on-surface tabular-nums">
          {String(current + 1).padStart(2, "0")}
        </span>
        <div className="h-12 w-px bg-outline-variant/30" />
        <span className="text-xs text-on-surface-variant/50 tabular-nums">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="h-9 w-9 rounded-full bg-surface-container/60 backdrop-blur-md ghost-border flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/80 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="h-9 w-9 rounded-full bg-surface-container/60 backdrop-blur-md ghost-border flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/80 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-primary"
                : "w-1.5 bg-on-surface-variant/40 hover:bg-on-surface-variant/60"
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection
