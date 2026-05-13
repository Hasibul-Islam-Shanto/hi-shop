import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { DiscountQueryDto } from './dto/discount-query.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDiscountDto) {
    this.validateDiscountShape(dto);
    try {
      return await this.prisma.discount.create({
        data: {
          code: dto.code,
          ...this.toDiscountData(dto),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Discount code already exists');
      }
      throw error;
    }
  }

  async findAll(query: DiscountQueryDto) {
    const { search, isActive, page = 1, limit = 20 } = query;
    const where: Prisma.DiscountWhereInput = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const [total, discounts] = await this.prisma.$transaction([
      this.prisma.discount.count({ where }),
      this.prisma.discount.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: discounts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('Discount not found');
    return discount;
  }

  async update(id: string, dto: UpdateDiscountDto) {
    await this.findOne(id);
    this.validateDiscountShape(dto);
    try {
      return await this.prisma.discount.update({
        where: { id },
        data: this.toDiscountData(dto),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Discount code already exists');
      }
      throw error;
    }
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.discount.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private validateDiscountShape(dto: CreateDiscountDto | UpdateDiscountDto) {
    const hasPct = dto.discountPct !== undefined;
    const hasAmt = dto.discountAmt !== undefined;
    if (hasPct && hasAmt) {
      throw new BadRequestException(
        'Use either discountPct or discountAmt, not both',
      );
    }
  }

  private toDiscountData(dto: CreateDiscountDto | UpdateDiscountDto) {
    return {
      ...(dto.code !== undefined && { code: dto.code }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.discountPct !== undefined && { discountPct: dto.discountPct }),
      ...(dto.discountAmt !== undefined && { discountAmt: dto.discountAmt }),
      ...(dto.minOrderAmt !== undefined && { minOrderAmt: dto.minOrderAmt }),
      ...(dto.maxUses !== undefined && { maxUses: dto.maxUses }),
      ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };
  }
}
