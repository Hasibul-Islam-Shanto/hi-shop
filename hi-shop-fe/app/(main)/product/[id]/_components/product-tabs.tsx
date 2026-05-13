import { Star, ThumbsUp } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user?: { firstName: string; lastName: string }
}

interface ProductTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  description: string
  specs: string[]
  reviews?: Review[]
}

const formatDate = (value: string): string => {
  const d = new Date(value)
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const ProductTabs = ({
  activeTab,
  onTabChange,
  description,
  specs,
  reviews = [],
}: ProductTabsProps) => {
  const TABS = [
    { key: "description", label: "Description" },
    { key: "details", label: "Details" },
    { key: "reviews", label: `Reviews (${reviews.length})` },
  ]

  return (
    <div className="mt-7">
      <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 ghost-border mb-5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 ${
              activeTab === key
                ? "bg-card text-on-surface shadow-(--shadow-sm)"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "description" && (
        <p className="text-on-surface-variant text-sm leading-relaxed">{description}</p>
      )}

      {activeTab === "details" && (
        <ul className="grid grid-cols-2 gap-2.5">
          {specs.map((spec) => (
            <li key={spec} className="flex items-center gap-2.5 text-sm text-on-surface-variant">
              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {spec}
            </li>
          ))}
        </ul>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No reviews yet.</p>
          ) : (
            reviews.map((review) => {
              const initials = review.user
                ? `${review.user.firstName[0]}${review.user.lastName[0]}`
                : "U"
              const author = review.user
                ? `${review.user.firstName} ${review.user.lastName[0]}.`
                : "Anonymous"
              return (
                <div
                  key={review.id}
                  className="bg-card rounded-xl p-4 ghost-border shadow-(--shadow-sm)"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{author}</p>
                        <p className="text-[11px] text-on-surface-variant">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "fill-tertiary text-tertiary"
                              : "text-surface-container-highest"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                    {review.comment}
                  </p>
                  <button className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
                    <ThumbsUp className="h-3 w-3" />
                    Helpful
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default ProductTabs
