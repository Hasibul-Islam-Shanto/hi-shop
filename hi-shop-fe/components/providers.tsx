"use client"

import { ThemeProvider } from "./theme-provider"
import { AuthProvider, type AuthUser } from "@/context/auth-context"

export function Providers({
  user,
  children,
}: {
  user: AuthUser | null
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
      enableColorScheme
    >
      <AuthProvider user={user}>{children}</AuthProvider>
    </ThemeProvider>
  )
}
