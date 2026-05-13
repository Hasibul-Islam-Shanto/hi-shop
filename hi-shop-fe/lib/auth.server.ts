import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getIronSession } from "iron-session"
import { sessionOptions, type SessionUser } from "./session"

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<{ user?: SessionUser }>(cookieStore, sessionOptions)
}

export async function getUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session.user ?? null
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser()
  if (!user) redirect("/login")
  return user
}
