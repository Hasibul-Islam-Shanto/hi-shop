"use client"

import { AlertCircle, ArrowLeft, Home, RefreshCw, ServerOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"

type CategoriesFetchErrorProps = {
  message?: string
}

export default function CategoriesFetchError({ message }: CategoriesFetchErrorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div
      className="rounded-2xl border border-destructive/20 bg-destructive/6 dark:bg-destructive/12 p-8 md:p-10 text-center ghost-border"
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col items-center max-w-md mx-auto">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <ServerOff className="h-9 w-9 text-destructive" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-sm">
            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden />
          </div>
        </div>

        <h2 className="text-xl font-bold text-on-surface tracking-tight">
          We couldn&apos;t load categories
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
          Something went wrong while contacting our servers. Check your connection, or try again in
          a moment.
        </p>

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto sm:justify-center">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="shrink-0" aria-hidden />
              Back to home
            </Link>
          </Button>
          <Button variant="secondary" className="gap-2" asChild>
            <Link href="/shop">
              <Home className="shrink-0" aria-hidden />
              Browse products
            </Link>
          </Button>
          <Button
            className="gap-2 sm:min-w-34"
            disabled={isPending}
            onClick={() => startTransition(() => router.refresh())}
          >
            <RefreshCw className={`shrink-0 ${isPending ? "animate-spin" : ""}`} aria-hidden />
            {isPending ? "Retrying…" : "Try again"}
          </Button>
        </div>

        {message ? (
          <details className="mt-8 w-full text-left rounded-xl border border-border/60 bg-background/50 px-4 py-3">
            <summary className="cursor-pointer text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors select-none">
              Technical details
            </summary>
            <p className="mt-3 text-xs font-mono text-muted-foreground break-all whitespace-pre-wrap leading-relaxed border-t border-border/40 pt-3">
              {message}
            </p>
          </details>
        ) : null}
      </div>
    </div>
  )
}
