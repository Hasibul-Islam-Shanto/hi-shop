import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, MapPin, Package } from "lucide-react"
import { requireUser } from "@/lib/auth.server"
import { get } from "@/lib/methods"
import CancelOrderButton from "./_components/cancel-order-button"

interface OrderItem {
  id: string
  productVariantId: string
  quantity: number
  unitPrice: number
  subtotal: number
  productVariant: { id: string; sku: string; size: string; color: string }
}

interface OrderStatusLog {
  id: string
  status: string
  note: string | null
  createdAt: string
}

interface Address {
  id: string
  label: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface Order {
  id: string
  status: string
  totalAmount: number
  notes: string | null
  createdAt: string
  items: OrderItem[]
  shippingAddress: Address
  statusLogs: OrderStatusLog[]
  discount: { id: string; code: string } | null
}

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
}
const CANCELLABLE = new Set(["PENDING", "CONFIRMED", "PROCESSING"])

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-600",
  CONFIRMED: "bg-blue-500/10 text-blue-600",
  PROCESSING: "bg-blue-500/10 text-blue-600",
  SHIPPED: "bg-primary/10 text-primary",
  DELIVERED: "bg-green-500/10 text-green-600",
  CANCELLED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-surface-container text-on-surface-variant",
}

const formatDate = (value: string) => {
  const d = new Date(value)
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
}

type Props = { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const sessionUser = await requireUser()

  let order: Order
  try {
    order = await get<Order>(`/orders/my/${id}`, {
      token: sessionUser.accessToken,
    })
  } catch {
    redirect("/profile")
  }

  const activeStep = STATUS_STEPS.indexOf(order.status)
  const isCancellable = CANCELLABLE.has(order.status)

  const subtotal = order.items.reduce((s, i) => s + Number(i.subtotal), 0)
  const tax = Math.round(subtotal * 0.08)

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container max-w-3xl space-y-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Profile
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-on-surface mb-1">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-sm text-on-surface-variant">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  STATUS_BADGE[order.status] ?? ""
                }`}
              >
                {order.status}
              </span>
              {isCancellable && <CancelOrderButton orderId={order.id} />}
            </div>
          </div>

          {!["CANCELLED", "REFUNDED"].includes(order.status) && (
            <div className="bg-card rounded-2xl p-6 ghost-border">
              <h2 className="text-sm font-bold text-on-surface mb-5">Order Progress</h2>
              <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-surface-container" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
                  style={{
                    width:
                      activeStep >= 0
                        ? `${(activeStep / (STATUS_STEPS.length - 1)) * (100 - 8)}%`
                        : "0%",
                  }}
                />
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                          i <= activeStep
                            ? "bg-primary border-primary"
                            : "bg-surface-container border-outline-variant"
                        }`}
                      >
                        <Package
                          className={`h-3.5 w-3.5 ${
                            i <= activeStep ? "text-primary-foreground" : "text-on-surface-variant"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-semibold whitespace-nowrap ${
                          i <= activeStep ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl p-6 ghost-border">
            <h2 className="text-sm font-bold text-on-surface mb-4">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3 border-b border-border/30 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {item.productVariant.color} / {item.productVariant.size}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      SKU: {item.productVariant.sku} · Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-on-surface-variant">
                      ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-on-surface">
                      ${Number(item.subtotal).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-5 ghost-border">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-on-surface">Shipping Address</h2>
              </div>
              <p className="text-sm font-semibold text-on-surface">{order.shippingAddress.label}</p>
              <p className="text-sm text-on-surface-variant">{order.shippingAddress.street}</p>
              <p className="text-sm text-on-surface-variant">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-sm text-on-surface-variant">{order.shippingAddress.country}</p>
            </div>

            <div className="bg-card rounded-2xl p-5 ghost-border">
              <h2 className="text-sm font-bold text-on-surface mb-3">Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="text-on-surface">${subtotal.toFixed(2)}</span>
                </div>
                {order.discount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">
                      Discount ({order.discount.code})
                    </span>
                    <span className="text-tertiary">Applied</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Tax (8%)</span>
                  <span className="text-on-surface">${tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border/40 my-1" />
                <div className="flex justify-between">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="text-lg font-extrabold text-primary">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-card rounded-2xl p-5 ghost-border">
              <h2 className="text-sm font-bold text-on-surface mb-2">Notes</h2>
              <p className="text-sm text-on-surface-variant">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
