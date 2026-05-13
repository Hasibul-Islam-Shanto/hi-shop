import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryMovementType, OrderStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderService } from './order.service';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const userId = 'user-uuid';
const orderId = 'order-uuid';
const variantId = 'var-uuid';
const addressId = 'addr-uuid';

const mockAddress = {
  id: addressId,
  userId,
  label: 'Home',
  street: '123 Main St',
  city: 'Dhaka',
  state: 'Dhaka',
  postalCode: '1207',
  country: 'BD',
  isDefault: true,
};

const mockVariant = {
  id: variantId,
  sku: 'SKU-001',
  size: 'M',
  color: 'White',
  stock: 10,
  priceModifier: { toString: () => '0' },
  isActive: true,
  product: {
    basePrice: { toString: () => '49.99' },
    isActive: true,
    deletedAt: null,
  },
};

const mockOrder = {
  id: orderId,
  userId,
  status: OrderStatus.PENDING,
  totalAmount: { toString: () => '49.99' },
  items: [{ productVariantId: variantId, quantity: 1 }],
  statusLogs: [{ status: OrderStatus.PENDING, createdAt: new Date() }],
};

const mockDiscount = {
  id: 'disc-uuid',
  code: 'SAVE10',
  isActive: true,
  expiresAt: null,
  maxUses: null,
  usedCount: 0,
  minOrderAmt: null,
  discountPct: { toString: () => '10' },
  discountAmt: null,
};

// ─── Mock Factory ─────────────────────────────────────────────────────────────

const createMockPrisma = () => ({
  address: { findFirst: jest.fn() },
  productVariant: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  discount: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  orderStatusLog: { findMany: jest.fn() },
  inventoryMovement: {
    create: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
});

const createMockAudit = () => ({
  create: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OrderService', () => {
  let service: OrderService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let audit: ReturnType<typeof createMockAudit>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    audit = createMockAudit();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      shippingAddressId: addressId,
      items: [{ productVariantId: variantId, quantity: 2 }],
    };

    it('places an order and returns it (happy path)', async () => {
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.productVariant.findMany.mockResolvedValue([
        { ...mockVariant, stock: 10 },
      ]);
      // $transaction callback form
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma as any),
      );
      prisma.productVariant.updateMany.mockResolvedValue({ count: 1 });
      prisma.productVariant.findUnique.mockResolvedValue({ stock: 8 });
      prisma.inventoryMovement.createMany.mockResolvedValue({ count: 1 });
      prisma.order.create.mockResolvedValue({ ...mockOrder, items: [] });

      const result = await service.create(userId, dto);

      expect(prisma.address.findFirst).toHaveBeenCalledWith({
        where: { id: addressId, userId },
      });
      expect(prisma.productVariant.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: variantId,
            stock: { gte: 2 },
          }),
          data: { stock: { decrement: 2 } },
        }),
      );
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotalAmount: 99.98,
            discountAmount: 0,
            shippingFee: 60,
            taxAmount: 0,
            totalAmount: 159.98,
            shippingLabel: mockAddress.label,
            shippingMethod: 'STANDARD',
            shippingStreet: mockAddress.street,
            shippingCity: mockAddress.city,
            shippingState: mockAddress.state,
            shippingPostalCode: mockAddress.postalCode,
            shippingCountry: mockAddress.country,
          }),
        }),
      );
      expect(prisma.inventoryMovement.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            orderId,
            productVariantId: variantId,
            type: InventoryMovementType.ORDER_PLACED,
            quantity: -2,
            stockBefore: 10,
            stockAfter: 8,
          }),
        ],
      });
      expect(result).toBeDefined();
    });

    it('returns existing order when idempotency key was already used', async () => {
      const existingOrder = { ...mockOrder, idempotencyKey: 'checkout-1' };
      prisma.order.findFirst.mockResolvedValue(existingOrder);

      const result = await service.create(userId, {
        ...dto,
        idempotencyKey: 'checkout-1',
      });

      expect(result).toEqual(existingOrder);
      expect(prisma.address.findFirst).not.toHaveBeenCalled();
      expect(prisma.order.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when shipping address not found', async () => {
      prisma.address.findFirst.mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.productVariant.findMany).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when a variant is invalid or inactive', async () => {
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      // findMany returns fewer items than requested → one missing
      prisma.productVariant.findMany.mockResolvedValue([]);

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when product is soft-deleted', async () => {
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.productVariant.findMany.mockResolvedValue([
        {
          ...mockVariant,
          product: { ...mockVariant.product, deletedAt: new Date() },
        },
      ]);

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when stock is insufficient', async () => {
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.productVariant.findMany.mockResolvedValue([
        { ...mockVariant, stock: 1 }, // requested 2, only 1 in stock
      ]);

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('applies percentage discount when a valid discount code is provided', async () => {
      const dtoWithDiscount = { ...dto, discountCode: 'SAVE10' };
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.productVariant.findMany.mockResolvedValue([mockVariant]);
      prisma.discount.findUnique.mockResolvedValue(mockDiscount);
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma as any),
      );
      prisma.productVariant.updateMany.mockResolvedValue({ count: 1 });
      prisma.productVariant.findUnique.mockResolvedValue({ stock: 8 });
      prisma.inventoryMovement.createMany.mockResolvedValue({ count: 1 });
      prisma.discount.update.mockResolvedValue({});
      prisma.order.create.mockResolvedValue({ ...mockOrder, items: [] });

      await service.create(userId, dtoWithDiscount);

      expect(prisma.discount.update).toHaveBeenCalledWith({
        where: { id: mockDiscount.id },
        data: { usedCount: { increment: 1 } },
      });
    });

    it('throws BadRequestException when concurrent checkout consumes stock first', async () => {
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.productVariant.findMany.mockResolvedValue([
        { ...mockVariant, stock: 10 },
      ]);
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma as any),
      );
      prisma.productVariant.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.order.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for invalid discount code', async () => {
      const dtoWithDiscount = { ...dto, discountCode: 'BAD_CODE' };
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.productVariant.findMany.mockResolvedValue([mockVariant]);
      prisma.discount.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, dtoWithDiscount)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException for expired discount', async () => {
      const dtoWithDiscount = { ...dto, discountCode: 'EXPIRED' };
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.productVariant.findMany.mockResolvedValue([mockVariant]);
      prisma.discount.findUnique.mockResolvedValue({
        ...mockDiscount,
        expiresAt: new Date('2000-01-01'),
      });

      await expect(service.create(userId, dtoWithDiscount)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when discount maxUses is exhausted', async () => {
      const dtoWithDiscount = { ...dto, discountCode: 'MAXED' };
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.productVariant.findMany.mockResolvedValue([mockVariant]);
      prisma.discount.findUnique.mockResolvedValue({
        ...mockDiscount,
        maxUses: 5,
        usedCount: 5,
      });

      await expect(service.create(userId, dtoWithDiscount)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when order total is below minOrderAmt', async () => {
      const dtoWithDiscount = { ...dto, discountCode: 'MINAMT' };
      prisma.address.findFirst.mockResolvedValue(mockAddress);
      prisma.productVariant.findMany.mockResolvedValue([mockVariant]);
      prisma.discount.findUnique.mockResolvedValue({
        ...mockDiscount,
        minOrderAmt: { toString: () => '1000' }, // total = ~99.98, below 1000
      });

      await expect(service.create(userId, dtoWithDiscount)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── findMyOrders ──────────────────────────────────────────────────────────

  describe('findMyOrders', () => {
    it('returns paginated orders for the user', async () => {
      prisma.$transaction.mockResolvedValue([1, [mockOrder]]);

      const result = await service.findMyOrders(userId, { page: 1, limit: 10 });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by status when provided', async () => {
      prisma.$transaction.mockResolvedValue([0, []]);

      await service.findMyOrders(userId, {
        status: OrderStatus.DELIVERED,
        page: 1,
        limit: 10,
      });

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ─── findMyOrder ───────────────────────────────────────────────────────────

  describe('findMyOrder', () => {
    it('returns the order when it belongs to the user', async () => {
      prisma.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.findMyOrder(userId, orderId);

      expect(prisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: orderId, userId } }),
      );
      expect(result).toEqual(mockOrder);
    });

    it('throws NotFoundException when order not found or belongs to another user', async () => {
      prisma.order.findFirst.mockResolvedValue(null);

      await expect(service.findMyOrder(userId, orderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── cancelMyOrder ─────────────────────────────────────────────────────────

  describe('cancelMyOrder', () => {
    it('cancels a PENDING order and restores stock', async () => {
      prisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING,
      });
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma as any),
      );
      prisma.productVariant.update.mockResolvedValue({ stock: 11 });
      prisma.inventoryMovement.create.mockResolvedValue({});
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
        statusLogs: [],
      });

      const result = await service.cancelMyOrder(userId, orderId);

      expect(prisma.productVariant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { stock: { increment: 1 } },
        }),
      );
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: OrderStatus.CANCELLED }),
        }),
      );
      expect(prisma.inventoryMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId,
          productVariantId: variantId,
          type: InventoryMovementType.ORDER_CANCELLED,
          quantity: 1,
          stockBefore: 10,
          stockAfter: 11,
        }),
      });
      expect(audit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ORDER_STATUS_UPDATED',
          targetType: 'Order',
          targetId: orderId,
          metadata: expect.objectContaining({
            previousStatus: OrderStatus.PENDING,
            newStatus: OrderStatus.CANCELLED,
            stockRestored: true,
          }),
        }),
        prisma,
      );
      expect(result).toBeDefined();
    });

    it('cancels a CONFIRMED order and restores stock', async () => {
      prisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma as any),
      );
      prisma.productVariant.update.mockResolvedValue({ stock: 11 });
      prisma.inventoryMovement.create.mockResolvedValue({});
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
        statusLogs: [],
      });

      await service.cancelMyOrder(userId, orderId);

      expect(prisma.productVariant.update).toHaveBeenCalled();
    });

    it('throws NotFoundException when order not found', async () => {
      prisma.order.findFirst.mockResolvedValue(null);

      await expect(service.cancelMyOrder(userId, orderId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when cancelling a SHIPPED order', async () => {
      prisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.SHIPPED,
      });

      await expect(service.cancelMyOrder(userId, orderId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when cancelling a terminal CANCELLED order', async () => {
      prisma.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      await expect(service.cancelMyOrder(userId, orderId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── findAll (admin) ───────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated orders for admin', async () => {
      prisma.$transaction.mockResolvedValue([
        3,
        [mockOrder, mockOrder, mockOrder],
      ]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.meta.total).toBe(3);
      expect(result.data).toHaveLength(3);
    });
  });

  // ─── findOne (admin) ───────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns order by ID', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne(orderId);

      expect(prisma.order.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: orderId } }),
      );
      expect(result).toEqual(mockOrder);
    });

    it('throws NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne(orderId)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateStatus (state machine) ─────────────────────────────────────────

  describe('updateStatus', () => {
    it('advances PENDING → CONFIRMED without stock change', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING,
      });
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma as any),
      );
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
        statusLogs: [],
      });

      const result = await service.updateStatus(orderId, {
        status: OrderStatus.CONFIRMED,
      });

      expect(prisma.productVariant.update).not.toHaveBeenCalled();
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: OrderStatus.CONFIRMED }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('advances CONFIRMED → PROCESSING', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma as any),
      );
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PROCESSING,
        statusLogs: [],
      });

      await service.updateStatus(orderId, { status: OrderStatus.PROCESSING });
      expect(prisma.order.update).toHaveBeenCalled();
    });

    it('cancels a PROCESSING order and restores stock', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PROCESSING,
      });
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma as any),
      );
      prisma.productVariant.update.mockResolvedValue({ stock: 11 });
      prisma.inventoryMovement.create.mockResolvedValue({});
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
        statusLogs: [],
      });

      await service.updateStatus(orderId, { status: OrderStatus.CANCELLED });

      expect(prisma.productVariant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { stock: { increment: 1 } },
        }),
      );
    });

    it('does NOT restore stock when cancelling a SHIPPED order', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.SHIPPED,
      });

      // SHIPPED → CANCELLED is not an allowed transition, so it should throw
      await expect(
        service.updateStatus(orderId, { status: OrderStatus.CANCELLED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException on illegal transition (PENDING → DELIVERED)', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING,
      });

      await expect(
        service.updateStatus(orderId, { status: OrderStatus.DELIVERED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when order is in terminal state CANCELLED', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      await expect(
        service.updateStatus(orderId, { status: OrderStatus.CONFIRMED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(orderId, { status: OrderStatus.CONFIRMED }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateShipping ────────────────────────────────────────────────────────

  describe('updateShipping', () => {
    it('updates shipping fields and records audit log', async () => {
      const shippedAt = new Date();
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrder,
        shippingMethod: 'STANDARD',
        courierName: null,
        trackingNumber: null,
        shippedAt: null,
        deliveredAt: null,
      });
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma as any),
      );
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        shippingMethod: 'EXPRESS',
        courierName: 'Pathao',
        trackingNumber: 'TRK-1',
        shippedAt,
        deliveredAt: null,
        statusLogs: [],
      });

      const result = await service.updateShipping(
        orderId,
        {
          shippingMethod: 'EXPRESS',
          courierName: 'Pathao',
          trackingNumber: 'TRK-1',
          shippedAt,
        },
        { actorId: 'admin-uuid' },
      );

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: orderId },
          data: expect.objectContaining({
            shippingMethod: 'EXPRESS',
            courierName: 'Pathao',
            trackingNumber: 'TRK-1',
            shippedAt,
          }),
        }),
      );
      expect(audit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ORDER_SHIPPING_UPDATED',
          targetType: 'Order',
          targetId: orderId,
        }),
        prisma,
      );
      expect(result.shippingMethod).toBe('EXPRESS');
    });

    it('throws NotFoundException when updating shipping for missing order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateShipping(orderId, { courierName: 'Pathao' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findStatusLogs ────────────────────────────────────────────────────────

  describe('findStatusLogs', () => {
    it('returns status logs for an existing order', async () => {
      const logs = [
        {
          id: 'log-1',
          orderId,
          status: OrderStatus.PENDING,
          createdAt: new Date(),
        },
        {
          id: 'log-2',
          orderId,
          status: OrderStatus.CONFIRMED,
          createdAt: new Date(),
        },
      ];
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.orderStatusLog.findMany.mockResolvedValue(logs);

      const result = await service.findStatusLogs(orderId);

      expect(prisma.orderStatusLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { orderId } }),
      );
      expect(result).toHaveLength(2);
    });

    it('throws NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findStatusLogs(orderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
