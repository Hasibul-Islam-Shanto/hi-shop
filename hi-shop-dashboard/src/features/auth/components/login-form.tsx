import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import OAuthButtons from "./OAuthButtons";
import useSignin from "../hooks/useSignin";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "all",
  });
  const { signIn, isSigningIn, error } = useSignin();

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signIn(data.email, data.password);
    if (result.success) {
      navigate("/admin");
    }
  };

  return (
    <div
      className={cn("flex flex-col justify-center p-8 lg:p-10", className)}
      {...props}
    >
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-7">
        <Link
          to="/"
          className="hover:text-on-surface transition-colors tracking-widest uppercase"
        >
          Home
        </Link>
        <span className="text-outline-variant">›</span>
        <span className="font-semibold text-on-surface tracking-widest uppercase">
          Sign In
        </span>
      </nav>

      <h1 className="text-2xl font-extrabold text-on-surface mb-1 tracking-tight">
        Welcome Back
      </h1>
      <p className="text-sm text-on-surface-variant mb-7">
        Enter your details to access the dashboard.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
            <p className="text-xs text-destructive font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-on-surface"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
            className={cn(
              "w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface",
              "placeholder:text-on-surface-variant/40 focus:outline-none transition-all duration-200",
              "ghost-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
              errors.email &&
                "ring-2 ring-destructive/30 border-destructive/40",
            )}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-on-surface"
            >
              Password
            </label>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
              className={cn(
                "w-full bg-surface-container-low rounded-xl px-4 py-2.5 pr-11 text-sm text-on-surface",
                "placeholder:text-on-surface-variant/40 focus:outline-none transition-all duration-200",
                "ghost-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
                errors.password &&
                  "ring-2 ring-destructive/30 border-destructive/40",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
            Stay signed in for 30 days
          </span>
        </label>

        <Button
          type="submit"
          className="w-full"
          variant="hero"
          size="lg"
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="label-text text-[10px] px-1">or continue with</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        <OAuthButtons />
      </form>
    </div>
  );
}
