import { get } from "@/lib/methods"
import { requireUser } from "@/lib/auth.server"
import ProfileBanner from "./_components/profile-banner"
import ProfileStats from "./_components/profile-stats"
import ProfileOrders from "./_components/profile-orders"
import ProfileAccountSidebar from "./_components/profile-account-sidebar"
import ProfileWishlist from "./_components/profile-wishlist"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt: string
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

interface OrdersResponse {
  data: Order[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export default async function ProfilePage() {
  const sessionUser = await requireUser()
  const token = sessionUser.accessToken

  let user: User | null = null
  try {
    user = await get<User>("/users/me", { token })
  } catch {}

  let ordersResponse: OrdersResponse | null = null
  try {
    ordersResponse = await get<OrdersResponse>("/orders/my?limit=10", {
      token,
    })
  } catch {}

  const displayUser = user ?? {
    id: sessionUser.id,
    firstName: sessionUser.firstName,
    lastName: sessionUser.lastName,
    email: sessionUser.email,
    role: sessionUser.role,
    createdAt: new Date().toISOString(),
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container">
          <ProfileBanner user={displayUser} />
          <ProfileStats
            orderCount={ordersResponse?.meta.total ?? 0}
            memberSince={new Date(displayUser.createdAt).getFullYear().toString()}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProfileOrders orders={ordersResponse?.data ?? []} userId={displayUser.id} />
            </div>
            <div className="lg:col-span-1">
              <ProfileAccountSidebar user={displayUser} />
            </div>
          </div>

          <ProfileWishlist />
        </div>
      </div>
    </div>
  )
}
