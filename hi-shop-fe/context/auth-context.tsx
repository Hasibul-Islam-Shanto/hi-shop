"use client"

import { createContext, useContext } from "react"

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "CUSTOMER" | "ADMIN"
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
})

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser | null
  children: React.ReactNode
}) {
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
