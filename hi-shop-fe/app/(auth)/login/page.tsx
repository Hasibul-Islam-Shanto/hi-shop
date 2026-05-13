import Image from "next/image"
import { Suspense } from "react"

import { LoginForm } from "../_components/login-form"

export default function LoginPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 w-full max-w-5xl rounded-2xl overflow-hidden ghost-border shadow-(--shadow-xl) bg-card">
      <div className="relative hidden lg:block min-h-[580px]">
        <Image
          src="/auth-image.webp"
          alt="Editorial"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/30 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <h2 className="text-3xl font-extrabold text-on-surface mb-2 leading-tight">
            Welcome Back
            <br />
            to your account.
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Enter your details to access your gallery.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex -space-x-2">
              {["A", "B", "C"].map((l) => (
                <div
                  key={l}
                  className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground ring-2 ring-background"
                >
                  {l}
                </div>
              ))}
            </div>
            <span className="text-xs text-on-surface-variant ml-2">
              10k+ collectors joined this month.
            </span>
          </div>
        </div>
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
