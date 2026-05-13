import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

// ─── Mock Service ─────────────────────────────────────────────────────────────

const mockCategoryService = {
  findAllTree: jest.fn(),
  findAllFlat: jest.fn(),
  findOne: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCategory = {
  id: 'cat-uuid',
  name: 'Sneakers',
  slug: 'sneakers',
  parentId: null,
  children: [],
  _count: { products: 3 },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockCategoryService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('calls findAllTree when flat param is not provided', async () => {
      mockCategoryService.findAllTree.mockResolvedValue([mockCategory]);

      const result = await controller.findAll(undefined);

      expect(mockCategoryService.findAllTree).toHaveBeenCalled();
      expect(mockCategoryService.findAllFlat).not.toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });

    it('calls findAllFlat when flat=true is passed', async () => {
      mockCategoryService.findAllFlat.mockResolvedValue([mockCategory]);

      const result = await controller.findAll('true');

      expect(mockCategoryService.findAllFlat).toHaveBeenCalled();
      expect(mockCategoryService.findAllTree).not.toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });

    it('calls findAllTree when flat=false is passed', async () => {
      mockCategoryService.findAllTree.mockResolvedValue([mockCategory]);

      await controller.findAll('false');

      expect(mockCategoryService.findAllTree).toHaveBeenCalled();
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('delegates to service.findOne', async () => {
      mockCategoryService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne('cat-uuid');

      expect(mockCategoryService.findOne).toHaveBeenCalledWith('cat-uuid');
      expect(result).toEqual(mockCategory);
    });
  });

  // ─── findBySlug ────────────────────────────────────────────────────────────

  describe('findBySlug', () => {
    it('delegates to service.findBySlug', async () => {
      mockCategoryService.findBySlug.mockResolvedValue(mockCategory);

      const result = await controller.findBySlug('sneakers');

      expect(mockCategoryService.findBySlug).toHaveBeenCalledWith('sneakers');
      expect(result).toEqual(mockCategory);
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('delegates to service.create with dto', async () => {
      mockCategoryService.create.mockResolvedValue(mockCategory);
      const dto = { name: 'Sneakers' };

      const result = await controller.create(dto);

      expect(mockCategoryService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCategory);
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('delegates to service.update with id and dto', async () => {
      mockCategoryService.update.mockResolvedValue({
        ...mockCategory,
        name: 'Running Shoes',
      });

      const result = await controller.update('cat-uuid', {
        name: 'Running Shoes',
      });

      expect(mockCategoryService.update).toHaveBeenCalledWith('cat-uuid', {
        name: 'Running Shoes',
      });
      expect(result.name).toBe('Running Shoes');
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('delegates to service.remove', async () => {
      mockCategoryService.remove.mockResolvedValue({ success: true });

      const result = await controller.remove('cat-uuid');

      expect(mockCategoryService.remove).toHaveBeenCalledWith('cat-uuid');
      expect(result).toEqual({ success: true });
    });
  });
});
