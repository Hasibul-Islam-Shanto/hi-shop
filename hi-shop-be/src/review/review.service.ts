import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    await this.ensureProductExists(dto.productId);
    await this.ensureVerifiedPurchase(userId, dto.productId);

    try {
      return await this.prisma.review.create({
        data: {
          userId,
          productId: dto.productId,
          rating: dto.rating,
          comment: dto.comment,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You already reviewed this product');
      }
      throw error;
    }
  }

  async updateMine(userId: string, id: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findFirst({ where: { id, userId } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id },
      data: dto,
    });
  }

  async removeMine(userId: string, id: string) {
    const review = await this.prisma.review.findFirst({ where: { id, userId } });
    if (!review) throw new NotFoundException('Review not found');

    await this.prisma.review.delete({ where: { id } });
    return { success: true };
  }

  async moderate(id: string, dto: ModerateReviewDto) {
    await this.findOne(id);
    return this.prisma.review.update({
      where: { id },
      data: { isVisible: dto.isVisible },
    });
  }

  async summary(productId: string) {
    await this.ensureProductExists(productId);
    const result = await this.prisma.review.aggregate({
      where: { productId, isVisible: true },
      _avg: { rating: true },
      _count: { id: true },
    });

    return {
      productId,
      averageRating: Number((result._avg.rating ?? 0).toFixed(2)),
      reviewCount: result._count.id,
    };
  }

  private async findOne(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  private async ensureProductExists(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
  }

  private async ensureVerifiedPurchase(userId: string, productId: string) {
    const purchased = await this.prisma.orderItem.findFirst({
      where: {
        order: { userId, status: OrderStatus.DELIVERED },
        productVariant: { productId },
      },
      select: { id: true },
    });

    if (!purchased) {
      throw new BadRequestException(
        'Only customers with a delivered order can review this product',
      );
    }
  }
}
