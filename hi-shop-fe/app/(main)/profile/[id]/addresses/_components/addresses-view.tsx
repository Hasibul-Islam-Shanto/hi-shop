"use client"

import { useState, useTransition } from "react"
import { MapPin, Star, Trash2, Plus, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAddress, deleteAddress, setDefaultAddress } from "@/app/_actions/addressActions"

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

interface AddressesViewProps {
  initialAddresses: Address[]
}

const addressSchema = z.object({
  label: z.string().max(50).optional(),
  street: z.string().min(1, "Street is required").max(255),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
  isDefault: z.boolean().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

const INPUT_CLASS =
  "w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ghost-border transition-shadow"

const AddressCard = ({
  address,
  onDelete,
  onSetDefault,
}: {
  address: Address
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}) => {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAddress(address.id)
      if (result.success) {
        onDelete(address.id)
        toast.success("Address deleted.")
      } else {
        toast.error(result.error ?? "Failed to delete address.")
      }
    })
  }

  const handleSetDefault = () => {
    if (address.isDefault) return
    startTransition(async () => {
      const result = await setDefaultAddress(address.id)
      if (result.success) {
        onSetDefault(address.id)
        toast.success("Default address updated.")
      } else {
        toast.error(result.error ?? "Failed to update default address.")
      }
    })
  }

  return (
    <div
      className={`bg-card rounded-2xl p-5 ghost-border transition-shadow ${
        address.isDefault ? "ring-1 ring-primary/40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-on-surface">{address.label}</p>
              {address.isDefault && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-on-surface-variant">{address.street}</p>
            <p className="text-sm text-on-surface-variant">
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p className="text-sm text-on-surface-variant">{address.country}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {!address.isDefault && (
            <button
              onClick={handleSetDefault}
              disabled={isPending}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
            >
              <Star className="h-3.5 w-3.5" />
              Set default
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const AddAddressForm = ({
  onSuccess,
  onCancel,
}: {
  onSuccess: (address: Address) => void
  onCancel: () => void
}) => {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({ resolver: zodResolver(addressSchema) })

  const onSubmit = (data: AddressFormData) => {
    startTransition(async () => {
      const result = await createAddress(data)
      if (result.data) {
        onSuccess(result.data)
        reset()
        toast.success("Address added.")
      } else {
        toast.error(result.error ?? "Failed to add address.")
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card rounded-2xl p-5 ghost-border space-y-4"
    >
      <h3 className="text-sm font-bold text-on-surface">New Address</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="label-text text-[10px] mb-1.5 block">Label</Label>
          <Input {...register("label")} placeholder="Home" className={INPUT_CLASS} />
        </div>
        <div className="col-span-2">
          <Label className="label-text text-[10px] mb-1.5 block">Street *</Label>
          <Input {...register("street")} placeholder="123 Main St" className={INPUT_CLASS} />
          {errors.street && (
            <p className="text-xs text-destructive mt-1">{errors.street.message}</p>
          )}
        </div>
        <div>
          <Label className="label-text text-[10px] mb-1.5 block">City *</Label>
          <Input {...register("city")} placeholder="New York" className={INPUT_CLASS} />
          {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <Label className="label-text text-[10px] mb-1.5 block">State *</Label>
          <Input {...register("state")} placeholder="NY" className={INPUT_CLASS} />
          {errors.state && <p className="text-xs text-destructive mt-1">{errors.state.message}</p>}
        </div>
        <div>
          <Label className="label-text text-[10px] mb-1.5 block">Postal Code *</Label>
          <Input {...register("postalCode")} placeholder="10001" className={INPUT_CLASS} />
          {errors.postalCode && (
            <p className="text-xs text-destructive mt-1">{errors.postalCode.message}</p>
          )}
        </div>
        <div>
          <Label className="label-text text-[10px] mb-1.5 block">Country *</Label>
          <Input {...register("country")} placeholder="United States" className={INPUT_CLASS} />
          {errors.country && (
            <p className="text-xs text-destructive mt-1">{errors.country.message}</p>
          )}
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            {...register("isDefault")}
            className="accent-primary"
          />
          <Label htmlFor="isDefault" className="text-sm text-on-surface cursor-pointer">
            Set as default address
          </Label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} size="sm" className="gap-2">
          <Check className="h-4 w-4" />
          {isPending ? "Saving…" : "Save Address"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

const AddressesView = ({ initialAddresses }: AddressesViewProps) => {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
    router.refresh()
  }

  const handleNewAddress = (address: Address) => {
    setAddresses((prev) => {
      const updated = address.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev
      return [...updated, address]
    })
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !showForm ? (
        <div className="bg-card rounded-2xl p-8 ghost-border text-center">
          <MapPin className="h-8 w-8 text-on-surface-variant mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {showForm ? (
        <AddAddressForm onSuccess={handleNewAddress} onCancel={() => setShowForm(false)} />
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      )}
    </div>
  )
}

export default AddressesView
