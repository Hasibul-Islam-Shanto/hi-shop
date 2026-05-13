"use server"

import { requireUser } from "@/lib/auth.server"
import { post, del } from "@/lib/methods"

interface OrderItem {
  productVariantId: string
  quantity: number
}

interface PlaceOrderInput {
  shippingAddressId: string
  items: OrderItem[]
  discountCode?: string
}

export async function placeOrder(
  data: PlaceOrderInput,
): Promise<{ orderId?: string; error?: string }> {
  try {
    const user = await requireUser()
    const order = await post<{ id: string }>("/orders", data, {
      token: user.accessToken,
    })
    return { orderId: order.id }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to place order.",
    }
  }
}

export async function cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()
    await del(`/orders/my/${orderId}/cancel`, { token: user.accessToken })
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to cancel order.",
    }
  }
}
