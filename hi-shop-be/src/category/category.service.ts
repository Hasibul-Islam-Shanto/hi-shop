import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

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
    const existing = await this.prisma.category.findFirst({
      where: { slug, ...(excludeId && { NOT: { id: excludeId } }) },
    });
    if (existing) throw new BadRequestException('Slug already in use');
  }

  private async ensureParentExists(parentId: string): Promise<void> {
    const parent = await this.prisma.category.findUnique({
      where: { id: parentId },
    });
    if (!parent) throw new NotFoundException('Parent category not found');
  }

  // Prevents circular reference: a category cannot be its own ancestor
  private async ensureNoCycle(
    categoryId: string,
    newParentId: string,
  ): Promise<void> {
    if (categoryId === newParentId) {
      throw new BadRequestException('A category cannot be its own parent');
    }

    // Walk up the ancestor chain of newParentId to ensure categoryId is not in it
    let currentId: string | null = newParentId;
    while (currentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });
      if (!parent) break;
      if (parent.parentId === categoryId) {
        throw new BadRequestException(
          'Circular reference detected: a category cannot be a descendant of itself',
        );
      }
      currentId = parent.parentId;
    }
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────────

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ?? this.generateSlug(dto.name);
    await this.ensureSlugUnique(slug);

    if (dto.parentId) {
      await this.ensureParentExists(dto.parentId);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        parentId: dto.parentId ?? null,
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
  }

  // Returns the full tree: top-level categories with nested children (2 levels deep)
  async findAllTree() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        children: {
          orderBy: { name: 'asc' },
          include: {
            children: {
              orderBy: { name: 'asc' },
              include: {
                _count: { select: { products: true } },
              },
            },
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });
    return categories;
  }

  // Returns a flat list of all categories — useful for dropdowns/selectors
  async findAllFlat() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        _count: { select: { products: true } },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.slug) {
      await this.ensureSlugUnique(dto.slug, id);
    }

    if (dto.parentId) {
      await this.ensureParentExists(dto.parentId);
      await this.ensureNoCycle(id, dto.parentId);
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Block deletion if category still has products
    const productCount = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category — it has ${productCount} active product(s). Reassign or delete them first.`,
      );
    }

    // Block deletion if category has subcategories
    const childCount = await this.prisma.category.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      throw new BadRequestException(
        `Cannot delete category — it has ${childCount} subcategorie(s). Remove or reassign them first.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }
}
