# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # TypeScript check (tsc --noEmit)
```

No test runner is configured. Type checking and linting are the primary correctness tools.

## Architecture

**hi-shop-fe** is a Next.js 16 App Router e-commerce frontend using TypeScript, Tailwind CSS v4, shadcn/ui (Radix), and iron-session for authentication.

### Routing

Route groups separate concerns:
- `app/(auth)/` — login, sign-up with isolated layout
- `app/(main)/` — product, categories, cart, checkout, orders, profile
- `app/_actions/` — server actions (`authActions`, `userActions`, `addressActions`, `orderActions`)
- `app/api/auth/me/` — GET endpoint returning the current user (no tokens)

Protected routes (`/profile`, `/checkout`, `/orders`) are enforced by [middleware.ts](middleware.ts), which also silently refreshes expired access tokens using the stored refresh token.

### Data Fetching

All API calls go through [lib/fetcher.ts](lib/fetcher.ts) → [lib/methods.ts](lib/methods.ts). The `apiFetch<T>()` function attaches the JWT, handles errors, and supports Next.js cache/revalidate options.

Server Components call `get<T>()`, `post<T>()`, etc. directly. Client Components must go through server actions — never call `lib/methods` from client code with a token.

Base URL is validated at startup via Zod in [config/envs.ts](config/envs.ts) — add new env vars there (including `SESSION_SECRET`).

### Authentication

**iron-session** with an httpOnly encrypted cookie (`hi-shop-session`). The session stores `{ user: SessionUser }` where `SessionUser` includes `accessToken` and `refreshToken`.

- Session types and cookie config: [lib/session.ts](lib/session.ts)
- Server-side helpers (`getUser`, `requireUser`): [lib/auth.server.ts](lib/auth.server.ts) — import only in server components and server actions
- Client auth state (no tokens): [context/auth-context.tsx](context/auth-context.tsx) — seeded by the root layout via `getUser()`, consumed via `useAuth()`
- Token refresh: [middleware.ts](middleware.ts) — detects expired access tokens 30s early, refreshes silently; on failure, destroys session and redirects to `/login`
- **Never expose `accessToken` or `refreshToken` to client components** — they are server-only

Pattern for protected server components:
```ts
const user = await requireUser(); // auto-redirects to /login
const data = await get<T>("/endpoint", { token: user.accessToken });
```

Pattern for protected server actions (mutations from client components):
```ts
"use server";
const user = await requireUser();
await patch("/endpoint", data, { token: user.accessToken });
```

### State Management

- **Cart** — Zustand store at [lib/store/cart.ts](lib/store/cart.ts), persisted to localStorage under key `hi-shop-cart`. No provider needed; use the hook directly.
- **Auth (client)** — `useAuth()` from [context/auth-context.tsx](context/auth-context.tsx). Exposes `{ user, isAuthenticated }`. No tokens.
- **Theme** — `next-themes` via [components/theme-provider.tsx](components/theme-provider.tsx).

### UI Patterns

- Components come from shadcn/ui in [components/ui/](components/ui/). Add new ones with `npx shadcn@latest add <component>`.
- Forms use React Hook Form + Zod validation.
- Page-level loading states use Suspense + skeleton components. Error states use dedicated error boundary components (e.g., `CategoriesFetchError`).
- Icons: Lucide React, HugeIcons (`@hugeicons/react`), Tabler Icons.
- Toasts: Sonner via `<Toaster />` in root layout.

### Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json` and `next.config.ts`).
