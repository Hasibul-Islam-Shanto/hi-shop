import { Quote, Star } from "lucide-react"

const REVIEWS = [
  {
    text: "The interface is as beautiful as the products. The shipping was seamless and the packaging felt incredibly premium.",
    name: "Alex Chen",
    role: "Architect",
    rating: 5,
  },
  {
    text: "Finally a shop that understands curation over quantity. Every piece I've ordered has become a staple in my studio.",
    name: "Sarah J.",
    role: "Design Director",
    rating: 5,
  },
  {
    text: "The Kinetic Gallery concept really shines through the product quality. These aren't just clothes, they're art.",
    name: "Marc Rivera",
    role: "Photographer",
    rating: 5,
  },
]

const TestimonialSection = () => {
  return (
    <section className="py-20 bg-surface-container-low">
      <div className="container">
        <div className="text-center mb-12">
          <span className="label-text text-primary mb-3 block">Testimonials</span>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">
            What our customers say
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            Voices from our global editorial collective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="relative rounded-2xl bg-card p-6 text-left card-premium ghost-border flex flex-col"
            >
              <Quote className="h-6 w-6 text-primary/30 mb-4 shrink-0" />

              <p className="text-on-surface-variant leading-relaxed text-sm flex-1 mb-6">
                {review.text}
              </p>

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-tertiary text-tertiary" />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 ghost-border flex items-center justify-center text-primary text-sm font-bold shrink-0">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{review.name}</p>
                  <p className="text-xs text-on-surface-variant">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection
