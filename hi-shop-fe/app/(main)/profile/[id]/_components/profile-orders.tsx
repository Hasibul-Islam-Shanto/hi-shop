import { Package } from "lucide-react"
import Link from "next/link"

const STEPS = ["Placed", "Processing", "Shipped", "Delivered"]

const STATUS_STEP: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: 0,
  REFUNDED: 0,
}

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    productVariant: { size: string; color: string }
  }>
}

interface ProfileOrdersProps {
  orders: Order[]
  userId: string
}

const formatDate = (value: string): string => {
  const d = new Date(value)
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const ProfileOrders = ({ orders, userId }: ProfileOrdersProps) => {
  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.status),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-on-surface">Active Orders</h2>
        <Link
          href={`/profile/${userId}/orders`}
          className="text-xs font-semibold text-primary hover:underline underline-offset-4"
        >
          View All
        </Link>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 ghost-border text-center">
          <Package className="h-8 w-8 text-on-surface-variant mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">No active orders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => {
            const statusStep = STATUS_STEP[order.status] ?? 0
            const firstItem = order.items[0]
            const variantLabel = firstItem
              ? `${firstItem.productVariant.color} / ${firstItem.productVariant.size}`
              : "—"

            return (
              <div
                key={order.id}
                className="bg-card rounded-2xl p-5 ghost-border shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="h-14 w-14 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-on-surface-variant" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Package className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-[11px] font-bold text-primary">
                            Order #{order.id.slice(0, 8)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {variantLabel} · {formatDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-bold text-on-surface">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                        <span
                          className={`block text-[10px] font-semibold mt-0.5 ${
                            statusStep >= 2 ? "text-tertiary" : "text-primary"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mb-2.5">
                  <div className="h-1 bg-surface-container rounded-full">
                    <div
                      className="h-1 bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${((statusStep + 1) / STEPS.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="absolute -top-1 flex w-full justify-between">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-full border-2 transition-colors duration-300 -mt-px ${
                          i <= statusStep
                            ? "bg-primary border-primary"
                            : "bg-surface-container border-outline-variant"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  {STEPS.map((step, i) => (
                    <span
                      key={step}
                      className={`text-[10px] font-medium ${
                        i <= statusStep ? "text-primary font-semibold" : "text-on-surface-variant"
                      }`}
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProfileOrders
