"use server"

import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth.server"
import { patch } from "@/lib/methods"

export async function updateProfile(data: {
  firstName: string
  lastName: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()
    await patch("/users/me", data, { token: user.accessToken })
    revalidatePath(`/profile/${user.id}`)
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update.",
    }
  }
}
