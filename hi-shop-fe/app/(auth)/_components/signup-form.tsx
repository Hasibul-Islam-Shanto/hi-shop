"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { handleSignup } from "@/app/_actions/authActions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Must contain uppercase, lowercase, and a number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type SignupValues = z.infer<typeof signupSchema>

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: SignupValues) => {
    setFormError(null)
    startTransition(async () => {
      const response = await handleSignup({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      })
      if (response.success) {
        router.push("/")
        router.refresh()
      } else {
        setFormError(response.error ?? "Registration failed.")
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
        <span className="font-semibold text-on-surface">CREATE ACCOUNT</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-on-surface mb-1">Join the Gallery</h1>
      <p className="text-sm text-on-surface-variant mb-6">
        Fill in your details to create your free account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">
            {formError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-semibold text-on-surface mb-1.5"
            >
              First Name
            </label>
            <input
              id="firstName"
              placeholder="John"
              autoComplete="given-name"
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ghost-border"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-semibold text-on-surface mb-1.5"
            >
              Last Name
            </label>
            <input
              id="lastName"
              placeholder="Doe"
              autoComplete="family-name"
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ghost-border"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-on-surface mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-on-surface mb-1.5"
            >
              Confirm
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ghost-border"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-on-surface-variant">
          Must be at least 8 characters with uppercase, lowercase, and a number.
        </p>

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? <Loader2 size={16} className="animate-spin" /> : "Create Account"}
        </Button>

        <p className="text-sm text-center text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  )
}
