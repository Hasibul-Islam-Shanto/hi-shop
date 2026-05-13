import Image from "next/image"

const VALUES = [
  {
    title: "Authenticity",
    desc: "Every item is verified genuine. Zero counterfeits, no exceptions — ever.",
    image: "/watch.webp",
    tag: "100% Verified",
  },
  {
    title: "Curation",
    desc: "Less, but better. Our team edits ruthlessly so you only see what truly deserves your attention.",
    image: "/clothing.webp",
    tag: "Editorial Pick",
  },
  {
    title: "Sustainability",
    desc: "We actively partner with brands committed to responsible sourcing and ethical practices.",
    image: "/t-shirt.webp",
    tag: "Responsible",
  },
]

const AboutValues = () => {
  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <span className="label-text text-primary mb-3 block">What We Stand For</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-3">
          Our Core Values
        </h2>
        <p className="text-on-surface-variant max-w-lg mx-auto text-sm leading-relaxed">
          Three principles that drive every decision we make — from the products we list to the
          partnerships we form.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VALUES.map((v, i) => (
          <div
            key={v.title}
            className={`group relative rounded-2xl overflow-hidden ghost-border card-premium ${
              i === 1 ? "md:mt-6" : ""
            }`}
            style={{ aspectRatio: "3/4" }}
          >
            <Image
              src={v.image}
              alt={v.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/40 to-transparent" />

            <div className="absolute top-4 left-4">
              <span className="label-text text-primary-foreground bg-primary text-[10px] px-3 py-1 rounded-full">
                {v.tag}
              </span>
            </div>

            <div className="absolute bottom-6 left-5 right-5">
              <h3 className="text-xl font-extrabold text-on-surface mb-2">{v.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AboutValues
