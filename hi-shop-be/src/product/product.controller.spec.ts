import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

// ─── Mock Service ─────────────────────────────────────────────────────────────

const mockProductService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findBySlug: jest.fn(),
  findReviews: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addVariant: jest.fn(),
  updateVariant: jest.fn(),
  removeVariant: jest.fn(),
  addImage: jest.fn(),
  removeImage: jest.fn(),
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockProduct = {
  id: 'prod-uuid',
  name: 'Classic White Sneakers',
  slug: 'classic-white-sneakers',
  basePrice: 49.99,
};

const mockVariant = { id: 'var-uuid', sku: 'SKU-001', stock: 50 };
const mockImage = { id: 'img-uuid', url: 'https://cdn.hi-shop.com/img.jpg' };
const mockPaginated = {
  data: [mockProduct],
  meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── Public reads ──────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('delegates to service.findAll with query params', async () => {
      mockProductService.findAll.mockResolvedValue(mockPaginated);
      const query = { page: 1, limit: 20 };

      const result = await controller.findAll(query as any);

      expect(mockProductService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginated);
    });
  });

  describe('findOne', () => {
    it('delegates to service.findOne with the id', async () => {
      mockProductService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('prod-uuid');

      expect(mockProductService.findOne).toHaveBeenCalledWith('prod-uuid');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findBySlug', () => {
    it('delegates to service.findBySlug with the slug', async () => {
      mockProductService.findBySlug.mockResolvedValue(mockProduct);

      const result = await controller.findBySlug('classic-white-sneakers');

      expect(mockProductService.findBySlug).toHaveBeenCalledWith(
        'classic-white-sneakers',
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findReviews', () => {
    it('delegates to service.findReviews with id and query', async () => {
      const reviews = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockProductService.findReviews.mockResolvedValue(reviews);

      const result = await controller.findReviews('prod-uuid', {
        page: 1,
        limit: 10,
      } as any);

      expect(mockProductService.findReviews).toHaveBeenCalledWith('prod-uuid', {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(reviews);
    });
  });

  // ─── Admin writes ──────────────────────────────────────────────────────────

  describe('create', () => {
    it('delegates to service.create with dto', async () => {
      mockProductService.create.mockResolvedValue(mockProduct);
      const dto = {
        name: 'Classic White Sneakers',
        basePrice: 49.99,
        categoryId: 'cat-uuid',
        variants: [],
      };

      const result = await controller.create(dto as any);

      expect(mockProductService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('delegates to service.update with id and dto', async () => {
      mockProductService.update.mockResolvedValue({
        ...mockProduct,
        basePrice: 39.99,
      });

      const result = await controller.update('prod-uuid', { basePrice: 39.99 });

      expect(mockProductService.update).toHaveBeenCalledWith('prod-uuid', {
        basePrice: 39.99,
      });
      expect(result.basePrice).toBe(39.99);
    });
  });

  describe('remove', () => {
    it('delegates to service.remove', async () => {
      mockProductService.remove.mockResolvedValue({ success: true });

      const result = await controller.remove('prod-uuid');

      expect(mockProductService.remove).toHaveBeenCalledWith('prod-uuid');
      expect(result).toEqual({ success: true });
    });
  });

  // ─── Variant management ────────────────────────────────────────────────────

  describe('addVariant', () => {
    it('delegates to service.addVariant', async () => {
      mockProductService.addVariant.mockResolvedValue(mockVariant);
      const dto = { sku: 'SKU-002', stock: 10 };

      const result = await controller.addVariant('prod-uuid', dto as any);

      expect(mockProductService.addVariant).toHaveBeenCalledWith(
        'prod-uuid',
        dto,
      );
      expect(result).toEqual(mockVariant);
    });
  });

  describe('updateVariant', () => {
    it('delegates to service.updateVariant', async () => {
      mockProductService.updateVariant.mockResolvedValue({
        ...mockVariant,
        stock: 99,
      });

      const result = await controller.updateVariant('prod-uuid', 'var-uuid', {
        stock: 99,
      });

      expect(mockProductService.updateVariant).toHaveBeenCalledWith(
        'prod-uuid',
        'var-uuid',
        { stock: 99 },
      );
      expect(result.stock).toBe(99);
    });
  });

  describe('removeVariant', () => {
    it('delegates to service.removeVariant', async () => {
      mockProductService.removeVariant.mockResolvedValue({ success: true });

      const result = await controller.removeVariant('prod-uuid', 'var-uuid');

      expect(mockProductService.removeVariant).toHaveBeenCalledWith(
        'prod-uuid',
        'var-uuid',
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ─── Image management ──────────────────────────────────────────────────────

  describe('addImage', () => {
    it('delegates to service.addImage', async () => {
      mockProductService.addImage.mockResolvedValue(mockImage);
      const dto = { url: 'https://cdn.hi-shop.com/img.jpg', isPrimary: true };

      const result = await controller.addImage('prod-uuid', dto as any);

      expect(mockProductService.addImage).toHaveBeenCalledWith(
        'prod-uuid',
        dto,
      );
      expect(result).toEqual(mockImage);
    });
  });

  describe('removeImage', () => {
    it('delegates to service.removeImage', async () => {
      mockProductService.removeImage.mockResolvedValue({ success: true });

      const result = await controller.removeImage('prod-uuid', 'img-uuid');

      expect(mockProductService.removeImage).toHaveBeenCalledWith(
        'prod-uuid',
        'img-uuid',
      );
      expect(result).toEqual({ success: true });
    });
  });
});
