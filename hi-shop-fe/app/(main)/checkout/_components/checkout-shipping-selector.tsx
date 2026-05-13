"use client"

import { useState, useTransition } from "react"
import { MapPin, Plus, Check } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAddress } from "@/app/_actions/addressActions"

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

interface CheckoutShippingSelectorProps {
  initialAddresses: Address[]
  selectedId: string | null
  onSelect: (id: string) => void
  onContinue: () => void
}

const addressSchema = z.object({
  label: z.string().max(50).optional(),
  street: z.string().min(1, "Required").max(255),
  city: z.string().min(1, "Required").max(100),
  state: z.string().min(1, "Required").max(100),
  postalCode: z.string().min(1, "Required").max(20),
  country: z.string().min(1, "Required").max(100),
  isDefault: z.boolean().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

const INPUT_CLASS =
  "w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ghost-border transition-shadow"

export default function CheckoutShippingSelector({
  initialAddresses,
  selectedId,
  onSelect,
  onContinue,
}: CheckoutShippingSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({ resolver: zodResolver(addressSchema) })

  const onAddAddress = (data: AddressFormData) => {
    startTransition(async () => {
      const result = await createAddress(data)
      if (result.data) {
        const newAddr = result.data
        setAddresses((prev) => {
          const updated = newAddr.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev
          return [...updated, newAddr]
        })
        onSelect(newAddr.id)
        reset()
        setShowForm(false)
        toast.success("Address added.")
      } else {
        toast.error(result.error ?? "Failed to add address.")
      }
    })
  }

  return (
    <div className="bg-card rounded-2xl p-6 ghost-border shadow-(--shadow-sm)">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
          1
        </div>
        <div>
          <h2 className="text-lg font-bold text-on-surface leading-tight">Shipping Address</h2>
          <p className="text-xs text-on-surface-variant">Select or add a delivery address</p>
        </div>
        <div className="ml-auto h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {addresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelect(addr.id)}
            className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl ghost-border transition-all duration-200 ${
              selectedId === addr.id
                ? "bg-primary/8 ring-1 ring-primary/30"
                : "bg-surface-container-low hover:bg-surface-container"
            }`}
          >
            <div
              className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                selectedId === addr.id ? "border-primary" : "border-outline-variant"
              }`}
            >
              {selectedId === addr.id && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-on-surface">{addr.label}</span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">{addr.street}</p>
              <p className="text-xs text-on-surface-variant">
                {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
              </p>
            </div>
          </button>
        ))}

        {addresses.length === 0 && !showForm && (
          <p className="text-sm text-on-surface-variant text-center py-4">
            No saved addresses. Add one below.
          </p>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit(onAddAddress)} className="space-y-3 mb-4">
          <div className="h-px bg-border/40" />
          <p className="text-sm font-semibold text-on-surface">New Address</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="label-text text-[10px] mb-1 block">Label</Label>
              <Input {...register("label")} placeholder="Home" className={INPUT_CLASS} />
            </div>
            <div className="col-span-2">
              <Label className="label-text text-[10px] mb-1 block">Street *</Label>
              <Input {...register("street")} placeholder="123 Main St" className={INPUT_CLASS} />
              {errors.street && (
                <p className="text-xs text-destructive mt-1">{errors.street.message}</p>
              )}
            </div>
            <div>
              <Label className="label-text text-[10px] mb-1 block">City *</Label>
              <Input {...register("city")} placeholder="New York" className={INPUT_CLASS} />
              {errors.city && (
                <p className="text-xs text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label className="label-text text-[10px] mb-1 block">State *</Label>
              <Input {...register("state")} placeholder="NY" className={INPUT_CLASS} />
              {errors.state && (
                <p className="text-xs text-destructive mt-1">{errors.state.message}</p>
              )}
            </div>
            <div>
              <Label className="label-text text-[10px] mb-1 block">Postal Code *</Label>
              <Input {...register("postalCode")} placeholder="10001" className={INPUT_CLASS} />
              {errors.postalCode && (
                <p className="text-xs text-destructive mt-1">{errors.postalCode.message}</p>
              )}
            </div>
            <div>
              <Label className="label-text text-[10px] mb-1 block">Country *</Label>
              <Input {...register("country")} placeholder="United States" className={INPUT_CLASS} />
              {errors.country && (
                <p className="text-xs text-destructive mt-1">{errors.country.message}</p>
              )}
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="chk-default"
                {...register("isDefault")}
                className="accent-primary"
              />
              <Label htmlFor="chk-default" className="text-sm text-on-surface cursor-pointer">
                Set as default
              </Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} size="sm" className="gap-1">
              <Check className="h-3.5 w-3.5" />
              {isPending ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false)
                reset()
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline underline-offset-4 mb-4"
        >
          <Plus className="h-4 w-4" />
          Add new address
        </button>
      )}

      <div className="h-px bg-border/40 mb-4" />

      <Button onClick={onContinue} disabled={!selectedId} className="w-full">
        Continue to Review
      </Button>
    </div>
  )
}
