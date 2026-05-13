import "@/app/globals.css"
import { Providers } from "@/components/providers"
import { SmoothScroll } from "@/components/smooth-scroll"
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/nav/navbar"
import Footer from "@/components/footer"
import { getUser } from "@/lib/auth.server"

export const metadata = {
  title: "hi-shop - Discover Your Perfect Style",
  description:
    "Shop the latest trends in electronics, fashion, home & living, and beauty. Free shipping on orders over $50.",
  keywords: [
    "ecommerce",
    "online shop",
    "fashion",
    "electronics",
    "HiShop",
    "Next.js",
    "TypeScript",
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sessionUser = await getUser()

  const user = sessionUser
    ? {
        id: sessionUser.id,
        firstName: sessionUser.firstName,
        lastName: sessionUser.lastName,
        email: sessionUser.email,
        role: sessionUser.role,
      }
    : null

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth dark">
      <body
        suppressHydrationWarning
        className="font-sans antialiased min-h-screen overflow-x-hidden"
      >
        <Providers user={user}>
          <Navbar />
          <Toaster />
          <SmoothScroll />
          {children}
        </Providers>
        <Footer />
      </body>
    </html>
  )
}
