"use server"

import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { redirect } from "next/navigation"
import { sessionOptions, type SessionUser } from "@/lib/session"
import { envConfig } from "@/config/envs"

async function backendFetch<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${envConfig.apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = Array.isArray(err.message)
      ? err.message.join(", ")
      : (err.message ?? `HTTP ${res.status}`)
    throw new Error(msg)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function handleLogin(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await backendFetch<{
      accessToken: string
      refreshToken: string
      user: {
        id: string
        firstName: string
        lastName: string
        email: string
        role: string
      }
    }>("/auth/login", { email, password })

    const cookieStore = await cookies()
    const session = await getIronSession<{ user?: SessionUser }>(cookieStore, sessionOptions)
    session.user = {
      id: data.user.id,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      email: data.user.email,
      role: data.user.role as SessionUser["role"],
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }
    await session.save()
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Login failed.",
    }
  }
}

export async function handleSignup(data: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await backendFetch("/auth/register", data)
    return handleLogin(data.email, data.password)
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Registration failed.",
    }
  }
}

export async function handleLogout(): Promise<void> {
  const cookieStore = await cookies()
  const session = await getIronSession<{ user?: SessionUser }>(cookieStore, sessionOptions)
  if (session.user?.accessToken) {
    try {
      await backendFetch("/auth/logout", {}, session.user.accessToken)
    } catch {
      // proceed with local logout even if backend call fails
    }
  }
  session.destroy()
  redirect("/login")
}

export async function refreshSession(refreshToken: string): Promise<string | null> {
  try {
    const data = await backendFetch<{
      accessToken: string
      refreshToken: string
    }>("/auth/refresh", { refreshToken }, refreshToken)

    const cookieStore = await cookies()
    const session = await getIronSession<{ user?: SessionUser }>(cookieStore, sessionOptions)
    if (!session.user) return null

    session.user = {
      ...session.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }
    await session.save()
    return data.accessToken
  } catch {
    return null
  }
}
