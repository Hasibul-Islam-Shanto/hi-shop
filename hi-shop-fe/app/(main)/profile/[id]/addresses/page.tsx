import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { requireUser } from "@/lib/auth.server"
import { get } from "@/lib/methods"
import AddressesView from "./_components/addresses-view"

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

type Props = { params: Promise<{ id: string }> }

export default async function AddressesPage({ params }: Props) {
  const { id } = await params
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
        <div className="container max-w-2xl">
          <Link
            href={`/profile/${id}`}
            className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors mb-6"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Profile
          </Link>

          <h1 className="text-2xl font-bold text-on-surface mb-6">My Addresses</h1>

          <AddressesView initialAddresses={addresses} />
        </div>
      </div>
    </div>
  )
}
