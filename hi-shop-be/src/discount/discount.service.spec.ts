import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountService } from './discount.service';

const mockDiscount = {
  id: 'discount-uuid',
  code: 'SAVE10',
  description: 'Ten percent off',
  discountPct: 10,
  discountAmt: null,
  minOrderAmt: null,
  maxUses: 100,
  usedCount: 0,
  expiresAt: null,
  isActive: true,
  createdAt: new Date(),
};

const createMockPrisma = () => ({
  discount: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
});

describe('DiscountService', () => {
  let service: DiscountService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DiscountService>(DiscountService);
  });

  afterEach(() => jest.clearAllMocks());

  it('creates a percentage discount', async () => {
    prisma.discount.create.mockResolvedValue(mockDiscount);

    const result = await service.create({
      code: 'SAVE10',
      discountPct: 10,
      maxUses: 100,
    });

    expect(prisma.discount.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ code: 'SAVE10', discountPct: 10 }),
    });
    expect(result).toEqual(mockDiscount);
  });

  it('rejects discounts with both percent and amount', async () => {
    await expect(
      service.create({ code: 'BAD', discountPct: 10, discountAmt: 50 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('maps duplicate code errors to ConflictException', async () => {
    prisma.discount.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({ code: 'SAVE10', discountPct: 10 }),
    ).rejects.toThrow(ConflictException);
  });

  it('returns paginated discounts', async () => {
    prisma.$transaction.mockResolvedValue([1, [mockDiscount]]);

    const result = await service.findAll({
      search: 'SAVE',
      isActive: true,
      page: 1,
      limit: 20,
    });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('throws NotFoundException when discount is missing', async () => {
    prisma.discount.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('deactivates a discount', async () => {
    prisma.discount.findUnique.mockResolvedValue(mockDiscount);
    prisma.discount.update.mockResolvedValue({
      ...mockDiscount,
      isActive: false,
    });

    const result = await service.deactivate('discount-uuid');

    expect(prisma.discount.update).toHaveBeenCalledWith({
      where: { id: 'discount-uuid' },
      data: { isActive: false },
    });
    expect(result.isActive).toBe(false);
  });
});
