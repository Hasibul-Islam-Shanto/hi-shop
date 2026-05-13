# Hi-Shop Backend

Production-grade REST API for the Hi-Shop e-commerce platform, built with NestJS, Prisma, and PostgreSQL.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Overview](#api-overview)
- [Auth Pattern](#auth-pattern)
- [Role System](#role-system)
- [Running Tests](#running-tests)
- [Changelog](#changelog)
- [Roadmap](#roadmap)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 (Express) |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT — access token (20m) + refresh token (7d) with rotation |
| Validation | class-validator / class-transformer |
| API Docs | Swagger UI at `/api-docs` |
| Rate Limiting | @nestjs/throttler (60 req / 60s) |
| Testing | Jest + @nestjs/testing (unit tests, no DB required) |

---

## Project Structure

```
hi-shop-be/
├── prisma/
│   └── schema/
│       ├── base.prisma          # generator + datasource
│       ├── enums.prisma         # Role, OrderStatus, PaymentStatus
│       ├── user.prisma          # User, RefreshToken, Address
│       ├── product.prisma       # Category, Product, ProductVariant, ProductImage, Review
│       └── order.prisma         # Order, OrderItem, OrderStatusLog, Payment, Discount
│
├── src/
│   ├── auth/                    # register, login, refresh, logout + JWT strategies
│   │   └── dto/                 # RegisterDto, LoginDto, RefreshDto
│   ├── category/                # Category CRUD — nested tree + flat list
│   │   └── dto/                 # CreateCategoryDto, UpdateCategoryDto
│   ├── product/                 # Product, Variant, Image, Review management
│   │   └── dto/                 # CreateProductDto, UpdateProductDto, ProductQueryDto, ...
│   ├── user/                    # User profile management
│   │   └── dto/                 # UpdateUserDto
│   ├── common/
│   │   ├── decorators/          # @Public(), @Roles(), @CurrentUser()
│   │   ├── guards/              # JwtAuthGuard, JwtRefreshGuard, RolesGuard
│   │   └── types/               # AuthenticatedRequest, JwtPayload
│   ├── mail/                    # MailService (nodemailer)
│   ├── prisma/                  # PrismaService + global PrismaModule
│   ├── app.module.ts
│   └── main.ts
│
└── test/
    └── app.e2e-spec.ts
```

---

## Getting Started

```bash
# 1. Install dependencies
yarn install

# 2. Set up environment
cp .env.example .env
# Fill in DATABASE_URL and JWT secrets (see Environment Variables below)

# 3. Generate Prisma client
yarn db:generate

# 4. Run migrations
yarn db:migrate

# 5. Start development server
yarn start:dev
```

App runs at: `http://localhost:5000/api/v1`
Swagger UI: `http://localhost:5000/api-docs`

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hi_shop?schema=public"

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRES_IN=20m
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
SERVER_PORT=5000
FRONTEND_URL=http://localhost:3000

# Mail (optional — app still works if unset)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=yourpassword
EMAIL_FROM=noreply@hi-shop.com
```

---

## Database

The schema uses Prisma's **multi-file schema** under `prisma/schema/`. Common commands:

```bash
yarn db:generate      # regenerate Prisma client after schema changes
yarn db:migrate       # create and apply a new migration
yarn db:push          # push schema to DB without migration (dev only)
yarn db:reset         # drop and recreate the DB (dev only)
yarn db:studio        # open Prisma Studio at http://localhost:5555
yarn db:format        # format all .prisma files
```

### Creating an Admin user

There is no public API endpoint for creating admin users by design. Use Prisma Studio or a seed script:

```bash
yarn db:studio
# Find your user → change role field to ADMIN → save
```

---

## API Overview

Base path: `/api/v1`

### Auth

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new customer |
| POST | `/auth/login` | Public | Login, receive token pair |
| POST | `/auth/refresh` | Public* | Rotate access + refresh tokens |
| POST | `/auth/logout` | JWT | Invalidate all refresh tokens |

*Requires valid refresh token in request body.

### Users

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/users/me` | JWT | Get own profile |
| PATCH | `/users/me` | JWT | Update own profile |

### Categories

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/categories` | Public | Full nested category tree |
| GET | `/categories?flat=true` | Public | Flat list (for dropdowns) |
| GET | `/categories/:id` | Public | Category by ID |
| GET | `/categories/slug/:slug` | Public | Category by slug |
| POST | `/categories` | Admin | Create category |
| PATCH | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

### Products

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/products` | Public | Paginated list with filters |
| GET | `/products/:id` | Public | Product detail by ID |
| GET | `/products/slug/:slug` | Public | Product detail by slug |
| GET | `/products/:id/reviews` | Public | Paginated reviews |
| POST | `/products` | Admin | Create product with variants + images |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Soft-delete product |
| POST | `/products/:id/variants` | Admin | Add variant |
| PATCH | `/products/:id/variants/:variantId` | Admin | Update variant |
| DELETE | `/products/:id/variants/:variantId` | Admin | Remove variant |
| POST | `/products/:id/images` | Admin | Add image |
| DELETE | `/products/:id/images/:imageId` | Admin | Remove image |

#### Product query parameters

| Param | Type | Description |
|---|---|---|
| `search` | string | Full-text search on name + description |
| `categoryId` | uuid | Filter by category |
| `minPrice` | number | Minimum base price |
| `maxPrice` | number | Maximum base price |
| `isActive` | boolean | Defaults to `true`; pass `false` to see inactive (admin) |
| `sortBy` | `price` \| `name` \| `createdAt` | Sort field (default: `createdAt`) |
| `sortOrder` | `asc` \| `desc` | Sort direction (default: `desc`) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

### Orders

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/orders` | JWT | Place a new order |
| GET | `/orders/my` | JWT | List own orders (paginated, filterable by status) |
| GET | `/orders/my/:id` | JWT | Get a single own order |
| DELETE | `/orders/my/:id/cancel` | JWT | Cancel own order (PENDING / CONFIRMED / PROCESSING only) |
| GET | `/orders` | Admin | List all orders |
| GET | `/orders/:id` | Admin | Get order by ID |
| PATCH | `/orders/:id/status` | Admin | Advance or cancel order status |
| GET | `/orders/:id/status-logs` | Admin | Full status-change audit trail |

#### Order query parameters

| Param | Type | Description |
|---|---|---|
| `status` | `OrderStatus` | Filter by status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

#### Order status state machine

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → REFUNDED
           ↓               ↓            ↓
         CANCELLED      CANCELLED   (not allowed — stock already shipped)
```

Stock is restored when an order is cancelled from PENDING, CONFIRMED, or PROCESSING.

---

## Auth Pattern

`JwtAuthGuard` is registered **globally** as `APP_GUARD`. Every route requires a valid JWT by default.

- Mark public routes with `@Public()` — used on `register`, `login`, `refresh`, and all read-only product/category endpoints.
- `RolesGuard` is applied **per route** with `@UseGuards(RolesGuard) @Roles(Role.ADMIN)`.
- Refresh tokens are stored in the database and rotated on every use (old token deleted, new pair issued).

---

## Role System

| Role | Description |
|---|---|
| `CUSTOMER` | Default on registration. Can browse products, place orders, write reviews. |
| `ADMIN` | Platform owner. Full access — manages categories, products, orders, users. |

> **Planned:** `SUPPLIER` role — vendors who list their own products and earn commissions minus platform fee.

---

## Running Tests

```bash
# Run all unit tests
yarn test

# Watch mode
yarn test:watch

# Coverage report
yarn test:cov

# End-to-end tests
yarn test:e2e
```

E2E tests are guarded and require a disposable database:

```bash
E2E_DATABASE_URL="postgresql://user:password@localhost:5432/hi_shop_test" yarn db:deploy
E2E_DATABASE_URL="postgresql://user:password@localhost:5432/hi_shop_test" yarn test:e2e
```

The test reset helper refuses to truncate a database unless its URL contains
`test`/`e2e` or `ALLOW_E2E_DB_RESET=true` is set.

**Current test coverage:**

| Suite | Tests |
|---|---|
| `auth.service.spec.ts` | 13 |
| `product.service.spec.ts` | 40 |
| `product.controller.spec.ts` | 13 |
| `category.service.spec.ts` | 22 |
| `category.controller.spec.ts` | 9 |
| `order.service.spec.ts` | 22 |
| **Total** | **119** |

All tests are pure unit tests — no database or running server required.

---

## Changelog

> Track what was built, fixed, or changed here. Add a new entry for every meaningful change.

### [Unreleased]

#### Added
- Order module — full customer and admin order lifecycle
  - Customer: place order (atomic stock deduction, discount application), list/get own orders, cancel own order with stock restoration
  - Admin: list all orders (filterable by status), get order detail, advance/cancel status via state machine, full status-change audit trail
  - Discount support: percentage or flat-amount, minOrderAmt guard, maxUses guard, expiry check, usedCount increment
  - Prices locked at order time (basePrice + priceModifier captured in `unitPrice` per `OrderItem`)
  - Status state machine enforced: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → REFUNDED; CANCELLED is terminal from PENDING/CONFIRMED/PROCESSING
  - Stock restored atomically on cancellation
- Unit test suite expanded — 119 tests (22 new for order service)
- Order API documented in README with state machine diagram

#### Added (earlier)
- Category module — full CRUD with nested tree, flat list, subcategory support, circular reference guard, deletion safety checks
- Product module — full CRUD with variant and image management, soft delete, paginated search with filters and sorting
- Slug auto-generation from product/category name
- `@MaxLength` validators on all string DTO fields
- `limit` cap (max 100) on paginated endpoints
- Sorting support on product listing (`price`, `name`, `createdAt`)
- Paginated reviews endpoint (`GET /products/:id/reviews`)
- `isPrimary` image promotion wrapped in a DB transaction

#### Fixed
- Inactive products no longer visible on public listing (defaults `isActive: true`)
- Duplicate SKU detection within the same create request
- `removeVariant` now checks for order history before deleting
- `addImage` race condition resolved with `$transaction`
- Category and product existence validated before write operations

---

### 2026-04-26 — Initial scaffold

#### Added
- NestJS project scaffold with Prisma multi-file schema
- JWT auth (register, login, refresh with token rotation, logout)
- User profile endpoints (`GET /users/me`, `PATCH /users/me`)
- Global `JwtAuthGuard`, `@Public()` decorator, `RolesGuard`
- Throttler (60 req/60s), Schedule module, Swagger UI
- Multi-file Prisma schema: User, Product, Category, Order, Payment, Discount, Review

---

## Roadmap

> Features planned but not yet implemented.

- [x] **Order module** — customer places order, stock deduction, order status lifecycle
- [ ] **Payment module** — Stripe payment intent + webhook handler
- [ ] **Discount module** — create and validate discount codes
- [ ] **Review module** — customer submits reviews (one per product)
- [ ] **Admin user management** — list users, suspend accounts, change roles
- [ ] **Seed script** — bootstrap admin user and sample categories/products
- [ ] **Supplier role** — multi-vendor support with commission tracking and payouts
- [ ] **Address module** — customer manages shipping addresses
- [ ] **E2E tests** — supertest-based end-to-end test suite
- [ ] **Docker setup** — `docker-compose.yml` for local dev environment
- [ ] **CI pipeline** — GitHub Actions for lint, test, build on PR
