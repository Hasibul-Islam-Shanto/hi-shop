import { AuthNavbar } from "./_components/auth-navbar"

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 flex items-center justify-center">
        {children}
      </main>
    </div>
  )
}
