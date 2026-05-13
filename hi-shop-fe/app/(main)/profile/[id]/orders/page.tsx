import Link from "next/link"
import { ChevronLeft, Package } from "lucide-react"
import { requireUser } from "@/lib/auth.server"
import { get } from "@/lib/methods"

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  productVariant: { size: string; color: string }
}

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

interface OrdersResponse {
  data: Order[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Active", value: "PENDING" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
]

const STATUS_BADGE_CLASS: Record<string, string> = {
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

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string; status?: string }>
}

export default async function OrderHistoryPage({ params, searchParams }: Props) {
  const { id } = await params
  const { page = "1", status = "" } = await searchParams

  const sessionUser = await requireUser()
  const currentPage = parseInt(page, 10) || 1

  let response: OrdersResponse | null = null
  try {
    const qs = new URLSearchParams({ page: String(currentPage), limit: "10" })
    if (status) qs.set("status", status)
    response = await get<OrdersResponse>(`/orders/my?${qs.toString()}`, {
      token: sessionUser.accessToken,
    })
  } catch {}

  const orders = response?.data ?? []
  const meta = response?.meta ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container max-w-3xl">
          <Link
            href={`/profile/${id}`}
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors mb-6"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Profile
          </Link>

          <h1 className="text-2xl font-bold text-on-surface mb-6">Order History</h1>

          <div className="flex gap-2 mb-6 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.value}
                href={`/profile/${id}/orders?status=${tab.value}&page=1`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  status === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {orders.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 ghost-border text-center">
              <Package className="h-10 w-10 text-on-surface-variant mx-auto mb-4" />
              <p className="text-sm text-on-surface-variant">No orders found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-2xl p-5 ghost-border shadow-(--shadow-sm) hover:shadow-(--shadow-md) transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-on-surface-variant" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-on-surface-variant">
                          {formatDate(order.createdAt)} · {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          STATUS_BADGE_CLASS[order.status] ?? ""
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-base font-bold text-on-surface">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs font-semibold text-primary hover:underline underline-offset-4 whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/profile/${id}/orders?status=${status}&page=${p}`}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors ${
                    p === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
