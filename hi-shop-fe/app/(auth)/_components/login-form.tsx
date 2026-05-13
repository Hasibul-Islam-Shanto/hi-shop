"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { handleLogin } from "@/app/_actions/authActions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginValues) => {
    setFormError(null)
    startTransition(async () => {
      const response = await handleLogin(values.email, values.password)
      if (response.success) {
        router.push(searchParams.get("callbackUrl") ?? "/")
        router.refresh()
      } else {
        setFormError(response.error ?? "Sign in failed.")
      }
    })
  }

  return (
    <div className={cn("p-8 lg:p-10", className)} {...props}>
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-on-surface transition-colors">
          HOME
        </Link>
        <span>›</span>
        <span className="font-semibold text-on-surface">SIGN IN</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-on-surface mb-1">Welcome Back</h1>
      <p className="text-sm text-on-surface-variant mb-6">
        Enter your details to access your gallery.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">
            {formError}
          </p>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-on-surface mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ghost-border"
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-on-surface">
              Password
            </label>
            <a href="#" className="text-xs font-semibold text-primary hover:underline">
              Forgot?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              autoComplete="current-password"
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ghost-border"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="h-4 w-4 rounded bg-surface-container ghost-border shrink-0" />
          <span className="text-sm text-on-surface-variant">Stay signed in for 30 days</span>
        </label>

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
        </Button>

        <p className="text-sm text-center text-on-surface-variant">
          New here?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </form>
    </div>
  )
}
