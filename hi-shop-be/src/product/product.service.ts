import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryMovementType, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import {
  ProductQueryDto,
  ProductSortBy,
  SortOrder,
} from './dto/product-query.dto';
import { ProductReviewQueryDto } from './dto/product-review-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

type AuditContext = {
  actorId?: string;
  requestId?: string;
  ipAddress?: string;
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async ensureSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.product.findFirst({
      where: { slug, ...(excludeId && { NOT: { id: excludeId } }) },
    });
    if (existing) throw new BadRequestException('Slug already in use');
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException(`Category not found`);
  }

  private buildOrderBy(
    sortBy: ProductSortBy = ProductSortBy.CREATED_AT,
    order: SortOrder = SortOrder.DESC,
  ): Prisma.ProductOrderByWithRelationInput {
    if (sortBy === ProductSortBy.PRICE) return { basePrice: order };
    if (sortBy === ProductSortBy.NAME) return { name: order };
    return { createdAt: order };
  }

  // ─── Product ─────────────────────────────────────────────────────────────────

  async create(dto: CreateProductDto) {
    await this.ensureCategoryExists(dto.categoryId);
    const slug = dto.slug ?? this.generateSlug(dto.name);
    await this.ensureSlugUnique(slug);
    const skus = dto.variants.map((v) => v.sku);
    if (new Set(skus).size !== skus.length) {
      throw new BadRequestException('Duplicate SKUs found in variants');
    }
    const existingSkus = await this.prisma.productVariant.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    });
    if (existingSkus.length > 0) {
      throw new BadRequestException(
        `SKU(s) already in use: ${existingSkus.map((s) => s.sku).join(', ')}`,
      );
    }

    return this.prisma.product.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        description: dto.description,
        basePrice: dto.basePrice,
        isActive: dto.isActive ?? true,
        variants: {
          create: dto.variants.map((v) => ({
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock,
            priceModifier: v.priceModifier ?? 0,
            isActive: v.isActive ?? true,
          })),
        },
        images: dto.images
          ? {
              create: dto.images.map((img) => ({
                url: img.url,
                altText: img.altText,
                isPrimary: img.isPrimary ?? false,
                sortOrder: img.sortOrder ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        images: true,
      },
    });
  }

  async findAll(query: ProductQueryDto) {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy,
      sortOrder,
    } = query;

    const isActive = query.isActive ?? true;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive,
      ...(categoryId && { categoryId }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            basePrice: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            description: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              stock: true,
              priceModifier: true,
            },
          },
        },
      }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByCategory(categoryId: string, query: ProductQueryDto) {
    await this.ensureCategoryExists(categoryId);
    return this.findAll({ ...query, categoryId });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { where: { isActive: true } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    if (dto.slug) {
      await this.ensureSlugUnique(dto.slug, id);
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        images: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  // ─── Reviews ─────────────────────────────────────────────────────────────────

  async findReviews(productId: string, query: ProductReviewQueryDto) {
    await this.findOne(productId);

    const { page = 1, limit = 10 } = query;

    const [total, reviews] = await this.prisma.$transaction([
      this.prisma.review.count({ where: { productId, isVisible: true } }),
      this.prisma.review.findMany({
        where: { productId, isVisible: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Variants ────────────────────────────────────────────────────────────────

  async addVariant(productId: string, dto: CreateProductVariantDto) {
    await this.findOne(productId);

    const skuExists = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
    });
    if (skuExists) throw new BadRequestException('SKU already in use');

    return this.prisma.productVariant.create({
      data: {
        productId,
        sku: dto.sku,
        size: dto.size,
        color: dto.color,
        stock: dto.stock,
        priceModifier: dto.priceModifier ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
  ) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    if (dto.sku) {
      const skuExists = await this.prisma.productVariant.findFirst({
        where: { sku: dto.sku, NOT: { id: variantId } },
      });
      if (skuExists) throw new BadRequestException('SKU already in use');
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: dto,
    });
  }

  async adjustInventory(
    productId: string,
    variantId: string,
    dto: AdjustInventoryDto,
    auditContext: AuditContext = {},
  ) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: { id: true, stock: true, sku: true },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const delta = dto.stock - variant.stock;
    return this.prisma.$transaction(async (tx) => {
      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: dto.stock },
      });

      await tx.inventoryMovement.create({
        data: {
          productVariantId: variantId,
          type:
            delta >= 0
              ? InventoryMovementType.RESTOCK
              : InventoryMovementType.ADMIN_ADJUSTMENT,
          quantity: delta,
          stockBefore: variant.stock,
          stockAfter: dto.stock,
          note: dto.note,
        },
      });

      await this.audit.create(
        {
          ...auditContext,
          action: 'INVENTORY_ADJUSTED',
          targetType: 'ProductVariant',
          targetId: variantId,
          metadata: {
            productId,
            sku: variant.sku,
            previousStock: variant.stock,
            newStock: dto.stock,
            delta,
            note: dto.note,
          },
        },
        tx,
      );

      return updatedVariant;
    });
  }

  async removeVariant(productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    // Fix #8 — prevent deleting the last variant
    const variantCount = await this.prisma.productVariant.count({
      where: { productId },
    });
    if (variantCount === 1) {
      throw new BadRequestException(
        'Cannot delete the last variant. A product must have at least one variant.',
      );
    }

    // Fix #2 — prevent FK violation if variant has order history
    const inUse = await this.prisma.orderItem.count({
      where: { productVariantId: variantId },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        'Variant has order history and cannot be deleted. Consider deactivating it instead.',
      );
    }

    await this.prisma.productVariant.delete({ where: { id: variantId } });
    return { success: true };
  }

  // ─── Images ──────────────────────────────────────────────────────────────────

  async addImage(productId: string, dto: CreateProductImageDto) {
    await this.findOne(productId);

    // Fix #4 — wrap isPrimary demotion + insert in a transaction
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.productImage.updateMany({
          where: { productId },
          data: { isPrimary: false },
        });
      }

      return tx.productImage.create({
        data: {
          productId,
          url: dto.url,
          altText: dto.altText,
          isPrimary: dto.isPrimary ?? false,
          sortOrder: dto.sortOrder ?? 0,
        },
      });
    });
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) throw new NotFoundException('Image not found');

    await this.prisma.productImage.delete({ where: { id: imageId } });
    return { success: true };
  }
}
