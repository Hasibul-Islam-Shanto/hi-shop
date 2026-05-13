import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryMovementType, OrderStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderShippingDto } from './dto/update-order-shipping.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

// ─── State Machine ────────────────────────────────────────────────────────────
// Valid transitions:
//   PENDING     → CONFIRMED | CANCELLED
//   CONFIRMED   → PROCESSING | CANCELLED
//   PROCESSING  → SHIPPED    | CANCELLED
//   SHIPPED     → DELIVERED
//   DELIVERED   → REFUNDED
//   CANCELLED / REFUNDED → terminal

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

/** Statuses where stock should be restored on cancellation. */
const RESTORE_STOCK_FROM = new Set<OrderStatus>([
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNum(d: Prisma.Decimal | null | undefined): number {
  return d ? Number(d.toString()) : 0;
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function calculateShippingFee(country: string, city: string): number {
  if (country.toLowerCase() !== 'bd') return 500;
  return city.toLowerCase() === 'dhaka' ? 60 : 120;
}

type AuditContext = {
  actorId?: string;
  requestId?: string;
  ipAddress?: string;
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private readonly customerOrderInclude = {
    items: {
      include: {
        productVariant: {
          select: { id: true, sku: true, size: true, color: true },
        },
      },
    },
    shippingAddress: true,
    discount: { select: { id: true, code: true } },
    payment: true,
    statusLogs: { orderBy: { createdAt: 'asc' } },
  } satisfies Prisma.OrderInclude;

  // ─── Customer: place order ────────────────────────────────────────────────

  async create(userId: string, dto: CreateOrderDto) {
    if (dto.idempotencyKey) {
      const existingOrder = await this.findByIdempotencyKey(
        userId,
        dto.idempotencyKey,
      );
      if (existingOrder) return existingOrder;
    }

    // 1. Validate shipping address belongs to this user
    const address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });
    if (!address) throw new NotFoundException('Shipping address not found');

    // 2. Load variants with enough info for validation + pricing in one query
    const items = this.mergeDuplicateItems(dto.items);
    const variantIds = items.map((i) => i.productVariantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: {
        product: {
          select: { basePrice: true, isActive: true, deletedAt: true },
        },
      },
    });

    if (variants.length !== variantIds.length) {
      throw new BadRequestException(
        'One or more product variants are invalid or inactive',
      );
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // 3. Validate product availability + stock
    for (const item of items) {
      const v = variantMap.get(item.productVariantId)!;
      if (v.product.deletedAt || !v.product.isActive) {
        throw new BadRequestException(
          `Product for variant ${item.productVariantId} is unavailable`,
        );
      }
      if (v.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for SKU "${v.sku}" — requested ${item.quantity}, available ${v.stock}`,
        );
      }
    }

    // 4. Build line items with prices locked at order time
    const lineItems = items.map((item) => {
      const v = variantMap.get(item.productVariantId)!;
      const unitPrice = toNum(v.product.basePrice) + toNum(v.priceModifier);
      return {
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice,
        subtotal: unitPrice * item.quantity,
      };
    });

    const subtotalAmount = roundMoney(
      lineItems.reduce((sum, li) => sum + li.subtotal, 0),
    );
    let rawTotal = subtotalAmount;
    let discountAmount = 0;

    // 5. Validate and apply discount (if provided)
    let discountId: string | null = null;
    if (dto.discountCode) {
      const discount = await this.prisma.discount.findUnique({
        where: { code: dto.discountCode },
      });

      if (!discount || !discount.isActive) {
        throw new BadRequestException('Invalid or inactive discount code');
      }
      if (discount.expiresAt && discount.expiresAt < new Date()) {
        throw new BadRequestException('Discount code has expired');
      }
      if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
        throw new BadRequestException(
          'Discount code has reached its usage limit',
        );
      }
      const minAmt = toNum(discount.minOrderAmt);
      if (minAmt > 0 && rawTotal < minAmt) {
        throw new BadRequestException(
          `Order total must be at least ${minAmt.toFixed(2)} to use this discount`,
        );
      }

      const pct = toNum(discount.discountPct);
      const flatAmt = toNum(discount.discountAmt);

      if (pct > 0) {
        discountAmount = roundMoney(rawTotal * (pct / 100));
      } else if (flatAmt > 0) {
        discountAmount = roundMoney(Math.min(rawTotal, flatAmt));
      }

      rawTotal = Math.max(0, rawTotal - discountAmount);
      discountId = discount.id;
    }

    const shippingFee = calculateShippingFee(address.country, address.city);
    const taxAmount = 0;
    const totalAmount = roundMoney(rawTotal + shippingFee + taxAmount);

    // 6. Commit atomically: deduct stock + create order
    try {
      return await this.prisma.$transaction(async (tx) => {
        const stockMovements: Prisma.InventoryMovementCreateManyInput[] = [];

        // Stock deduction
        for (const item of items) {
          const updated = await tx.productVariant.updateMany({
            where: {
              id: item.productVariantId,
              isActive: true,
              stock: { gte: item.quantity },
              product: { isActive: true, deletedAt: null },
            },
            data: { stock: { decrement: item.quantity } },
          });

          if (updated.count !== 1) {
            const variant = variantMap.get(item.productVariantId);
            throw new BadRequestException(
              variant
                ? `Insufficient stock for SKU "${variant.sku}"`
                : 'One or more product variants are unavailable',
            );
          }

          const currentVariant = await tx.productVariant.findUnique({
            where: { id: item.productVariantId },
            select: { stock: true },
          });
          const stockAfter = currentVariant?.stock;
          stockMovements.push({
            productVariantId: item.productVariantId,
            type: InventoryMovementType.ORDER_PLACED,
            quantity: -item.quantity,
            stockBefore:
              stockAfter === undefined ? undefined : stockAfter + item.quantity,
            stockAfter,
            note: 'Order placed',
          });
        }

        // Increment discount usage
        if (discountId) {
          await tx.discount.update({
            where: { id: discountId },
            data: { usedCount: { increment: 1 } },
          });
        }

        const order = await tx.order.create({
          data: {
            userId,
            shippingAddressId: dto.shippingAddressId,
            discountId,
            idempotencyKey: dto.idempotencyKey,
            subtotalAmount,
            discountAmount,
            shippingFee,
            taxAmount,
            totalAmount,
            shippingLabel: address.label,
            shippingMethod: dto.shippingMethod ?? 'STANDARD',
            courierName: null,
            trackingNumber: null,
            shippingStreet: address.street,
            shippingCity: address.city,
            shippingState: address.state,
            shippingPostalCode: address.postalCode,
            shippingCountry: address.country,
            shippedAt: null,
            deliveredAt: null,
            notes: dto.notes,
            items: {
              create: lineItems.map((li) => ({
                productVariantId: li.productVariantId,
                quantity: li.quantity,
                unitPrice: roundMoney(li.unitPrice),
                subtotal: roundMoney(li.subtotal),
              })),
            },
            statusLogs: {
              create: { status: OrderStatus.PENDING, note: 'Order placed' },
            },
          },
          include: this.customerOrderInclude,
        });

        if (stockMovements.length > 0) {
          await tx.inventoryMovement.createMany({
            data: stockMovements.map((movement) => ({
              ...movement,
              orderId: order.id,
            })),
          });
        }

        return order;
      });
    } catch (error) {
      if (
        dto.idempotencyKey &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existingOrder = await this.findByIdempotencyKey(
          userId,
          dto.idempotencyKey,
        );
        if (existingOrder) return existingOrder;
      }
      throw error;
    }
  }

  private mergeDuplicateItems(items: CreateOrderDto['items']) {
    const itemMap = new Map<
      string,
      { productVariantId: string; quantity: number }
    >();

    for (const item of items) {
      const existing = itemMap.get(item.productVariantId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        itemMap.set(item.productVariantId, { ...item });
      }
    }

    return [...itemMap.values()];
  }

  private findByIdempotencyKey(userId: string, idempotencyKey: string) {
    return this.prisma.order.findFirst({
      where: { userId, idempotencyKey },
      include: this.customerOrderInclude,
    });
  }

  // ─── Customer: list own orders ────────────────────────────────────────────

  async findMyOrders(userId: string, query: OrderQueryDto) {
    const { status, page = 1, limit = 20 } = query;

    const where: Prisma.OrderWhereInput = {
      userId,
      ...(status && { status }),
    };

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              productVariant: {
                select: { id: true, sku: true, size: true, color: true },
              },
            },
          },
          payment: { select: { status: true, paidAt: true } },
        },
      }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Customer: get single own order ──────────────────────────────────────

  async findMyOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            productVariant: {
              select: { id: true, sku: true, size: true, color: true },
            },
          },
        },
        shippingAddress: true,
        discount: { select: { id: true, code: true } },
        payment: true,
        statusLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─── Customer: cancel own order ───────────────────────────────────────────

  async cancelMyOrder(
    userId: string,
    orderId: string,
    auditContext: AuditContext = {},
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (!ALLOWED_TRANSITIONS[order.status].includes(OrderStatus.CANCELLED)) {
      throw new BadRequestException(
        `Cannot cancel an order with status "${order.status}"`,
      );
    }

    return this._transitionStatus(order, OrderStatus.CANCELLED, {
      note: 'Cancelled by customer',
      restoreStock: RESTORE_STOCK_FROM.has(order.status),
      auditContext,
    });
  }

  // ─── Admin: list all orders ───────────────────────────────────────────────

  async findAll(query: OrderQueryDto) {
    const { status, page = 1, limit = 20 } = query;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status }),
    };

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              productVariant: {
                select: { id: true, sku: true, size: true, color: true },
              },
            },
          },
          payment: { select: { status: true, paidAt: true } },
        },
      }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Admin: get single order ──────────────────────────────────────────────

  async findOne(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: {
          include: {
            productVariant: {
              select: { id: true, sku: true, size: true, color: true },
            },
          },
        },
        shippingAddress: true,
        discount: { select: { id: true, code: true } },
        payment: true,
        statusLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─── Admin: update order status ───────────────────────────────────────────

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    auditContext: AuditContext = {},
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (!ALLOWED_TRANSITIONS[order.status].includes(dto.status)) {
      throw new BadRequestException(
        `Transition from "${order.status}" to "${dto.status}" is not allowed`,
      );
    }

    return this._transitionStatus(order, dto.status, {
      note: dto.note,
      restoreStock:
        dto.status === OrderStatus.CANCELLED &&
        RESTORE_STOCK_FROM.has(order.status),
      auditContext,
    });
  }

  async updateShipping(
    orderId: string,
    dto: UpdateOrderShippingDto,
    auditContext: AuditContext = {},
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          ...(dto.shippingMethod !== undefined && {
            shippingMethod: dto.shippingMethod,
          }),
          ...(dto.courierName !== undefined && { courierName: dto.courierName }),
          ...(dto.trackingNumber !== undefined && {
            trackingNumber: dto.trackingNumber,
          }),
          ...(dto.shippedAt !== undefined && { shippedAt: dto.shippedAt }),
          ...(dto.deliveredAt !== undefined && { deliveredAt: dto.deliveredAt }),
        },
        include: {
          statusLogs: { orderBy: { createdAt: 'asc' } },
        },
      });

      await this.audit.create(
        {
          ...auditContext,
          action: 'ORDER_SHIPPING_UPDATED',
          targetType: 'Order',
          targetId: orderId,
          metadata: {
            previous: {
              shippingMethod: order.shippingMethod,
              courierName: order.courierName,
              trackingNumber: order.trackingNumber,
              shippedAt: order.shippedAt?.toISOString() ?? null,
              deliveredAt: order.deliveredAt?.toISOString() ?? null,
            },
            next: {
              shippingMethod: updated.shippingMethod,
              courierName: updated.courierName,
              trackingNumber: updated.trackingNumber,
              shippedAt: updated.shippedAt?.toISOString() ?? null,
              deliveredAt: updated.deliveredAt?.toISOString() ?? null,
            },
          },
        },
        tx,
      );

      return updated;
    });

    return updatedOrder;
  }

  // ─── Admin: status log ────────────────────────────────────────────────────

  async findStatusLogs(orderId: string) {
    await this.findOne(orderId); // ensures order exists + 404 if not
    return this.prisma.orderStatusLog.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Private: shared atomic status transition ─────────────────────────────

  private async _transitionStatus(
    order: {
      id: string;
      status: OrderStatus;
      items: { productVariantId: string; quantity: number }[];
    },
    newStatus: OrderStatus,
    opts: { note?: string; restoreStock: boolean; auditContext?: AuditContext },
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (opts.restoreStock) {
        for (const item of order.items) {
          const variant = await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stock: { increment: item.quantity } },
            select: { stock: true },
          });

          await tx.inventoryMovement.create({
            data: {
              productVariantId: item.productVariantId,
              orderId: order.id,
              type: InventoryMovementType.ORDER_CANCELLED,
              quantity: item.quantity,
              stockBefore: variant.stock - item.quantity,
              stockAfter: variant.stock,
              note: 'Order cancelled',
            },
          });
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          statusLogs: {
            create: { status: newStatus, note: opts.note ?? null },
          },
        },
        include: {
          statusLogs: { orderBy: { createdAt: 'asc' } },
        },
      });

      await this.audit.create(
        {
          ...opts.auditContext,
          action: 'ORDER_STATUS_UPDATED',
          targetType: 'Order',
          targetId: order.id,
          metadata: {
            previousStatus: order.status,
            newStatus,
            note: opts.note ?? null,
            stockRestored: opts.restoreStock,
          },
        },
        tx,
      );

      return updatedOrder;
    });
  }
}
