"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth.server"
import { get, post, patch, del } from "@/lib/methods"

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

interface AddressInput {
  label?: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
}

export async function getAddresses(): Promise<Address[]> {
  const user = await requireUser()
  return get<Address[]>("/addresses", { token: user.accessToken })
}

export async function createAddress(
  data: AddressInput,
): Promise<{ data?: Address; error?: string }> {
  try {
    const user = await requireUser()
    const address = await post<Address>("/addresses", data, {
      token: user.accessToken,
    })
    revalidatePath("/checkout")
    return { data: address }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to add address.",
    }
  }
}

export async function deleteAddress(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()
    await del(`/addresses/${id}`, { token: user.accessToken })
    revalidatePath("/profile")
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete address.",
    }
  }
}

export async function setDefaultAddress(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()
    await patch(`/addresses/${id}/default`, undefined, {
      token: user.accessToken,
    })
    revalidatePath("/profile")
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update default address.",
    }
  }
}
