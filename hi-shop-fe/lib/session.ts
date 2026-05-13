import type { IronSessionData } from "iron-session"

export interface SessionUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "CUSTOMER" | "ADMIN"
  accessToken: string
  refreshToken: string
}

declare module "iron-session" {
  interface IronSessionData {
    user?: SessionUser
  }
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "hi-shop-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax" as const,
  },
}
