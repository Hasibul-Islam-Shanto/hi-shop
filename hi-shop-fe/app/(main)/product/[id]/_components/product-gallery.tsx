import Image from "next/image"

interface ProductGalleryProps {
  images: string[]
  name: string
  tag: string | null
  selectedImage: number
  onSelectImage: (i: number) => void
}

const ProductGallery = ({
  images,
  name,
  tag,
  selectedImage,
  onSelectImage,
}: ProductGalleryProps) => {
  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden bg-surface-container-low aspect-square shadow-[var(--shadow-md)] ghost-border">
        {tag && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
              {tag}
            </span>
          </div>
        )}
        <Image
          src={images[selectedImage]}
          alt={name}
          fill
          className="object-cover transition-opacity duration-300"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      <div className="flex gap-2 mt-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onSelectImage(i)}
            className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 shrink-0 ${
              selectedImage === i
                ? "ring-2 ring-primary shadow-[0_0_10px_hsl(var(--primary)/0.25)]"
                : "ghost-border opacity-60 hover:opacity-100"
            }`}
          >
            <Image src={img} alt="" fill className="object-cover" sizes="64px" />
          </button>
        ))}
        <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center ghost-border text-sm font-medium text-on-surface-variant shrink-0">
          +3
        </div>
      </div>
    </div>
  )
}

export default ProductGallery
