import { requireUser } from "@/lib/auth.server"
import { get } from "@/lib/methods"
import CheckoutView from "./_components/checkout-view"

interface Address {
  id: string
  label: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export default async function CheckoutPage() {
  const sessionUser = await requireUser()

  let addresses: Address[] = []
  try {
    addresses = await get<Address[]>("/addresses", {
      token: sessionUser.accessToken,
    })
  } catch {}

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container">
          <span className="label-text text-primary mb-1 block">Almost There</span>
          <h1 className="text-3xl font-extrabold text-on-surface mb-1">Checkout</h1>
          <p className="text-sm text-on-surface-variant mb-8">
            Complete your order details below to confirm your purchase.
          </p>

          <CheckoutView initialAddresses={addresses} />
        </div>
      </div>
    </div>
  )
}
