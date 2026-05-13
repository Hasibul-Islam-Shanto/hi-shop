import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewService } from './review.service';

const userId = 'user-uuid';
const productId = 'prod-uuid';
const reviewId = 'review-uuid';

const mockReview = {
  id: reviewId,
  userId,
  productId,
  rating: 5,
  comment: 'Great',
  isVisible: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockPrisma = () => ({
  product: { findFirst: jest.fn() },
  orderItem: { findFirst: jest.fn() },
  review: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
});

describe('ReviewService', () => {
  let service: ReviewService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
  });

  afterEach(() => jest.clearAllMocks());

  it('creates review for a delivered purchase', async () => {
    prisma.product.findFirst.mockResolvedValue({ id: productId });
    prisma.orderItem.findFirst.mockResolvedValue({ id: 'item-uuid' });
    prisma.review.create.mockResolvedValue(mockReview);

    const result = await service.create(userId, {
      productId,
      rating: 5,
      comment: 'Great',
    });

    expect(prisma.orderItem.findFirst).toHaveBeenCalled();
    expect(prisma.review.create).toHaveBeenCalledWith({
      data: { userId, productId, rating: 5, comment: 'Great' },
    });
    expect(result).toEqual(mockReview);
  });

  it('rejects reviews without verified purchase', async () => {
    prisma.product.findFirst.mockResolvedValue({ id: productId });
    prisma.orderItem.findFirst.mockResolvedValue(null);

    await expect(
      service.create(userId, { productId, rating: 5 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('maps duplicate review errors to ConflictException', async () => {
    prisma.product.findFirst.mockResolvedValue({ id: productId });
    prisma.orderItem.findFirst.mockResolvedValue({ id: 'item-uuid' });
    prisma.review.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create(userId, { productId, rating: 5 }),
    ).rejects.toThrow(ConflictException);
  });

  it('updates own review', async () => {
    prisma.review.findFirst.mockResolvedValue(mockReview);
    prisma.review.update.mockResolvedValue({ ...mockReview, rating: 4 });

    const result = await service.updateMine(userId, reviewId, { rating: 4 });

    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: reviewId },
      data: { rating: 4 },
    });
    expect(result.rating).toBe(4);
  });

  it('throws NotFoundException when updating another user review', async () => {
    prisma.review.findFirst.mockResolvedValue(null);

    await expect(
      service.updateMine(userId, reviewId, { rating: 4 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('moderates review visibility', async () => {
    prisma.review.findUnique.mockResolvedValue(mockReview);
    prisma.review.update.mockResolvedValue({ ...mockReview, isVisible: false });

    const result = await service.moderate(reviewId, { isVisible: false });

    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: reviewId },
      data: { isVisible: false },
    });
    expect(result.isVisible).toBe(false);
  });

  it('returns review summary', async () => {
    prisma.product.findFirst.mockResolvedValue({ id: productId });
    prisma.review.aggregate.mockResolvedValue({
      _avg: { rating: 4.666 },
      _count: { id: 3 },
    });

    const result = await service.summary(productId);

    expect(result).toEqual({
      productId,
      averageRating: 4.67,
      reviewCount: 3,
    });
  });
});
