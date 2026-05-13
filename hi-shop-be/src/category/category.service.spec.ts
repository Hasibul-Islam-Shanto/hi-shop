import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryService } from './category.service';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCategory = {
  id: 'cat-uuid',
  name: 'Sneakers',
  slug: 'sneakers',
  description: 'All sneakers',
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  parent: null,
  children: [],
  _count: { products: 0 },
};

const mockParentCategory = {
  ...mockCategory,
  id: 'parent-uuid',
  name: 'Shoes',
  slug: 'shoes',
};

// ─── Mock Factory ─────────────────────────────────────────────────────────────

const createMockPrisma = () => ({
  category: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  product: {
    count: jest.fn(),
  },
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a top-level category with auto-generated slug', async () => {
      prisma.category.findFirst.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue(mockCategory);

      const result = await service.create({ name: 'Sneakers' });

      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'sneakers', parentId: null }),
        }),
      );
      expect(result).toEqual(mockCategory);
    });

    it('uses provided slug when given', async () => {
      prisma.category.findFirst.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue(mockCategory);

      await service.create({ name: 'Sneakers', slug: 'custom-slug' });

      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'custom-slug' }),
        }),
      );
    });

    it('creates a subcategory when parentId is provided', async () => {
      prisma.category.findFirst.mockResolvedValue(null);
      prisma.category.findUnique.mockResolvedValue(mockParentCategory);
      prisma.category.create.mockResolvedValue({
        ...mockCategory,
        parentId: 'parent-uuid',
      });

      const result = await service.create({
        name: 'Sneakers',
        parentId: 'parent-uuid',
      });

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'parent-uuid' },
      });
      expect(result.parentId).toBe('parent-uuid');
    });

    it('throws BadRequestException when slug already in use', async () => {
      prisma.category.findFirst.mockResolvedValue(mockCategory);

      await expect(service.create({ name: 'Sneakers' })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.category.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when parentId does not exist', async () => {
      prisma.category.findFirst.mockResolvedValue(null);
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Sneakers', parentId: 'bad-parent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findAllTree ───────────────────────────────────────────────────────────

  describe('findAllTree', () => {
    it('returns only top-level categories with nested children', async () => {
      const tree = [
        {
          ...mockParentCategory,
          children: [mockCategory],
          _count: { products: 0 },
        },
      ];
      prisma.category.findMany.mockResolvedValue(tree);

      const result = await service.findAllTree();

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { parentId: null } }),
      );
      expect(result).toEqual(tree);
    });
  });

  // ─── findAllFlat ───────────────────────────────────────────────────────────

  describe('findAllFlat', () => {
    it('returns all categories as a flat list', async () => {
      prisma.category.findMany.mockResolvedValue([
        mockCategory,
        mockParentCategory,
      ]);

      const result = await service.findAllFlat();

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      );
      expect(result).toHaveLength(2);
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns category when found', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('cat-uuid');

      expect(prisma.category.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'cat-uuid' } }),
      );
      expect(result).toEqual(mockCategory);
    });

    it('throws NotFoundException when category not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── findBySlug ────────────────────────────────────────────────────────────

  describe('findBySlug', () => {
    it('returns category by slug', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findBySlug('sneakers');

      expect(prisma.category.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'sneakers' } }),
      );
      expect(result).toEqual(mockCategory);
    });

    it('throws NotFoundException when slug not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates category name', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.update.mockResolvedValue({
        ...mockCategory,
        name: 'Updated Name',
      });

      const result = await service.update('cat-uuid', { name: 'Updated Name' });

      expect(prisma.category.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'cat-uuid' } }),
      );
      expect(result.name).toBe('Updated Name');
    });

    it('throws NotFoundException when category not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.update('bad-uuid', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when new slug is already taken', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.findFirst.mockResolvedValue({ id: 'other-cat' });

      await expect(
        service.update('cat-uuid', { slug: 'taken-slug' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when new parentId does not exist', async () => {
      prisma.category.findUnique
        .mockResolvedValueOnce(mockCategory) // findOne succeeds
        .mockResolvedValueOnce(null); // ensureParentExists fails

      await expect(
        service.update('cat-uuid', { parentId: 'non-existent-parent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when setting itself as parent', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.update('cat-uuid', { parentId: 'cat-uuid' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException on circular reference', async () => {
      // cat-uuid wants to set parent to child-uuid
      // but child-uuid already has cat-uuid as its parent → circular
      const childCategory = {
        ...mockCategory,
        id: 'child-uuid',
        parentId: 'cat-uuid',
      };

      prisma.category.findUnique
        .mockResolvedValueOnce(mockCategory) // findOne: cat-uuid found
        .mockResolvedValueOnce(childCategory) // ensureParentExists: child-uuid found
        .mockResolvedValueOnce({ parentId: 'cat-uuid' }); // cycle walk: child's parent is cat-uuid

      await expect(
        service.update('cat-uuid', { parentId: 'child-uuid' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes category when no products or children', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.product.count.mockResolvedValue(0);
      prisma.category.count.mockResolvedValue(0);
      prisma.category.delete.mockResolvedValue({});

      const result = await service.remove('cat-uuid');

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-uuid' },
      });
      expect(result).toEqual({ success: true });
    });

    it('throws BadRequestException when category has active products', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.product.count.mockResolvedValue(3);

      await expect(service.remove('cat-uuid')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when category has subcategories', async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.product.count.mockResolvedValue(0);
      prisma.category.count.mockResolvedValue(2);

      await expect(service.remove('cat-uuid')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when category not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
