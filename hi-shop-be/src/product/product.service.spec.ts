import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from './product.service';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCategory = { id: 'cat-uuid', name: 'Sneakers', slug: 'sneakers' };

const mockVariant = {
  id: 'var-uuid',
  productId: 'prod-uuid',
  sku: 'SKU-001',
  size: '42',
  color: 'White',
  stock: 50,
  priceModifier: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockImage = {
  id: 'img-uuid',
  productId: 'prod-uuid',
  url: 'https://cdn.hi-shop.com/img.jpg',
  altText: 'Product image',
  isPrimary: true,
  sortOrder: 0,
};

const mockProduct = {
  id: 'prod-uuid',
  categoryId: 'cat-uuid',
  name: 'Classic White Sneakers',
  slug: 'classic-white-sneakers',
  description: 'Great sneakers',
  basePrice: 49.99,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  category: mockCategory,
  variants: [mockVariant],
  images: [mockImage],
};

// ─── Mock Factory ─────────────────────────────────────────────────────────────

const createMockPrisma = () => ({
  product: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  productVariant: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  inventoryMovement: {
    create: jest.fn(),
  },
  productImage: {
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
  },
  orderItem: {
    count: jest.fn(),
  },
  review: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
});

const createMockAudit = () => ({
  create: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductService', () => {
  let service: ProductService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let audit: ReturnType<typeof createMockAudit>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    audit = createMockAudit();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto = {
      categoryId: 'cat-uuid',
      name: 'Classic White Sneakers',
      basePrice: 49.99,
      variants: [{ sku: 'SKU-001', stock: 50, size: '42', color: 'White' }],
    };

    it('creates product with auto-generated slug when slug is omitted', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.productVariant.findMany.mockResolvedValue([]);
      prisma.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(dto);

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'classic-white-sneakers' }),
        }),
      );
      expect(result).toEqual(mockProduct);
    });

    it('uses provided slug when given', async () => {
      const dtoWithSlug = { ...dto, slug: 'my-custom-slug' };
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.productVariant.findMany.mockResolvedValue([]);
      prisma.product.create.mockResolvedValue(mockProduct);

      await service.create(dtoWithSlug);

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'my-custom-slug' }),
        }),
      );
    });

    it('throws NotFoundException when category does not exist', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when slug already in use', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.product.findFirst.mockResolvedValue(mockProduct);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException on duplicate SKUs within the same request', async () => {
      const dtoWithDupSkus = {
        ...dto,
        variants: [
          { sku: 'SAME-SKU', stock: 10 },
          { sku: 'SAME-SKU', stock: 20 },
        ],
      };
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(service.create(dtoWithDupSkus)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when a SKU already exists globally', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.product.findFirst.mockResolvedValue(null);
      prisma.productVariant.findMany.mockResolvedValue([{ sku: 'SKU-001' }]);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('returns paginated products with correct meta', async () => {
      prisma.$transaction.mockResolvedValue([1, [mockProduct]]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual([mockProduct]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('calculates totalPages correctly', async () => {
      prisma.$transaction.mockResolvedValue([55, []]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.meta.totalPages).toBe(3);
    });

    it('defaults isActive to true when not provided', async () => {
      prisma.$transaction.mockResolvedValue([0, []]);

      await service.findAll({});

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns the product when found', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);

      const result = await service.findOne('prod-uuid');

      expect(prisma.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-uuid', deletedAt: null },
        }),
      );
      expect(result).toEqual(mockProduct);
    });

    it('throws NotFoundException when product does not exist', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── findBySlug ────────────────────────────────────────────────────────────

  describe('findBySlug', () => {
    it('returns product by slug', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);

      const result = await service.findBySlug('classic-white-sneakers');

      expect(result).toEqual(mockProduct);
    });

    it('throws NotFoundException when slug not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(service.findBySlug('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates product successfully', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue({
        ...mockProduct,
        basePrice: 39.99,
      });

      const result = await service.update('prod-uuid', { basePrice: 39.99 });

      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'prod-uuid' } }),
      );
      expect(result.basePrice).toBe(39.99);
    });

    it('throws NotFoundException when product not found', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(service.update('bad-id', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when new slug is already taken', async () => {
      prisma.product.findFirst
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce({ id: 'other-product' });

      await expect(
        service.update('prod-uuid', { slug: 'existing-slug' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when new categoryId does not exist', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update('prod-uuid', { categoryId: 'bad-cat' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('soft-deletes product by setting deletedAt', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue({});

      const result = await service.remove('prod-uuid');

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-uuid' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      });
      expect(result).toEqual({ success: true });
    });
  });

  // ─── addVariant ────────────────────────────────────────────────────────────

  describe('addVariant', () => {
    const variantDto = { sku: 'NEW-SKU', stock: 10, size: '43', color: 'Red' };

    it('adds a new variant to an existing product', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.productVariant.findUnique.mockResolvedValue(null);
      prisma.productVariant.create.mockResolvedValue({
        ...mockVariant,
        sku: 'NEW-SKU',
      });

      const result = await service.addVariant('prod-uuid', variantDto);

      expect(prisma.productVariant.create).toHaveBeenCalled();
      expect(result.sku).toBe('NEW-SKU');
    });

    it('throws BadRequestException when SKU already exists', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.productVariant.findUnique.mockResolvedValue(mockVariant);

      await expect(service.addVariant('prod-uuid', variantDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── updateVariant ─────────────────────────────────────────────────────────

  describe('updateVariant', () => {
    it('updates variant fields', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(mockVariant);
      prisma.productVariant.update.mockResolvedValue({
        ...mockVariant,
        stock: 999,
      });

      const result = await service.updateVariant('prod-uuid', 'var-uuid', {
        stock: 999,
      });

      expect(result.stock).toBe(999);
    });

    it('throws NotFoundException when variant not found', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(null);

      await expect(
        service.updateVariant('prod-uuid', 'bad-var', { stock: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when new SKU is already taken', async () => {
      prisma.productVariant.findFirst
        .mockResolvedValueOnce(mockVariant)
        .mockResolvedValueOnce({ id: 'other-variant' });

      await expect(
        service.updateVariant('prod-uuid', 'var-uuid', { sku: 'TAKEN-SKU' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── adjustInventory ───────────────────────────────────────────────────────

  describe('adjustInventory', () => {
    it('updates stock and records inventory movement with audit log', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(mockVariant);

      const mockTx = {
        productVariant: {
          update: jest.fn().mockResolvedValue({ ...mockVariant, stock: 80 }),
        },
        inventoryMovement: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
      );
      audit.create.mockResolvedValue({});

      const result = await service.adjustInventory(
        'prod-uuid',
        'var-uuid',
        { stock: 80, note: 'Restock' },
        { actorId: 'admin-uuid' },
      );

      expect(mockTx.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'var-uuid' },
        data: { stock: 80 },
      });
      expect(mockTx.inventoryMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productVariantId: 'var-uuid',
          quantity: 30,
          stockBefore: 50,
          stockAfter: 80,
          note: 'Restock',
        }),
      });
      expect(audit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'INVENTORY_ADJUSTED',
          targetId: 'var-uuid',
        }),
        mockTx,
      );
      expect(result.stock).toBe(80);
    });

    it('throws NotFoundException when adjusting missing variant', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(null);

      await expect(
        service.adjustInventory('prod-uuid', 'bad-var', {
          stock: 10,
          note: 'Correction',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── removeVariant ─────────────────────────────────────────────────────────

  describe('removeVariant', () => {
    it('deletes variant when safe to do so', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(mockVariant);
      prisma.productVariant.count.mockResolvedValue(3);
      prisma.orderItem.count.mockResolvedValue(0);
      prisma.productVariant.delete.mockResolvedValue({});

      const result = await service.removeVariant('prod-uuid', 'var-uuid');

      expect(prisma.productVariant.delete).toHaveBeenCalledWith({
        where: { id: 'var-uuid' },
      });
      expect(result).toEqual({ success: true });
    });

    it('throws BadRequestException when it is the last variant', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(mockVariant);
      prisma.productVariant.count.mockResolvedValue(1);

      await expect(
        service.removeVariant('prod-uuid', 'var-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when variant has order history', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(mockVariant);
      prisma.productVariant.count.mockResolvedValue(3);
      prisma.orderItem.count.mockResolvedValue(5);

      await expect(
        service.removeVariant('prod-uuid', 'var-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when variant not found', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(null);

      await expect(
        service.removeVariant('prod-uuid', 'bad-var'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── addImage ──────────────────────────────────────────────────────────────

  describe('addImage', () => {
    it('demotes existing primary images then creates new primary image', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);

      const mockTx = {
        productImage: {
          updateMany: jest.fn().mockResolvedValue({}),
          create: jest.fn().mockResolvedValue(mockImage),
        },
      };
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
      );

      await service.addImage('prod-uuid', {
        url: 'https://cdn.hi-shop.com/img.jpg',
        isPrimary: true,
      });

      expect(mockTx.productImage.updateMany).toHaveBeenCalledWith({
        where: { productId: 'prod-uuid' },
        data: { isPrimary: false },
      });
      expect(mockTx.productImage.create).toHaveBeenCalled();
    });

    it('skips demotion when isPrimary is false', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);

      const mockTx = {
        productImage: {
          updateMany: jest.fn(),
          create: jest.fn().mockResolvedValue(mockImage),
        },
      };
      prisma.$transaction.mockImplementation(
        (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
      );

      await service.addImage('prod-uuid', {
        url: 'https://cdn.hi-shop.com/img.jpg',
        isPrimary: false,
      });

      expect(mockTx.productImage.updateMany).not.toHaveBeenCalled();
    });
  });

  // ─── removeImage ───────────────────────────────────────────────────────────

  describe('removeImage', () => {
    it('deletes image when found', async () => {
      prisma.productImage.findFirst.mockResolvedValue(mockImage);
      prisma.productImage.delete.mockResolvedValue({});

      const result = await service.removeImage('prod-uuid', 'img-uuid');

      expect(prisma.productImage.delete).toHaveBeenCalledWith({
        where: { id: 'img-uuid' },
      });
      expect(result).toEqual({ success: true });
    });

    it('throws NotFoundException when image not found', async () => {
      prisma.productImage.findFirst.mockResolvedValue(null);

      await expect(service.removeImage('prod-uuid', 'bad-img')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── findReviews ───────────────────────────────────────────────────────────

  describe('findReviews', () => {
    it('returns paginated reviews with meta', async () => {
      prisma.product.findFirst.mockResolvedValue(mockProduct);
      prisma.$transaction.mockResolvedValue([5, [{ id: 'rev-1', rating: 5 }]]);

      const result = await service.findReviews('prod-uuid', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(5);
      expect(result.meta.totalPages).toBe(1);
    });

    it('throws NotFoundException when product does not exist', async () => {
      prisma.product.findFirst.mockResolvedValue(null);

      await expect(
        service.findReviews('bad-prod', { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
