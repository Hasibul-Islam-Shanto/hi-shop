import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { jwtDecode } from "jwt-decode"
import { sessionOptions, type SessionUser } from "@/lib/session"

const PROTECTED_ROUTES = ["/profile", "/checkout", "/orders"]
const AUTH_ROUTES = ["/login", "/signup"]

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token)
    return Date.now() / 1000 > exp - 30
  } catch {
    return true
  }
}

async function tryRefreshToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const res = NextResponse.next()

  const session = await getIronSession<{ user?: SessionUser }>(req, res, sessionOptions)
  const user = session.user
  const isAuthenticated = !!user

  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (!isAuthenticated && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && user.accessToken && isTokenExpired(user.accessToken)) {
    const refreshed = await tryRefreshToken(user.refreshToken)
    if (!refreshed) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      const redirectRes = NextResponse.redirect(loginUrl)
      const destroySession = await getIronSession<{ user?: SessionUser }>(
        req,
        redirectRes,
        sessionOptions,
      )
      destroySession.destroy()
      return redirectRes
    }

    session.user = {
      ...user,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
    }
    await session.save()
  }

  return res
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
