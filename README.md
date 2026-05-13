# Hi-Shop 🛍️

> A full-stack, production-ready e-commerce platform built with NestJS, Next.js, and React — featuring a customer storefront, a dedicated admin dashboard, and a RESTful API backend.

[![Backend](https://img.shields.io/badge/Backend-NestJS%2011-E0234E?logo=nestjs)](https://github.com/Hasibul-Islam-Shanto/hi-shop-be)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-000000?logo=next.js)](https://github.com/Hasibul-Islam-Shanto/hi-shop-fe)
[![Dashboard](https://img.shields.io/badge/Dashboard-Vite%20%2B%20React%2019-646CFF?logo=vite)](https://github.com/Hasibul-Islam-Shanto/hi-shop-dashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Repositories](#repositories)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Folder Structure](#folder-structure)
- [Installation & Local Development](#installation--local-development)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Security Practices](#security-practices)
- [Performance Optimization](#performance-optimization)
- [Deployment Guide](#deployment-guide)
- [Screenshots](#screenshots)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Hi-Shop is a full-featured e-commerce application solving the end-to-end shopping experience problem — from product discovery and cart management to order checkout and fulfilment tracking. It is split across three purpose-built applications that communicate through a versioned REST API.

| Audience | Value |
|---|---|
| Shoppers | Browse products, manage a cart, place orders, track deliveries, write reviews |
| Administrators | Manage inventory, categories, orders, users, discounts, and reviews from a dedicated panel |
| Developers | Clean, modular monorepo structure with strict typing, validation, and CI pipelines |

---

## Repositories

| Repository | Description | Link |
|---|---|---|
| `hi-shop-be` | NestJS REST API — the single source of truth for all business logic | [View →](https://github.com/Hasibul-Islam-Shanto/hi-shop-be) |
| `hi-shop-fe` | Next.js 16 App Router customer storefront | [View →](https://github.com/Hasibul-Islam-Shanto/hi-shop-fe) |
| `hi-shop-dashboard` | Vite + React 19 admin dashboard | [View →](https://github.com/Hasibul-Islam-Shanto/hi-shop-dashboard) |

---

## Tech Stack

### Backend (`hi-shop-be`)

| Category | Technology |
|---|---|
| Framework | NestJS 11 |
| Runtime | Node.js 22 |
| Language | TypeScript |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens via HTTP-only cookies) |
| Validation | class-validator + class-transformer |
| API Docs | Swagger / OpenAPI (`@nestjs/swagger`) |
| Mail | Nodemailer |
| Rate Limiting | `@nestjs/throttler` |
| Scheduling | `@nestjs/schedule` |
| Testing | Jest (unit) + Jest E2E |
| CI | GitHub Actions |

### Frontend (`hi-shop-fe`)

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| React | React 19 |
| Auth | iron-session (HTTP-only cookie sessions) |
| State Management | Zustand (cart, persisted to localStorage) |
| Styling | Tailwind CSS v4 + shadcn-style UI (Radix primitives) |
| Theming | next-themes (dark mode default) |
| Forms | react-hook-form + Zod |
| HTTP | Native fetch via custom `apiFetch` wrapper |
| CI | GitHub Actions + Husky + commitlint |

### Admin Dashboard (`hi-shop-dashboard`)

| Category | Technology |
|---|---|
| Bundler | Vite 6 |
| Framework | React 19 + React Router v7 |
| Language | TypeScript |
| Auth | Zustand + cookie storage (access/refresh tokens) |
| State Management | Zustand (persisted) |
| HTTP | Axios with request/response interceptors |
| Styling | Tailwind CSS v4 + shadcn-style UI (Radix + lucide-react) |
| Charts | Recharts |
| Forms | react-hook-form + Zod |
| Toasts | Sonner |

### Shared Infrastructure

| Category | Technology |
|---|---|
| Database | PostgreSQL (multi-schema Prisma setup) |
| Authentication | JWT — dual-token strategy (20 min access / 7 day refresh) |
| API Contract | REST, URI-versioned (`/api/v1/...`) |
| Package Manager | Yarn (BE + FE) / npm (Dashboard) |

---

## Key Features

### User Features

- Browse product catalogue with filtering, sorting, and pagination
- Category-based product discovery
- Product detail pages with image gallery, variant selection (size/color), and customer reviews
- Persistent shopping cart (survives page refresh via localStorage)
- User registration, login, and forgot-password/reset-password via email
- Checkout flow with saved address selection and discount code application
- Order placement with idempotency key protection (no duplicate orders on retry)
- Order history and per-order detail view with live status tracking
- Address book management (CRUD, default address)
- Profile management

### Admin Features

- Dashboard KPIs: total revenue, orders, customers, products; orders by status; recent orders table
- Inventory management: create/edit/delete products with variants (SKU, size, colour, stock, price modifier) and images
- Category management: hierarchical categories (parent/child), CRUD via modal
- Order management: status transitions, shipping information (label, courier, tracking number), status history logs
- User management: view all users, change role (CUSTOMER ↔ ADMIN), suspend/reactivate accounts
- Review moderation: per-product review visibility toggle
- Discount code management: percentage or fixed-amount codes, expiry, usage limits, deactivation
- Analytics page: KPI cards + revenue bar chart (Recharts)

### Security Features

- JWT dual-token strategy: short-lived access tokens (20 min) + long-lived refresh tokens (7 days)
- Tokens stored in HTTP-only cookies (storefront) and browser cookies (dashboard) — not in localStorage
- Automatic silent token refresh in both frontends before protected API calls
- Role-based access control: `CUSTOMER` and `ADMIN` roles enforced at the route level via `RolesGuard`
- Global `JwtAuthGuard` applied by default; routes opt-out via `@Public()` decorator
- Password hashing with `bcryptjs`
- Input whitelist validation (`ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`)
- Global exception filter with structured error responses
- Rate limiting on all routes via `@nestjs/throttler`
- CORS restricted to configured frontend and dashboard origins
- Audit log model capturing actor, action, target, IP address, and request ID for every sensitive mutation
- User suspension support (soft-suspend with `suspendedAt` timestamp)

### Performance Features

- Next.js App Router with React Server Components for the storefront
- Tailwind CSS v4 with JIT compilation — zero unused CSS in production
- Vite manual chunk splitting (react, router, charts, ui, forms) for optimised dashboard bundles
- Prisma 7 with `@prisma/adapter-pg` (native PostgreSQL driver, no N+1 via Prisma relations)
- `DecimalTransformInterceptor` serialises `Prisma.Decimal` without JSON loss
- Request ID middleware for distributed tracing across services
- Memoised token refresh calls in the dashboard (using `mem`) to prevent parallel refresh storms

### Developer Experience

- Full TypeScript across all three applications
- Prisma multi-file schema (`/prisma/schema/`) for clean domain separation
- Swagger UI auto-generated at `/api-docs`
- Husky pre-commit hooks + commitlint (conventional commits) on the storefront
- GitHub Actions CI on both backend and frontend (lint, generate, test, build)
- ESLint flat config + Prettier in all projects
- Path aliases (`@/` → `src/`) in all three projects
- `@Public()` decorator pattern to opt out of global JWT guard
- `@CurrentUser()` decorator to access authenticated user in any controller

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Browser / Client                            │
│                                                                      │
│   ┌─────────────────────────┐   ┌──────────────────────────────┐    │
│   │   hi-shop-fe            │   │   hi-shop-dashboard          │    │
│   │   Next.js 16 App Router │   │   Vite + React 19            │    │
│   │   Port: 3000 (dev)      │   │   Port: 3000 (dev)           │    │
│   │                         │   │                              │    │
│   │  Server Actions ───┐    │   │  Axios + interceptors ──┐   │    │
│   │  iron-session      │    │   │  Zustand + cookies      │   │    │
│   │  Zustand (cart)    │    │   │  React Router v7        │   │    │
│   └────────────────────┼────┘   └─────────────────────────┼───┘    │
│                        │                                   │        │
└────────────────────────┼───────────────────────────────────┼────────┘
                         │  REST (HTTPS/JSON)                │
                         │  Authorization: Bearer <token>    │
                         ▼                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        hi-shop-be (NestJS 11)                        │
│                     http://localhost:5000/api/v1                     │
│                                                                      │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────────┐ │
│  │  Middleware  │  │    Guards      │  │     Interceptors         │ │
│  │  requestId   │  │  JwtAuthGuard  │  │  RequestLogging          │ │
│  │  cookieParser│  │  RolesGuard    │  │  DecimalTransform        │ │
│  │  cors        │  │  ThrottlerGuard│  │  ClassSerializer         │ │
│  └──────────────┘  └────────────────┘  └──────────────────────────┘ │
│                                                                      │
│  Controllers: auth · user · category · product · order · discount   │
│               review · address · stats · health · audit             │
│                                                                      │
│  Services ──► Prisma Service ──► PostgreSQL                          │
│                                                                      │
│  MailService (Nodemailer) ──► SMTP / Gmail                           │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │                 │
                    │  Users          │
                    │  Products       │
                    │  Categories     │
                    │  Orders         │
                    │  Reviews        │
                    │  Discounts      │
                    │  Addresses      │
                    │  AuditLogs      │
                    │  RefreshTokens  │
                    └─────────────────┘

Auth Flow
─────────
1. User POSTs credentials → /api/v1/auth/login
2. Backend validates, hashes, returns { accessToken, refreshToken } in HTTP-only cookies
3. Access token (20 min) attached as Bearer header on subsequent requests
4. On 401, frontend silently calls /api/v1/auth/refresh with the refresh token cookie
5. New access token replaces the old; original request is retried
6. On refresh failure → session destroyed → redirect to /login
```

---

## Folder Structure

### Backend — `hi-shop-be`

```
hi-shop-be/
├── prisma/
│   ├── schema/              # Multi-file Prisma schema (base, enums, user, product, order)
│   └── migrations/          # Versioned SQL migration history
├── src/
│   ├── main.ts              # Bootstrap: global prefix, versioning, pipes, CORS, Swagger
│   ├── app.module.ts        # Root module: ConfigModule, ThrottlerModule, feature modules
│   ├── config/
│   │   └── env.validation.ts  # Zod-based env var validation at startup
│   ├── prisma/              # PrismaModule + PrismaService (singleton)
│   ├── common/
│   │   ├── middleware/      # requestIdMiddleware
│   │   ├── interceptors/    # RequestLogging, DecimalTransform
│   │   ├── filters/         # GlobalExceptionFilter
│   │   ├── guards/          # JwtAuthGuard, JwtRefreshGuard, RolesGuard
│   │   └── decorators/      # @CurrentUser(), @Public(), @Roles()
│   ├── auth/                # Login, register, refresh, logout, forgot/reset password
│   ├── user/                # Profile, admin user management
│   ├── address/             # Saved addresses CRUD
│   ├── category/            # Category tree management
│   ├── product/             # Products, variants, images, inventory
│   ├── order/               # Order placement, status, shipping, cancellation
│   ├── discount/            # Discount code CRUD and validation
│   ├── review/              # Product reviews and moderation
│   ├── stats/               # Aggregated KPI endpoint
│   ├── audit/               # Audit log queries
│   ├── health/              # Health check endpoint
│   └── mail/                # Nodemailer transactional email service
└── test/                    # E2E test suite with helpers
```

### Frontend — `hi-shop-fe`

```
hi-shop-fe/
├── app/
│   ├── (auth)/              # /login, /signup — unauthenticated layout group
│   ├── (main)/              # Authenticated/public routes inside main shell
│   │   ├── product/         # Listing + [id] detail
│   │   ├── categories/      # Grid + [slug] filtered listing
│   │   ├── cart/            # Cart page
│   │   ├── checkout/        # Checkout flow (requires auth)
│   │   ├── orders/[id]/     # Order detail
│   │   └── profile/[id]/    # Profile, orders history, addresses
│   ├── _actions/            # Next.js Server Actions (auth, orders, addresses, user)
│   └── api/auth/me/         # Session introspection API route
├── components/
│   ├── home/                # Landing page sections
│   ├── nav/                 # Navbar, NavLink
│   └── ui/                  # shadcn-style Radix primitives
├── config/
│   └── envs.ts              # Zod-validated runtime env
├── context/
│   └── auth-context.tsx     # AuthProvider (client-side user context)
├── lib/
│   ├── store/cart.ts        # Zustand cart store (persisted)
│   ├── auth.server.ts       # getSession, getUser, requireUser
│   ├── session.ts           # iron-session cookie config
│   ├── fetcher.ts           # Base HTTP client
│   └── methods.ts           # get / post / patch / del wrappers
├── middleware.ts             # Edge auth: protect routes, silent token refresh
└── types/                   # Shared TypeScript interfaces
```

### Admin Dashboard — `hi-shop-dashboard`

```
hi-shop-dashboard/src/
├── app/
│   ├── layouts/             # DashboardLayout, Header, Sidebar
│   └── routes/              # AppRouter, ProtectedRoute, GuestRoute
├── axios/                   # Axios instance, request/response interceptors, refresh helper
├── components/ui/           # shadcn-style primitives (20+ components)
├── features/
│   ├── auth/                # Login page, form, useSignin hook
│   ├── dashboard/           # KPIs page + useStats hook
│   ├── analytics/           # Analytics page with Recharts
│   ├── products/            # Inventory list, Add/Edit product, variant/image management
│   ├── categories/          # CRUD with CategoryModal
│   ├── orders/              # Order list, OrderDetailModal, status/shipping updates
│   ├── users/               # User list, role/suspend management
│   ├── reviews/             # Per-product review moderation
│   └── discounts/           # Discount code management
├── shared/
│   ├── components/          # PageHeading, Pagination, StatusBadge, NavLink
│   ├── constants/           # Navigation config
│   └── store/               # useAuthStore (Zustand + persist)
├── types/                   # Shared TypeScript interfaces
└── utils/                   # api-error.ts, helper.ts
```

---

## Installation & Local Development

### Prerequisites

- Node.js 22+
- Yarn (`npm install -g yarn`)
- PostgreSQL 14+

---

### 1. Backend (`hi-shop-be`)

```bash
git clone https://github.com/Hasibul-Islam-Shanto/hi-shop-be.git
cd hi-shop-be
yarn install
```

Copy and fill in environment variables:

```bash
cp .env.example .env
# Edit .env — see Environment Variables section below
```

Run database migrations and generate Prisma client:

```bash
yarn db:generate
yarn db:migrate
```

Start development server:

```bash
yarn dev
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/api-docs
```

Production build:

```bash
yarn build
yarn start:prod
```

---

### 2. Storefront (`hi-shop-fe`)

```bash
git clone https://github.com/Hasibul-Islam-Shanto/hi-shop-fe.git
cd hi-shop-fe
yarn install
```

Copy environment file:

```bash
cp .env.example .env
```

Start development server (Turbopack):

```bash
yarn dev
# Available at http://localhost:3000
```

Production build:

```bash
yarn build
yarn start
```

---

### 3. Admin Dashboard (`hi-shop-dashboard`)

```bash
git clone https://github.com/Hasibul-Islam-Shanto/hi-shop-dashboard.git
cd hi-shop-dashboard
npm install
```

Create environment file:

```bash
echo "VITE_API_BASE_URL=http://localhost:5000/api/v1" > .env
```

Start development server:

```bash
npm run dev
# Available at http://localhost:3000
```

Production build:

```bash
npm run build
npm run preview
```

---

## Environment Variables

### Backend — `hi-shop-be`

| Variable | Required | Purpose | Example |
|---|---|---|---|
| `NODE_ENV` | No | Runtime environment | `development` |
| `SERVER_PORT` | Yes | HTTP port the API listens on | `5000` |
| `FRONTEND_URL` | Yes | Storefront origin for CORS | `http://localhost:3000` |
| `DASHBOARD_URL` | Yes | Dashboard origin for CORS | `http://localhost:5173` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/hi_shop` |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access tokens (min 32 chars) | `your-32+-char-access-secret` |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens (min 32 chars) | `your-32+-char-refresh-secret` |
| `ACCESS_TOKEN_EXPIRES_IN` | Yes | Access token lifetime | `20m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Yes | Refresh token lifetime | `7d` |
| `EMAIL_USER` | No | Gmail address for transactional email | `yourapp@gmail.com` |
| `EMAIL_PASS` | No | Gmail app password | `xxxx xxxx xxxx xxxx` |

> Startup validation (`src/config/env.validation.ts`) will throw if required variables are missing, malformed, or contain placeholder values.

---

### Storefront — `hi-shop-fe`

| Variable | Required | Purpose | Example |
|---|---|---|---|
| `NODE_ENV` | No | Runtime environment | `development` |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API base URL (client-visible) | `http://localhost:5000/api/v1` |
| `SESSION_SECRET` | Yes | iron-session cookie encryption secret (min 32 chars) | `a-random-32+-character-string` |

---

### Admin Dashboard — `hi-shop-dashboard`

| Variable | Required | Purpose | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL | `http://localhost:5000/api/v1` |

---

## Available Scripts

### Backend

```bash
yarn dev              # Start in watch mode (development)
yarn build            # Compile TypeScript → dist/
yarn start:prod       # Run compiled production build
yarn test             # Run unit tests (Jest)
yarn test:cov         # Unit tests with coverage report
yarn test:e2e         # Run end-to-end tests
yarn lint             # ESLint with auto-fix
yarn format           # Prettier format

yarn db:migrate       # Create + apply a new migration (dev)
yarn db:deploy        # Apply pending migrations (production)
yarn db:generate      # Regenerate Prisma client
yarn db:reset         # Reset database (WARNING: drops all data)
yarn db:studio        # Open Prisma Studio GUI
yarn db:push          # Push schema without migration (prototyping only)
```

### Storefront

```bash
yarn dev              # Start Next.js dev server with Turbopack
yarn build            # Production build
yarn start            # Start production server
yarn lint             # ESLint
yarn format           # Prettier format
yarn check            # Type-check + lint (CI)
```

### Admin Dashboard

```bash
npm run dev           # Start Vite dev server (port 3000)
npm run build         # TypeScript check + Vite production build
npm run preview       # Preview production build locally
npm run lint          # ESLint
```

---

## API Documentation

> Interactive Swagger UI is available at **`http://localhost:5000/api-docs`** when the backend is running.

All endpoints are prefixed with `/api`. Most routes use URI versioning (`v1`).

### Auth Routes — `/api/v1/auth`

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new customer account | No |
| `POST` | `/api/v1/auth/login` | Login; sets access + refresh token cookies | No |
| `POST` | `/api/v1/auth/refresh` | Refresh access token using refresh token cookie | No |
| `POST` | `/api/v1/auth/logout` | Invalidate session, clear cookies | Yes |
| `POST` | `/api/v1/auth/forgot-password` | Send password reset email | No |
| `POST` | `/api/v1/auth/reset-password` | Reset password with token from email | No |

### User Routes — `/api/v1/users`

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | Get authenticated user's profile | Yes |
| `PATCH` | `/api/v1/users/me` | Update authenticated user's profile | Yes |
| `GET` | `/api/v1/users` | List all users | Admin |
| `PATCH` | `/api/v1/users/:id/role` | Change user role | Admin |
| `PATCH` | `/api/v1/users/:id/suspend` | Suspend user account | Admin |
| `PATCH` | `/api/v1/users/:id/reactivate` | Reactivate suspended account | Admin |

### Category Routes — `/api/v1/categories`

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/categories` | List categories (supports `?flat=true`) | No |
| `POST` | `/api/v1/categories` | Create category | Admin |
| `PATCH` | `/api/v1/categories/:id` | Update category | Admin |
| `DELETE` | `/api/v1/categories/:id` | Delete category | Admin |

### Product Routes — `/api/v1/products`

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/products` | List products with filters/sort/pagination | No |
| `GET` | `/api/v1/products/:id` | Get product detail with variants and images | No |
| `POST` | `/api/v1/products` | Create product | Admin |
| `PATCH` | `/api/v1/products/:id` | Update product | Admin |
| `DELETE` | `/api/v1/products/:id` | Soft-delete product | Admin |
| `POST` | `/api/v1/products/:id/variants` | Add product variant | Admin |
| `PATCH` | `/api/v1/products/:id/variants/:variantId` | Update variant | Admin |
| `DELETE` | `/api/v1/products/:id/variants/:variantId` | Remove variant | Admin |
| `POST` | `/api/v1/products/:id/images` | Add product image | Admin |
| `DELETE` | `/api/v1/products/:id/images/:imageId` | Remove product image | Admin |

### Order Routes — `/api/orders`

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `POST` | `/api/orders` | Place a new order | Yes |
| `GET` | `/api/orders/my` | Get current user's orders | Yes |
| `GET` | `/api/orders/my/:id` | Get single order detail | Yes |
| `DELETE` | `/api/orders/my/:id/cancel` | Cancel an order | Yes |
| `GET` | `/api/orders` | List all orders | Admin |
| `PATCH` | `/api/orders/:id/status` | Update order status | Admin |
| `PATCH` | `/api/orders/:id/shipping` | Update shipping info | Admin |
| `GET` | `/api/orders/:id/status-logs` | Get order status history | Admin |

### Discount Routes — `/api/v1/discounts`

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/discounts` | List all discount codes | Admin |
| `POST` | `/api/v1/discounts` | Create discount code | Admin |
| `PATCH` | `/api/v1/discounts/:id` | Update discount code | Admin |
| `PATCH` | `/api/v1/discounts/:id/deactivate` | Deactivate discount code | Admin |
| `POST` | `/api/v1/discounts/validate` | Validate a discount code at checkout | Yes |

### Review Routes — `/api/v1/reviews`

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/products/:id/reviews` | List reviews for a product | No |
| `POST` | `/api/v1/products/:id/reviews` | Submit a product review | Yes |
| `PATCH` | `/api/v1/reviews/:id/moderation` | Toggle review visibility | Admin |

### Address Routes — `/api/v1/addresses`

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/addresses` | Get current user's addresses | Yes |
| `POST` | `/api/v1/addresses` | Create new address | Yes |
| `PATCH` | `/api/v1/addresses/:id` | Update address | Yes |
| `DELETE` | `/api/v1/addresses/:id` | Delete address | Yes |

### Stats & Health

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `GET` | `/api/stats` | Aggregate KPIs (revenue, orders, users, products) | Admin |
| `GET` | `/api/v1/health` | API health check | No |

---

## Security Practices

| Practice | Implementation |
|---|---|
| Password hashing | `bcryptjs` (adaptive cost factor) |
| JWT tokens | Dual-token strategy; access tokens expire in 20 min |
| Cookie storage | HTTP-only cookies in storefront (`iron-session`); browser cookies in dashboard |
| RBAC | `@Roles()` decorator + `RolesGuard`; two roles: `CUSTOMER`, `ADMIN` |
| Protected routes | `JwtAuthGuard` applied globally; opt-out via `@Public()` |
| Input validation | `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` |
| Rate limiting | `@nestjs/throttler` guard applied globally via `APP_GUARD` |
| CORS | Restricted to `FRONTEND_URL` and `DASHBOARD_URL` only |
| Request tracing | UUID-based `x-request-id` header on every request and response |
| Audit logging | `AuditLog` table records actor, action, target, IP, and request ID |
| Env validation | Startup-time Zod validation rejects invalid or placeholder secrets |
| Idempotent orders | `@@unique([userId, idempotencyKey])` prevents duplicate order submissions |
| User suspension | `suspendedAt` field allows non-destructive account suspension |

**Recommended Improvement:** Add CSRF protection for state-mutating server actions in the Next.js storefront. Consider moving dashboard tokens to `HttpOnly` cookies to match the storefront's security posture.

---

## Performance Optimization

- **React Server Components**: The Next.js storefront uses App Router RSC for server-rendered pages with zero client JS where possible
- **Turbopack**: Development builds use Turbopack (`next dev --turbopack`) for fast HMR
- **Vite code splitting**: Dashboard uses `manualChunks` to separate `react`, `router`, `charts`, `ui`, and `forms` into independent bundles
- **Prisma native driver**: `@prisma/adapter-pg` bypasses the Prisma query engine binary, reducing cold start latency
- **Decimal serialisation**: `DecimalTransformInterceptor` converts `Prisma.Decimal` objects once at the boundary, avoiding repeated parsing on the client
- **Memoised token refresh**: Dashboard uses `mem` to deduplicate concurrent refresh calls — only one refresh request fires even if multiple 401s arrive simultaneously
- **Soft deletes**: Products and users use `deletedAt` / `suspendedAt` instead of hard deletes, avoiding expensive `ON DELETE CASCADE` operations
- **Pagination**: All listing endpoints and UI components support pagination to avoid unbounded queries
- **Next.js Image Optimisation**: Remote image patterns configured in `next.config.mjs` for automatic resizing and format conversion

**Recommended Improvement:** Add database indexes on high-cardinality filter columns (`product.categoryId`, `order.userId`, `order.status`). Consider Redis for session caching and rate-limit counters.

---

## Deployment Guide

### Vercel (Storefront — recommended)

```bash
# Install Vercel CLI
npm i -g vercel

cd hi-shop-fe
vercel deploy --prod
```

Set environment variables in the Vercel dashboard:

```
NEXT_PUBLIC_API_BASE_URL=https://your-api.domain.com/api/v1
SESSION_SECRET=<32+ char secret>
```

### VPS / Railway / Render (Backend)

```bash
# On the server
yarn install --frozen-lockfile
yarn db:deploy         # Apply migrations
yarn build
yarn start:prod        # node dist/src/main
```

Ensure `NODE_ENV=production` and all required env vars are set before starting.

### Netlify / Vercel (Dashboard)

```bash
cd hi-shop-dashboard
npm run build          # Outputs to dist/
```

Set build command: `npm run build`  
Set publish directory: `dist`  
Set environment variable: `VITE_API_BASE_URL=https://your-api.domain.com/api/v1`

### Docker (Backend)

**Recommended Improvement:** A `Dockerfile` is not currently included. A basic production Dockerfile:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn db:generate && yarn build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 5000
CMD ["node", "dist/src/main"]
```

---

## Screenshots

### Storefront (`hi-shop-fe`)

**Home Page** — Hero section with featured product and call-to-action

![Home Page](./screenshots/Screenshot%202026-05-13%20at%207.23.56%20PM.png)

---

**All Categories** — Category discovery grid with browse and filtering options

![All Categories](./screenshots/Screenshot%202026-05-13%20at%207.24.20%20PM.png)

---

**Shopping Cart** — Persistent cart with item management, discount code input, and order summary

![Shopping Cart](./screenshots/Screenshot%202026-05-13%20at%207.24.28%20PM.png)

---

**User Profile Dashboard** — Personalised welcome banner, order stats, and active order snapshot

![User Profile Dashboard](./screenshots/Screenshot%202026-05-13%20at%207.24.43%20PM.png)

---

**Order History** — Tabbed order history view (Active / Delivered / Cancelled) with order cards

![Order History](./screenshots/Screenshot%202026-05-13%20at%207.25.26%20PM.png)

---

### Admin Dashboard (`hi-shop-dashboard`)

**Add New Product** — Product creation form with basic info, description, category selection, and image upload

![Add New Product](./screenshots/Screenshot%202026-05-13%20at%208.09.36%20PM.png)

---

**Categories Management** — Full category list with slug, description, parent, and inline edit/delete actions

![Categories Management](./screenshots/Screenshot%202026-05-13%20at%208.09.48%20PM.png)

---

**Order Detail Modal** — Per-order detail with customer info, status badge, shipping courier, and tracking number

![Order Detail Modal](./screenshots/Screenshot%202026-05-13%20at%208.10.01%20PM.png)

---

**Users Management** — User list with role assignment (Customer ↔ Admin) and suspend/reactivate controls

![Users Management](./screenshots/Screenshot%202026-05-13%20at%208.10.13%20PM.png)

---

**Analytics** — KPI cards (revenue, orders, customers, products), orders-by-status bar chart, and status breakdown

![Analytics](./screenshots/Screenshot%202026-05-13%20at%208.10.25%20PM.png)

---

## Testing

### Backend

Unit tests and E2E tests are implemented using **Jest**.

```bash
# Unit tests
yarn test

# Unit tests with coverage
yarn test:cov

# End-to-end tests
yarn test:e2e
```

The E2E test suite (`test/`) includes helpers for bootstrapping a test app instance, seeding auth users, and resetting the test database between runs.

### Frontend & Dashboard

**Recommended Improvement:** No automated tests exist in `hi-shop-fe` or `hi-shop-dashboard`. Consider adding:

- **Unit tests**: Vitest + React Testing Library for component logic
- **Integration tests**: Server action and API route testing with `msw`
- **E2E tests**: Playwright or Cypress for critical user journeys (login → add to cart → checkout)

---

## Roadmap

- [ ] **Payments**: Integrate Stripe (`Payment` model and `stripePaymentId` are already in the schema, awaiting implementation)
- [ ] **OAuth**: Google and GitHub login (UI placeholders exist in the dashboard; backend strategy not yet implemented)
- [ ] **Redis**: Session caching, rate-limit counters, job queues
- [ ] **Email queue**: Background job queue (BullMQ) for reliable transactional email delivery
- [ ] **Push notifications**: Order status change notifications via web push or websockets
- [ ] **PWA**: Service worker + offline support for the storefront
- [ ] **CI/CD**: Automated deployment pipelines (already have CI for lint/test/build)
- [ ] **Docker Compose**: Single-command local stack (API + PostgreSQL + Redis)
- [ ] **Monitoring**: Integrate Sentry (error tracking) and a metrics provider (Prometheus / Datadog)
- [ ] **Frontend tests**: Vitest + Playwright coverage for storefront and dashboard
- [ ] **Mobile app**: React Native app consuming the same REST API
- [ ] **Wishlist**: Save products for later (schema extension required)
- [ ] **Product search**: Full-text search with PostgreSQL `tsvector` or Meilisearch

---

## Troubleshooting

### `DATABASE_URL` connection error on startup

Verify PostgreSQL is running and the connection string in `.env` is correct:

```bash
psql "postgresql://user:password@localhost:5432/hi_shop"
```

Ensure the database exists before running migrations:

```bash
createdb hi_shop
yarn db:migrate
```

### Startup fails with env validation error

The backend validates env vars at boot. Check the error message — it will name the missing or invalid variable. Common causes:

- `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` shorter than 32 characters
- `JWT_ACCESS_SECRET` still set to the placeholder value from `.env.example`
- `FRONTEND_URL` or `DASHBOARD_URL` missing

### `401 Unauthorized` after login

The storefront uses HTTP-only cookies. If you're testing with a REST client (Postman, curl), make sure cookies are being sent with each request. In the browser, ensure `credentials: true` is set and CORS allows the origin.

### Push rejected (non-fast-forward)

```bash
git pull --rebase origin main
git push origin main
```

### Prisma client out of sync after schema change

```bash
yarn db:generate   # Regenerates the Prisma client from the current schema
```

If you modified the schema, also run:

```bash
yarn db:migrate    # Creates and applies a new migration
```

### Dashboard shows blank page after build

Check that `VITE_API_BASE_URL` is set at **build time** (not just runtime). Vite inlines env vars at build; missing values become `undefined`.

---

## Contributing

Contributions are welcome across all three repositories.

```bash
# 1. Fork the relevant repository on GitHub
# 2. Clone your fork
git clone https://github.com/<your-username>/<repo-name>.git

# 3. Create a feature branch
git checkout -b feat/your-feature-name

# 4. Make your changes following the code style
#    (ESLint + Prettier are enforced via pre-commit hooks on hi-shop-fe)

# 5. Commit using Conventional Commits
git commit -m "feat: add product wishlist endpoint"

# 6. Push and open a Pull Request against main
git push origin feat/your-feature-name
```

**Commit message format**: This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
feat:     A new feature
fix:      A bug fix
docs:     Documentation changes
refactor: Code change that neither fixes a bug nor adds a feature
test:     Adding or updating tests
chore:    Build process or tooling changes
```

Please make sure `yarn lint` (or `npm run lint`) passes and existing tests are not broken before opening a PR.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with care by <a href="https://github.com/Hasibul-Islam-Shanto">Hasibul Islam Shanto</a>
</p>
